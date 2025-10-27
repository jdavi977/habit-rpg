/**
 * @fileoverview Timezone utility functions
 * @module lib/localTimezone
 * 
 * Provides functions to detect and work with user's local timezone.
 * Uses browser Intl API for accurate timezone detection.
 */

/**
 * Gets the user's local timezone
 * 
 * Returns the IANA timezone identifier for the user's local timezone.
 * Uses the browser's Intl API to detect timezone automatically.
 * 
 * @returns {string} IANA timezone identifier (e.g., "America/New_York", "Europe/London")
 * 
 * @example
 * const tz = getLocalTimeZone();
 * // Returns: "America/New_York" (if user is in Eastern Time)
 * 
 */
export function getLocalTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Gets the current local time as a formatted string
 * 
 * Returns the current time in the user's local timezone formatted as HH:MM:SS.
 * Includes hour, minute, and second components in 24-hour format.
 * 
 * @returns {string} Current time in format "HH:MM:SS" (e.g., "14:30:45")
 * 
 * @example
 * const currentTime = getCurrentLocalTime();
 * console.log(currentTime); // "14:30:45"
 */
export function getCurrentLocalTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Converts time string (HH:MM:SS) to total seconds
 * 
 * Parses a time string and converts it to total seconds since midnight.
 * Useful for time arithmetic operations.
 * 
 * @param {string} timeStr - Time string in format "HH:MM:SS" or "HH:MM"
 * @returns {number} Total seconds since midnight
 * 
 * @example
 * const seconds = timeToSeconds("13:50:00");
 * console.log(seconds); // 47400 (13*3600 + 50*60)
 */
export function timeToSeconds(timeStr: string): number {
    // Handle both "HH:MM" and "HH:MM:SS" formats
    const parts = timeStr.split(':');
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]) || 0;
    const seconds = Number(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Converts total seconds to time string (HH:MM:SS)
 * 
 * Converts seconds since midnight back to time string format.
 * Handles times that exceed 24 hours by wrapping.
 * 
 * @param {number} totalSeconds - Total seconds since midnight
 * @param {boolean} showSeconds - Whether to include seconds in output (default: true)
 * @returns {string} Time string in format "HH:MM:SS" or "HH:MM"
 * 
 * @example
 * const timeStr = secondsToTime(47400);
 * console.log(timeStr); // "13:10:00"
 * 
 * const timeStrNoSecs = secondsToTime(47400, false);
 * console.log(timeStrNoSecs); // "13:10"
 */
export function secondsToTime(totalSeconds: number, showSeconds: boolean = true): string {
    // Handle negative time (next day)
    let seconds = totalSeconds;
    if (seconds < 0) {
        seconds += 24 * 3600;
    }
    
    const hours = Math.floor(seconds / 3600) % 24;
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (showSeconds) {
        const secs = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Calculates time difference between two time strings
 * 
 * Subtracts two time strings and returns the difference.
 * Returns time until target time, handling rollover to next day if needed.
 * 
 * @param {string} currentTime - Current time in format "HH:MM:SS"
 * @param {string} targetTime - Target time in format "HH:MM:SS"
 * @param {boolean} showSeconds - Whether to show seconds in output (default: true)
 * @returns {string} Time difference in format "HH:MM:SS" or "HH:MM"
 * 
 * @example
 * const timeLeft = calculateTimeDifference("12:30:00", "13:50:00");
 * console.log(timeLeft); // "01:20:00"
 * 
 * const timeLeftNoSecs = calculateTimeDifference("12:30:00", "13:50:00", false);
 * console.log(timeLeftNoSecs); // "01:20"
 * 
 * const nextDay = calculateTimeDifference("14:00:00", "13:50:00", false);
 * console.log(nextDay); // "23:50" (time until next day's target)
 */
export function calculateTimeDifference(currentTime: string, targetTime: string, showSeconds: boolean = true): string {
    const current = timeToSeconds(currentTime);
    const target = timeToSeconds(targetTime);
    
    let diff = target - current;
    
    // If target is earlier in the day, it's tomorrow
    if (diff < 0) {
        diff += 24 * 3600;
    }
    
    return secondsToTime(diff, showSeconds);
}

