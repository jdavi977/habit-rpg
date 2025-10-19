# RRULE Implementation Guide for HabitRPG

## Overview
This guide will walk you through implementing a recurring task system using RRULE (Recurrence Rule) - the industry-standard format for representing repeating events. By the end, your tasks will properly repeat daily, weekly, monthly, or on weekdays.

---

## Table of Contents
1. [Understanding the Problem](#understanding-the-problem)
2. [What is RRULE?](#what-is-rrule)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Testing Your Implementation](#testing-your-implementation)
5. [Common Pitfalls](#common-pitfalls)

---

## Understanding the Problem

### Current Behavior
Right now, when you create a task:
- You store `date: "2024-01-15"` and `rrule: "D"` (for Daily)
- Your `getSelectedDayTasks()` queries: `SELECT * FROM task WHERE date = '2024-01-15'`
- **Problem**: A daily task created on Jan 15 won't appear on Jan 16 because the database only matches exact dates

### Desired Behavior
- Store `date: "2024-01-15"` and `rrule: "FREQ=DAILY"`
- Query ALL user tasks, then filter which ones occur on the selected date
- A daily task created on Jan 15 will appear on Jan 15, 16, 17, etc.

---

## What is RRULE?

RRULE is from the iCalendar specification (RFC 5545). It's a string format that describes recurring events.

### RRULE Format Examples

```
FREQ=DAILY
→ Repeats every day

FREQ=WEEKLY
→ Repeats every week on the same day (if created on Monday, repeats on Mondays)

FREQ=MONTHLY
→ Repeats every month on the same date (if created on 15th, repeats on 15th)

FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR
→ Repeats every weekday (Monday through Friday)
```

### Why Use RRULE?
- ✅ Industry standard (used by Google Calendar, Outlook, Apple Calendar)
- ✅ Well-tested libraries available
- ✅ Easy to extend later (add end dates, custom intervals, etc.)
- ✅ More reliable than writing your own recurrence logic

---

## Step-by-Step Implementation

### Step 1: Install the RRULE Library

Open your terminal and run:
```bash
npm install rrule
```

This library will:
- Parse RRULE strings
- Calculate which dates a task occurs on
- Handle all the complex date math for you

---

### Step 2: Create RRULE Helper Functions

Create a new file: `src/lib/rruleHelper.ts`

```typescript
import { RRule } from 'rrule';

/**
 * Converts your simple repeat codes to proper RRULE strings
 * @param repeatCode - Your current codes: "D", "W", "M", "DW", "DNR"
 * @param startDate - The date the task starts (first occurrence)
 * @returns RRULE string or null for non-repeating tasks
 */
export function generateRRule(repeatCode: string, startDate: Date): string | null {
  // Handle non-repeating tasks
  if (repeatCode === "DNR" || !repeatCode) {
    return null;
  }

  // Create RRule based on repeat option
  let rrule: RRule;
  
  switch (repeatCode) {
    case "D": // Daily
      rrule = new RRule({
        freq: RRule.DAILY,
        dtstart: startDate,
      });
      break;
      
    case "W": // Weekly (same day of week)
      rrule = new RRule({
        freq: RRule.WEEKLY,
        dtstart: startDate,
      });
      break;
      
    case "M": // Monthly (same date each month)
      rrule = new RRule({
        freq: RRule.MONTHLY,
        dtstart: startDate,
      });
      break;
      
    case "DW": // Weekdays only
      rrule = new RRule({
        freq: RRule.WEEKLY,
        byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
        dtstart: startDate,
      });
      break;
      
    default:
      return null;
  }

  // Return just the RRULE part (without DTSTART prefix)
  return rrule.toString().split('\n')[0].replace('RRULE:', '');
}

/**
 * Checks if a task with given RRULE occurs on a specific date
 * @param rruleString - The RRULE string from database
 * @param startDate - The task's start date (YYYY-MM-DD format)
 * @param checkDate - The date to check (YYYY-MM-DD format)
 * @returns true if task occurs on checkDate
 */
export function doesTaskOccurOnDate(
  rruleString: string,
  startDate: string,
  checkDate: string
): boolean {
  try {
    // Parse the start date
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const dtstart = new Date(Date.UTC(startYear, startMonth - 1, startDay));
    
    // Parse the check date
    const [checkYear, checkMonth, checkDay] = checkDate.split('-').map(Number);
    const checkDateObj = new Date(Date.UTC(checkYear, checkMonth - 1, checkDay));
    
    // If check date is before start date, task doesn't occur yet
    if (checkDateObj < dtstart) {
      return false;
    }
    
    // Parse the RRULE
    const rrule = RRule.fromString(`DTSTART:${dtstart.toISOString().split('T')[0].replace(/-/g, '')}\nRRULE:${rruleString}`);
    
    // Check if the date is in the occurrences
    // Get occurrences from start date to check date + 1 day
    const after = new Date(dtstart);
    const before = new Date(checkDateObj);
    before.setDate(before.getDate() + 1); // Include the check date
    
    const occurrences = rrule.between(after, before, true);
    
    // Check if any occurrence matches the check date
    return occurrences.some(occurrence => {
      const occDate = occurrence.toISOString().split('T')[0];
      return occDate === checkDate;
    });
    
  } catch (error) {
    console.error('Error checking RRULE occurrence:', error);
    return false;
  }
}

/**
 * Helper to format a Date object as YYYY-MM-DD
 */
export function formatDateForDb(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

**What's happening here:**

1. **`generateRRule()`**: Converts your simple codes ("D", "W", etc.) into proper RRULE strings
   - Takes the repeat code and start date
   - Creates an RRule object using the library
   - Returns the RRULE string to store in database

2. **`doesTaskOccurOnDate()`**: Determines if a task occurs on a specific date
   - Parses the RRULE string from database
   - Uses the library to calculate occurrences between start date and check date
   - Returns true if the task should appear on that date

3. **`formatDateForDb()`**: Helper to ensure consistent date formatting

---

### Step 3: Update Task Creation (`CreateTask.tsx`)

Find your `handleSubmit` function in `src/components/profile/CreateTask.tsx`:

**Current code (around line 49-68):**
```typescript
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  if (!userId) return;
  if (!title.trim()) return alert("Please enter a task title");
  if (!difficulty) return alert("Please select a difficulty");
  if (!selectedDates) return alert("Please select a date");
  if (repeatOptions == "") return alert("Please choose a repeat option");

  const date = updateSelectedDate(selectedDates);

  createTask(
    client,
    userId,
    title,
    description,
    difficulty,
    date,
    repeatOptions  // ← Currently passing "D", "W", etc.
  );

  resetForm();
  setIsModalOpen(false);
  window.location.reload();
}
```

**Update it to:**
```typescript
import { generateRRule } from '@/lib/rruleHelper';  // ← Add this import at top

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  if (!userId) return;
  if (!title.trim()) return alert("Please enter a task title");
  if (!difficulty) return alert("Please select a difficulty");
  if (!selectedDates) return alert("Please select a date");
  if (repeatOptions == "") return alert("Please choose a repeat option");

  const date = updateSelectedDate(selectedDates);
  
  // Convert repeat option to RRULE string
  const rruleString = generateRRule(repeatOptions, selectedDates);

  createTask(
    client,
    userId,
    title,
    description,
    difficulty,
    date,
    rruleString || "DNR"  // ← Now passing RRULE string or "DNR"
  );

  resetForm();
  setIsModalOpen(false);
  window.location.reload();
}
```

**What changed:**
- Import the `generateRRule` helper
- Convert `repeatOptions` to proper RRULE string before saving
- Pass RRULE string to `createTask()` instead of simple code

---

### Step 4: Update Database Query (`db.ts`)

Find `getSelectedDayTasks()` in `src/lib/db.ts` (around line 385):

**Current code:**
```typescript
export async function getSelectedDayTasks(
  client: SupabaseClient,
  date: string
) {
  const { data, error } = await client.from("task").select().eq("date", date);
  if (error) throw error;
  return data;
}
```

**Update it to:**
```typescript
import { doesTaskOccurOnDate } from './rruleHelper';  // ← Add this import at top

export async function getSelectedDayTasks(
  client: SupabaseClient,
  userId: string,  // ← Added userId parameter
  date: string
) {
  // Get ALL tasks for this user (not just matching date)
  const { data, error } = await client
    .from("task")
    .select()
    .eq("user_id", userId);
    
  if (error) throw error;
  if (!data) return [];
  
  // Filter tasks to only those that occur on this date
  return data.filter(task => {
    // Non-repeating task: check exact date match
    if (!task.rrule || task.rrule === "DNR") {
      return task.date === date;
    }
    
    // Repeating task: use RRULE to check if it occurs on this date
    return doesTaskOccurOnDate(task.rrule, task.date, date);
  });
}
```

**What changed:**
1. Added `userId` parameter so we can query all user's tasks
2. Query ALL tasks for the user (removed date filter)
3. Filter tasks in JavaScript to check RRULE occurrences
4. Non-repeating tasks still use exact date matching
5. Repeating tasks use `doesTaskOccurOnDate()` to determine if they occur

**Why this works:**
- A daily task created on Jan 15 will have `rrule: "FREQ=DAILY"`
- When checking Jan 16, `doesTaskOccurOnDate()` returns true
- Task appears on Jan 16 (and every day after)

---

### Step 5: Update the Hook (`useTasksByDay.ts`)

Find the `refresh` function in `src/components/hooks/useTasksByDay.ts` (around line 53):

**Current code:**
```typescript
const refresh = useCallback(async () => {
  if (!client || !userId || !selectedDay) return;
  setLoading(true);
  try {
    if (!date) {
      setTasks([]);
      setLoading(false);
      return;
    }
    const taskForDay = (await getSelectedDayTasks(client, date)) ?? [];
    // ... rest of code
```

**Update it to:**
```typescript
const refresh = useCallback(async () => {
  if (!client || !userId || !selectedDay) return;
  setLoading(true);
  try {
    if (!date) {
      setTasks([]);
      setLoading(false);
      return;
    }
    // Pass userId to getSelectedDayTasks
    const taskForDay = (await getSelectedDayTasks(client, userId, date)) ?? [];
    // ... rest of code stays the same
```

**What changed:**
- Now passing `userId` to `getSelectedDayTasks()` as required by the updated function signature

---

### Step 6: Handle Existing Tasks (Optional)

If you have existing tasks in your database with old format (`rrule: "D"`), you have two options:

**Option A: Keep backward compatibility**

Update `doesTaskOccurOnDate()` to handle old format:

```typescript
export function doesTaskOccurOnDate(
  rruleString: string,
  startDate: string,
  checkDate: string
): boolean {
  // Handle old format codes
  if (rruleString === "D") rruleString = "FREQ=DAILY";
  if (rruleString === "W") rruleString = "FREQ=WEEKLY";
  if (rruleString === "M") rruleString = "FREQ=MONTHLY";
  if (rruleString === "DW") rruleString = "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR";
  
  // ... rest of function
}
```

**Option B: Migrate existing data**

Run a SQL migration to update existing tasks:

```sql
UPDATE task SET rrule = 'FREQ=DAILY' WHERE rrule = 'D';
UPDATE task SET rrule = 'FREQ=WEEKLY' WHERE rrule = 'W';
UPDATE task SET rrule = 'FREQ=MONTHLY' WHERE rrule = 'M';
UPDATE task SET rrule = 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' WHERE rrule = 'DW';
UPDATE task SET rrule = 'DNR' WHERE rrule = '' OR rrule IS NULL;
```

---

## Testing Your Implementation

### Test 1: Daily Task
1. Create a task on January 15th with "Daily" repeat
2. Check January 15th → Task should appear ✅
3. Check January 16th → Task should appear ✅
4. Check January 17th → Task should appear ✅

### Test 2: Weekly Task
1. Create a task on Monday (Jan 15) with "Weekly" repeat
2. Check Monday Jan 15 → Should appear ✅
3. Check Tuesday Jan 16 → Should NOT appear ❌
4. Check Monday Jan 22 → Should appear ✅

### Test 3: Monthly Task
1. Create a task on January 15th with "Monthly" repeat
2. Check January 15th → Should appear ✅
3. Check January 16th → Should NOT appear ❌
4. Check February 15th → Should appear ✅

### Test 4: Weekday Task
1. Create a task on Monday (Jan 15) with "Every Weekday"
2. Check Mon-Fri → Should appear ✅
3. Check Saturday/Sunday → Should NOT appear ❌

### Test 5: Non-Repeating Task
1. Create a task on January 15th with "Does Not Repeat"
2. Check January 15th → Should appear ✅
3. Check January 16th → Should NOT appear ❌

---

## Common Pitfalls

### Pitfall 1: Date Format Confusion
**Problem:** JavaScript Date objects can be tricky with timezones

**Solution:** Always work with UTC dates or be consistent with your timezone handling
```typescript
// Good: Use UTC
const date = new Date(Date.UTC(2024, 0, 15));

// Bad: Timezone-dependent
const date = new Date(2024, 0, 15);
```

### Pitfall 2: Off-by-One Errors
**Problem:** `between()` might not include the end date

**Solution:** Always add 1 day to your upper bound
```typescript
before.setDate(before.getDate() + 1); // Include the check date
```

### Pitfall 3: Performance Issues
**Problem:** Querying ALL user tasks might be slow with many tasks

**Solution:** Add database indexes on `user_id` and consider:
- Caching results
- Adding an end date to RRULE to limit occurrences
- Only query tasks created before/around the check date

### Pitfall 4: Start Date Before Creation
**Problem:** Task might appear on dates before it was created

**Solution:** Always check if checkDate >= startDate
```typescript
if (checkDateObj < dtstart) {
  return false;
}
```

---

## Advanced Features (Future Enhancements)

Once basic RRULE is working, you can easily add:

### 1. End Dates
```typescript
const rrule = new RRule({
  freq: RRule.DAILY,
  dtstart: startDate,
  until: endDate  // ← Stop repeating after this date
});
```

### 2. Custom Intervals
```typescript
const rrule = new RRule({
  freq: RRule.DAILY,
  interval: 3,  // ← Every 3 days instead of every day
  dtstart: startDate
});
```

### 3. Specific Days
```typescript
const rrule = new RRule({
  freq: RRule.WEEKLY,
  byweekday: [RRule.MO, RRule.WE, RRule.FR],  // ← Only Mon, Wed, Fri
  dtstart: startDate
});
```

### 4. Exception Dates
```typescript
const rrule = new RRule({
  freq: RRule.DAILY,
  dtstart: startDate
});
// Then separately store exception dates (skipped dates)
```

---

## Debugging Tips

### Check Generated RRULE Strings
Add console.log to see what's being generated:
```typescript
const rruleString = generateRRule(repeatOptions, selectedDates);
console.log('Generated RRULE:', rruleString);
```

### Check Occurrence Calculation
Add logging to `doesTaskOccurOnDate()`:
```typescript
console.log(`Checking if task occurs on ${checkDate}:`, {
  rruleString,
  startDate,
  occurrences: occurrences.map(d => d.toISOString().split('T')[0])
});
```

### Verify Database Storage
Check what's actually stored in your database:
```sql
SELECT id, title, date, rrule FROM task WHERE user_id = 'your-user-id';
```

---

## Summary

You've now implemented a robust recurring task system! Here's what you accomplished:

1. ✅ Installed RRULE library
2. ✅ Created helper functions to convert and check RRULE strings
3. ✅ Updated task creation to generate proper RRULE strings
4. ✅ Modified database query to filter by RRULE occurrences
5. ✅ Updated hook to pass required parameters

**Result:** Tasks now properly repeat according to their schedule, appearing on all relevant dates!

---

## Need Help?

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| Tasks not appearing on repeat dates | Check console logs in `doesTaskOccurOnDate()` |
| "Cannot read property of undefined" | Ensure `userId` is being passed correctly |
| Wrong dates appearing | Verify timezone handling in date parsing |
| Old tasks not working | Add backward compatibility for old format |

Good luck with your implementation! 🚀

