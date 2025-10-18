# HabitRPG Master Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Core State Management](#core-state-management)
3. [Database Functions](#database-functions)
4. [Custom Hooks](#custom-hooks)
5. [Key Utilities](#key-utilities)
6. [Critical Patterns & Decisions](#critical-patterns--decisions)
7. [Component Architecture](#component-architecture)

---

## Architecture Overview

### Technology Stack

**Frontend Framework**
- **Next.js 15.3.5** with React 19 - App Router architecture
- **TypeScript** for type safety
- **TailwindCSS 4** for styling with custom cyberpunk theme
- **ShadCN/UI** components with Radix UI primitives

**Backend & Database**
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Clerk** - Authentication and user management
- **Vercel** - Deployment platform

**Key Libraries**
- **Luxon** - Timezone handling and date manipulation
- **FullCalendar** - Calendar component for task scheduling
- **Lucide React** - Icon library
- **date-fns** - Date utility functions

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── api/               # API routes
│   ├── home/              # Dashboard page
│   ├── settings/          # Settings page
│   └── tasks/             # Tasks page
├── components/            # React components
│   ├── hooks/             # Custom hooks
│   ├── profile/           # Task management components
│   ├── settings/          # Settings components
│   ├── start/             # Landing page components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions and configurations
├── constants/              # Application constants
└── styles/                # Global styles
```

### Data Flow Architecture

```
User Interaction → Component → Custom Hook → Database Function → Supabase
     ↓                ↓            ↓              ↓              ↓
UI State Update → State Management → API Call → Data Processing → Database
```

**Authentication Flow:**
1. User signs in via Clerk
2. Clerk provides JWT token
3. Supabase client configured with Clerk token
4. All database operations authenticated through Supabase

### Database Schema Overview

**Core Tables:**
- `users` - User profiles and authentication data
- `user_stats` - RPG stats (gold, XP, level, health, mana)
- `task` - Task definitions and metadata
- `task_completion` - Daily task completion records
- `user_settings` - User preferences (rollover time, timezone)

**Key Relationships:**
- Users have one-to-many tasks
- Users have one-to-many task completions
- Users have one user_stats record
- Users have one user_settings record

---

## Core State Management

### Custom Hooks Pattern

The application uses a custom hooks pattern for state management, where each hook encapsulates:
- **Data fetching logic**
- **State management**
- **Error handling**
- **Race condition prevention**

### Hook Interaction Strategy

**Authentication Layer:**
```typescript
useAuthClient() → { userId, client }
```

**Data Layer:**
```typescript
useUserStats(client, userId) → { stats }
useUserSettings(client, userId) → { rolloverTimeSelected, rolloverTime }
useTasksByDay(client, userId, selectedDay) → { tasks, loading, totalTasksCompleted }
```

**State Synchronization:**
- Each hook manages its own state independently
- Hooks communicate through shared Supabase client
- Race conditions prevented using `reqIdRef` pattern
- State updates trigger re-renders in consuming components

---

## Database Functions

### User Management

#### `getUserStats(client, userId)`
**Purpose:** Retrieves user's RPG statistics
**Returns:** User stats object with gold, XP, level, health, mana
```typescript
const stats = await getUserStats(client, userId);
// Returns: { gold: 100, exp: 250, level: 3, health: 80, mana: 50, ... }
```

#### `getUserInfo(client, userId)`
**Purpose:** Gets basic user information
**Returns:** User profile data (email, username)
```typescript
const userInfo = await getUserInfo(client, userId);
// Returns: { email: "user@example.com", username: "player1" }
```

### Task Management

#### `createTask(client, userId, title, description, difficulty, date, repeatOption)`
**Purpose:** Creates a new task with specified properties
**Parameters:**
- `difficulty`: "Easy" | "Medium" | "Hard"
- `date`: YYYY-MM-DD format
- `repeatOption`: RRULE string for recurring tasks
```typescript
await createTask(client, userId, "Morning Run", "30 minute jog", "Medium", "2024-01-15", "FREQ=DAILY");
```

#### `getTaskData(client, taskId)`
**Purpose:** Retrieves specific task details
**Returns:** Complete task object with metadata

#### `removeTaskDb(client, taskId)`
**Purpose:** Deletes a task from the database
**Returns:** Supabase delete operation result

#### `getSelectedDayTasks(client, userId, date)`
**Purpose:** Fetches all tasks for a specific date
**Returns:** Array of tasks with completion status

### Reward System

#### `goldReward(client, userId, difficulty, streak, gold)`
**Purpose:** Awards gold based on task difficulty and streak
**Formula:** `difficultyMultiplier * streakMultiplier`
```typescript
// Easy task with 5-day streak: 5 * 1.71 = ~8 gold
await goldReward(client, userId, "Easy", 5, currentGold);
```

#### `expReward(client, userId, difficulty, streak, exp, level)`
**Purpose:** Awards experience points for leveling
**Formula:** Same as gold but scales with level

#### `manaReward(client, userId, difficulty, streak, mana)`
**Purpose:** Awards mana points for skill usage
**Formula:** Same as gold reward

### Streak Management

#### `increaseStreak(client, taskId)`
**Purpose:** Increments task streak counter
**Triggers:** When task is completed on consecutive days

#### `decreaseStreak(client, taskId)`
**Purpose:** Resets streak to 0
**Triggers:** When task is missed or undone

### Completion Tracking

#### `dailyCompletion(client, userId, taskId, date)`
**Purpose:** Marks task as completed for specific date
**Creates:** Record in `task_completion` table

#### `dailyTaskCheck(client, userId, date)`
**Purpose:** Checks if task was completed on specific date
**Returns:** Boolean completion status

#### `deleteTaskCompleted(client, userId, taskId, date)`
**Purpose:** Removes completion record (undo operation)

### Rollover System

#### `getUserSettings(client, userId)`
**Purpose:** Retrieves user's rollover time configuration
**Returns:** Settings object with `rollover_time` field

#### `getNextRolloverCheck(client, userId)`
**Purpose:** Determines if rollover has occurred
**Returns:** Boolean indicating rollover status

---

## Custom Hooks

### `useUserSettings`

**Purpose:** Manages user's rollover time configuration and state

**State:**
- `rolloverTimeSelected`: Boolean indicating if rollover time is configured
- `rolloverTime`: Converted rollover time in 12-hour format

**Key Features:**
- Converts 24-hour database time to 12-hour UI format
- Handles both configured and unconfigured states
- Race condition prevention with `reqIdRef`

**Usage:**
```typescript
const { rolloverTimeSelected, rolloverTime } = useUserSettings(client, userId);
```

**Implementation Details:**
- Fetches `rollover_time` from database
- Converts "14:30" → `{ hour: 2, minute: 30, period: "PM" }`
- Sets `rolloverTimeSelected = true` when time exists in database
- Resets to default when no time configured

### `useTasksByDay`

**Purpose:** Manages task fetching, completion, and undo operations for selected day

**State:**
- `tasks`: Array of tasks for selected day
- `loading`: Loading state for async operations
- `totalTasksCompleted`: Count of completed tasks

**Key Features:**
- Fetches tasks for specific date
- Handles task completion/undo operations
- Updates streaks and rewards automatically
- Manages loading states

**Usage:**
```typescript
const { tasks, loading, totalTasksCompleted, completeTask, undoTask } = useTasksByDay(client, userId, selectedDay);
```

**Implementation Details:**
- Uses `getSelectedDayTasks` to fetch tasks
- `completeTask` triggers reward calculations and streak updates
- `undoTask` reverses rewards and decreases streaks
- Handles date formatting for database queries

### `useUserStats`

**Purpose:** Fetches and tracks user's RPG statistics

**State:**
- `stats`: User statistics object with all RPG data

**Key Features:**
- Combines data from `user_stats` and `users` tables
- Provides default values for missing stats
- Race condition prevention

**Usage:**
```typescript
const { stats } = useUserStats(client, userId);
// stats: { name, health, total_health, gold, mana, total_mana, level, exp, total_exp }
```

### `useAuthClient`

**Purpose:** Provides authenticated Supabase client and user ID

**Returns:**
- `userId`: Current user's ID from Clerk
- `client`: Supabase client configured with Clerk token

**Usage:**
```typescript
const { userId, client } = useAuthClient();
```

**Implementation Details:**
- Uses Clerk's `useUser` hook for authentication
- Creates Supabase client with Clerk JWT token
- Handles authentication state changes

---

## Key Utilities

### `reward.ts`

**Purpose:** Contains all reward calculation formulas and multipliers

#### `streakMultiplier(streak)`
**Formula:** `1 + Math.min(streak / 7, 0.5)`
**Purpose:** Caps streak bonus at 50% (7+ day streaks)
```typescript
streakMultiplier(5) // Returns 1.71 (5/7 ≈ 0.71)
streakMultiplier(10) // Returns 1.5 (capped at 0.5)
```

#### `diffMultiplier(difficulty)`
**Values:**
- Easy: 5
- Medium: 8  
- Hard: 10
- Other: 0

#### `totalExpForLevel(level)`
**Formula:** Progressive scaling system
- Levels 1-10: Linear growth (100, 200, 300...)
- Levels 11-25: Quadratic growth
- Levels 26+: Exponential growth with diminishing returns

#### `computeRewardMultipliers(difficulty, streak, level)`
**Purpose:** Calculates all reward multipliers
**Returns:** Object with gold, exp, mana multipliers

### `localTimezone.ts`

**Purpose:** Handles timezone detection and conversion

#### `getLocalTimeZone()`
**Purpose:** Gets user's local timezone
**Implementation:** Uses `Intl.DateTimeFormat().resolvedOptions().timeZone`
**Usage:** Ensures rollover times work correctly across timezones

### `supabaseClient.ts`

**Purpose:** Creates authenticated Supabase client with Clerk integration

#### `useClerkSupabaseClient()`
**Purpose:** Provides Supabase client with Clerk JWT token
**Implementation:**
- Uses Clerk's `useSession` hook
- Configures Supabase with dynamic token
- Handles token refresh automatically

---

## Critical Patterns & Decisions

### Race Condition Prevention

**Pattern:** `reqIdRef` in all async hooks
**Purpose:** Prevents stale data from overwriting newer requests

**Implementation:**
```typescript
const reqIdRef = useRef(0);

useEffect(() => {
  const myReqId = ++reqIdRef.current;
  (async () => {
    const data = await fetchData();
    if (myReqId !== reqIdRef.current) return; // Cancel if newer request exists
    setData(data);
  })();
}, [dependencies]);
```

### Timezone-Aware Rollover System

**Challenge:** Daily reset must work correctly across timezones
**Solution:** 
- Store rollover time in user's local timezone
- Use Luxon for timezone conversions
- Convert 24-hour database format to 12-hour UI format

**Implementation:**
```typescript
// Database stores: "14:30" (2:30 PM)
// UI displays: { hour: 2, minute: 30, period: "PM" }
function from24HourString(pgTime: string) {
  const [hh, mm] = pgTime.split(':').map(Number);
  const period = hh >= 12 ? 'PM' : 'AM';
  let hour = hh % 12;
  if (hour === 0) hour = 12;
  return { hour, minute: mm, period };
}
```

### Streak Calculation Logic

**Rules:**
- Streak increases on consecutive task completions
- Streak resets to 0 when task is missed
- Streak affects reward multipliers (capped at 50% bonus)

**Implementation:**
- `increaseStreak()` called on task completion
- `decreaseStreak()` called on task undo or miss
- Streak multiplier applied to all rewards

### XP and Leveling Formula

**Progressive Scaling:**
- Early levels (1-10): Easy progression for engagement
- Mid levels (11-25): Moderate scaling for sustained play
- High levels (26+): Exponential scaling for long-term goals

**Purpose:** Prevents easy leveling while maintaining progression feel

### Authentication Integration

**Pattern:** Clerk + Supabase integration
**Implementation:**
- Clerk handles user authentication
- Supabase client configured with Clerk JWT
- All database operations authenticated through Supabase

---

## Component Architecture

### Profile Components (`src/components/profile/`)

**Purpose:** Core task management and user interface

#### `CreateTask.tsx`
- Modal-based task creation form
- Handles difficulty selection, date picking, repeat options
- Integrates with `createTask` database function

#### `CurrentTasks.tsx`
- Displays tasks for selected day
- Shows completion status and streaks
- Integrates with `useTasksByDay` hook

#### `TaskCard.tsx`
- Individual task display component
- Handles completion/undo operations
- Shows streak counters and difficulty indicators

#### `StatsCard.tsx`
- Displays user's RPG statistics
- Shows health bars, XP progress, gold/mana counts
- Integrates with `useUserStats` hook

#### `RolloutSelector.tsx`
- Time picker for rollover configuration
- Handles 12-hour format with AM/PM
- Integrates with `useUserSettings` hook

### Settings Components (`src/components/settings/`)

#### `SettingsCard.tsx`
- Main settings interface
- Manages rollover time configuration
- Shows timezone information

### UI Components (`src/components/ui/`)

**Purpose:** Reusable design system components

#### Standard Components
- `button.tsx`, `card.tsx`, `input.tsx` - Basic UI elements
- `calendar.tsx`, `popover.tsx`, `select.tsx` - Interactive components

#### 8bit Theme Components (`src/components/ui/8bit/`)
- Custom retro gaming aesthetic
- `health-bar.tsx`, `mana-bar.tsx`, `experience-bar.tsx` - RPG-style progress bars
- `retro.css` - Custom styling for 8bit theme

### Navigation Components

#### `Navbar.tsx`
- Top navigation with user info and theme toggle
- Handles authentication state display

#### `BottomNav.tsx`
- Mobile-first bottom navigation
- Quick access to main app sections

### Custom Hooks (`src/components/hooks/`)

**Purpose:** Encapsulate business logic and state management
- All hooks follow same pattern: data fetching + state management + error handling
- Race condition prevention built into all async operations
- Consistent API across all hooks

---

## Future Planned Features

### AI-Driven Classes & Skills System
- AI analyzes completed tasks to assign classes
- Skill trees with active abilities and passive bonuses
- Class evolution based on habit patterns

### User Collaboration
- Party system for group accountability
- Guild mechanics for larger communities
- Shared challenges and group rewards

### Boss Battles
- Monthly boss encounters requiring teamwork
- Skills and passives contribute to group success
- Unique rewards for victory, consequences for failure

### Raphael AI Guide
- Personalized reminders and tips
- Skill suggestions based on user behavior
- Adaptive difficulty recommendations

---

## Common Pitfalls & Gotchas

### Race Conditions
- Always use `reqIdRef` pattern in async hooks
- Check request ID before setting state
- Cancel previous requests when new ones start

### Timezone Issues
- Always convert times between database and UI formats
- Use Luxon for timezone-aware operations
- Test rollover functionality across different timezones

### State Management
- Don't mutate state directly
- Use proper dependency arrays in useEffect
- Handle loading states consistently

### Authentication
- Ensure Supabase client is properly configured with Clerk token
- Handle authentication state changes gracefully
- Protect routes using middleware

---

This documentation serves as the master reference for understanding the HabitRPG codebase architecture, implementation patterns, and key technical decisions. It should be updated as the codebase evolves and new features are added.
