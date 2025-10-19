import { RRule } from "rrule";

/**
 * Converts the repeatCodeto RRULE strings
 * @param repeatCode current repeat codes
 * @param startDate date the task first starts
 * @returns RRULE string or null for non-repeating tasks
 */
export function generateRRule(
  repeatCode: string,
  startDate: Date
): string | null {
  if (repeatCode === null || !repeatCode) {
    return null;
  }

  // This generates the rrule based on the repeatCode
  let rrule: RRule;

  switch (repeatCode) {
    case "D": // Daily
      rrule = new RRule({
        freq: RRule.DAILY,
        dtstart: startDate,
      });
      break;
    case "W": // Weekly
      rrule = new RRule({
        freq: RRule.WEEKLY,
        dtstart: startDate,
      });
      break;
    case "M": // Monthly
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

  // currently rrule is DTSTART:20251018T000000Z\nRRULE:FREQ=DAILY
  // we split at \n and take [1] and replace RRULE to get FREQ=DAILY
  return rrule.toString().split("\n")[1].replace("RRULE:", "");
}

/**
 * Checks if a task with given RRUlE occurs on a specific date
 * @param rruleString The RRULE string from database
 * @param startDate The task's start date
 * @param checkDate The date to check
 * @returns true if task occurs on checkDate
 */
export function doesTaskRepeatOnDate(
  rruleString: string,
  startDate: string,
  checkDate: string
): boolean {
    try {
        // converting startDate to array of Numbers
        const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
        // startMonth -1 as Javascript months are 0-indexed while Date strings are 1-indexed
        const dtStart = new Date(Date.UTC(startYear, startMonth - 1, startDay));

        const [checkYear, checkMonth, checkDay] = checkDate.split('-').map(Number);
        const checkDateObj = new Date(Date.UTC(checkYear, checkMonth - 1, checkDay));

        // Task has not occured yet
        if (checkDateObj < dtStart) {
            return false;
        }

        // dtStart.toISOString() converts dtStart to ISO string format such as "2025-02-19T00.00.000Z"
        // we split from the T and take only the first part giving us "2025-02-10"
        // now we replace - globally to get "20250210"
        // Next we print a new line giving us 
        // 20250210
        // RRULE:FREQ=DAILY
        const rrule = RRule.fromString(`DTSTART:${dtStart.toISOString().split('T')[0].replace(/-/g, '')}
        \nRRULE:${rruleString}`);

        // marking the date to start searching 
        const after = new Date(dtStart);
        // marking the date to search up to 
        const before = new Date(checkDateObj);
        // we add +1 day as the rrule.between will not include the day of before, so we add 1 day to include it
        before.setDate(before.getDate() + 1);

        // occurences returns an array of Date objects for all occurences
        // third parameter "true" includesthe start date in the results
        const occurences = rrule.between(after, before, true);

        // returns true if any of the occurences match the checkDate
        return occurences.some(occurence => {
            const occDate = occurence.toISOString().split('T')[0];
            return occDate === checkDate;
        });
    } catch (error) {
        console.error('Error checking RRULE occurence:', error);
        return false;
    }
}
