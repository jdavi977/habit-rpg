/**
 * @fileoverview User settings and preferences hook
 * @module components/hooks/useUserSettings
 * 
 * Manages user preferences including timezone and daily rollover time.
 * Fetches and converts 24-hour time format to 12-hour format for display.
 * Used for configuring when daily tasks reset in user settings.
 */

"use client";
import { getUserSettings } from "@/lib/db";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";

/**
 * Type definition for rollover time in 12-hour format
 */
type RolloverTime = {
  hour: number;
  minute: number;
  period: "AM" | "PM";
};

/**
 * Custom hook to fetch and manage user settings
 * 
 * Fetches user settings from database and converts 24-hour time to 12-hour format.
 * Includes request ID tracking to prevent stale updates. Used in settings pages
 * to display and manage user preferences.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - User ID to fetch settings for
 * @returns {Object} Object containing:
 *   - rolloverTimeSelected: Boolean indicating if user has set a rollover time
 *   - rolloverTime: Rollover time in 12-hour format (hour, minute, AM/PM)
 * 
 * @example
 * const { rolloverTimeSelected, rolloverTime } = useUserSettings(client, userId);
 * // rolloverTime: { hour: 9, minute: 0, period: "AM" }
 */
const useUserSettings = (client: SupabaseClient, userId: string) => {
  const [rolloverTimeSelected, setRolloverTimeSelected] = useState(false);
  const [rolloverTime, setRolloverTime] = useState<RolloverTime>();
  const reqIdRef = useRef(0);

  function from24HourString(pgTime: string) {
    const [hh, mm] = pgTime.split(":").map(Number);
    const period: "AM" | "PM" = hh >= 12 ? "PM" : "AM";
    let hour = hh % 12;
    if (hour === 0) hour = 12;

    return {
      hour,
      minute: mm,
      period,
    };
  }

  useEffect(() => {
    if (!userId) return;
    const myReqId = ++reqIdRef.current;
    (async () => {
      try {
        const settingsInfo = await getUserSettings(client, userId);
        if (myReqId !== reqIdRef.current) return;
        if (settingsInfo.rollover_time !== null) {
          setRolloverTimeSelected(true);
          setRolloverTime(from24HourString(settingsInfo.rollover_time));
        } else {
          setRolloverTimeSelected(false);
          setRolloverTime(undefined);
        }
      } catch {}
    })();
    return () => {
      const currentReqId = reqIdRef.current;
      reqIdRef.current = currentReqId + 1;
    };
  }, [userId, client]);

  return { rolloverTimeSelected, rolloverTime };
};

export default useUserSettings;
