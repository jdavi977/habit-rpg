/**
 * Helper function to get the local timezone
 * @returns user local timezone
 */
export function getLocalTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
