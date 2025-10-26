import { RRule } from "rrule";

/**
 * Gets the next occurrence of a task after a given date
 * @param rruleString The RRULE string from database
 * @param startDate The task's start date
 * @param afterDate The date to find the next occurence for the task
 * @returns Next occurence date of the task or null if no more occurences
 */
export function getNextOccurenceAfterDate(
  rruleString: string,
  startDate: string,
  afterDate: string
): string | null {
  try {
    // Parsing the start date
    const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
    const dtStart = new Date(Date.UTC(startYear, startMonth - 1, startDay));

    /// Parsing the after date
    const [afterYear, afterMonth, afterDay] = afterDate.split("-").map(Number);
    const afterDateObj = new Date(
      Date.UTC(afterYear, afterMonth - 1, afterDay)
    );

    // If after date is before start date, return start date
    if (afterDateObj < dtStart) {
      return startDate;
    }

    // Current format "2025-02-19T00.00.000Z"
    // Parsing the RRULE to get this format
    // 20250219
    // RRULE:FREQ=DAILY
    const rrule = RRule.fromString(`DTSTART:${dtStart
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "")}
        \nRRULE:${rruleString}`);

    // Checking the next occurence date based on the given date and rrule
    const nextOccurrence = rrule.after(afterDateObj, true);

    if (!nextOccurrence) {
      return null;
    }

    return nextOccurrence.toISOString().split("T")[0];
  } catch (error) {
    console.error("Error getting next occurence:", error);
    return null;
  }
}

/**
 * Gets all occurences of a task between two dates
 * @param rruleString The RRULE string from database
 * @param startDate The date the task started at
 * @param fromDate Start of date range to check
 * @param toDate End of date range to check
 * @returns Array of occurence dates
 */
export function getAllOccurrencesBetween(
  rruleString: string,
  startDate: string,
  fromDate: string,
  toDate: string
): string[] {
  try {
    const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
    const dtStart = new Date(Date.UTC(startYear, startMonth - 1, startDay));

    const [fromYear, fromMonth, fromDay] = fromDate.split("-").map(Number);
    const fromDateObj = new Date(Date.UTC(fromYear, fromMonth - 1, fromDay));

    const [toYear, toMonth, toDay] = toDate.split("-").map(Number);
    const toDateObj = new Date(Date.UTC(toYear, toMonth - 1, toDay));

    // Current format "2025-02-19T00.00.000Z"
    // Parsing the RRULE to get this format
    // 20250219
    // RRULE:FREQ=DAILY
    const rrule = RRule.fromString(`DTSTART:${dtStart
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "")}
            \nRRULE:${rruleString}`);

    // Returns occurences between fromDate and toDate
    const occurences = rrule.between(fromDateObj, toDateObj, true);

    return occurences.map((occurence) => occurence.toISOString().split("T")[0]);
  } catch (error) {
    console.error("Error getting occurences between dates:", error);
    return [];
  }
}

/**
 * Checks if a completion was on time
 * @param completedAt When the task was completed
 * @param dueDate The date the task was due
 * @param rolloverTime The user's rollover time
 * @param timezone User's timezone
 * @returns true if completed on time, false if late
 */
export function isCompletionOnTime(
  completedAt: string,
  dueDate: string,
  rolloverTime: string,
  timezone: string
): boolean {
  try {
    const deadlineDate = new Date(`${dueDate}T${rolloverTime}:00`);

    const completionDate = new Date(completedAt);

    const completionInUserTz = new Date(
      completionDate.toLocaleString("en-US", { timeZone: timezone })
    );

    const deadlineInUserTz = new Date(
      deadlineDate.toLocaleString("en-US", { timeZone: timezone })
    );

    return completionInUserTz <= deadlineInUserTz;
  } catch (error) {
    console.error("Error checking completion time:", error);
    return false;
  }
}

/**
 * Determines if a streak should be reset based on missed completions
 * @param task Task object with rrule and start date
 * @param lastCompletion Last completion date
 * @param currentDate Current date
 * @param rolloverTime User's rollover time
 * @param timezone User's timezone
 * @param completedDates Array of dates when the task has been completed
 * @returns true if streaks should be reset, false if it should continue
 */
export function shouldStreakBeReset(
  task: { rrule: string; date: string },
  lastCompletion: string,
  currentDate: string,
  rolloverTime: string,
  timezone: string,
  completedDates: string[]
): boolean {
  try {
    if (!task.rrule || task.rrule === "DNR") {
      return false;
    }

    const expectedOccurences = getAllOccurrencesBetween(
      task.rrule,
      task.date,
      lastCompletion,
      currentDate
    );

    const remainingOccurrences = expectedOccurences.filter(
      (date) => date !== lastCompletion
    );

    for (const occurenceDate of remainingOccurrences) {
      const wasCompleted = completedDates.includes(occurenceDate);
      if (!wasCompleted) {
        const currentTime = new Date().toISOString();
        const isDeadlinePassed = !isCompletionOnTime(
          currentTime,
          occurenceDate,
          rolloverTime,
          timezone
        );

        if (isDeadlinePassed) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking if streak should be reset:", error);
    return true;
  }
}

/**
 * Determines if the tasks have been consecutively completed since the last due date
 * @param task the task being checked
 * @param completionDate current completion due date
 * @param lastCompletion last completion due date
 * @returns true if the task have been executed consecutively
 */
export function isConsecutiveCompletion(
  task: { rrule: string; date: string },
  completionDate: string,
  lastCompletion: string
): boolean {
  try {
    if (!task.rrule || task.rrule === "DNT") {
      return true;
    }
    // checks last completion next due date occurence
    const nextExpected = getNextOccurenceAfterDate(
      task.rrule,
      task.date,
      lastCompletion
    );
    // if nextExpected is the same as completionDate, then tasks have been completed consecutively
    return nextExpected === completionDate;
  } catch (error) {
    console.error("Error checking consecutive completion:", error);
    return false;
  }
}
