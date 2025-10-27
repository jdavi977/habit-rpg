/**
 * @fileoverview Countdown timer to next task reset
 * @module components/profile/TimeLeft
 * 
 * Displays the remaining time until the next daily task reset.
 * Calculates time difference between current time and user's rollover time.
 */

"use client";

import { getUserSettings } from '@/lib/db'
import { getCurrentLocalTime, calculateTimeDifference } from '@/lib/localTimezone';
import { SupabaseClient } from '@supabase/supabase-js'
import React, { useEffect, useState } from 'react'

type TimeLeftProps = {
    client: SupabaseClient;
    userId: string;
}

/**
 * Component that displays time remaining until next task reset
 * 
 * Calculates and displays the time difference between current time
 * and user's configured rollover time. Updates in real-time.
 * 
 * @param {TimeLeftProps} props - Component props
 * @returns {JSX.Element} Time remaining display
 */
const TimeLeft = ({client, userId}: TimeLeftProps) => {
    const [remainingTime, setRemainingTime] = useState<string | undefined>();
    const [rolloverTime, setRolloverTime] = useState<string | undefined>();

    // Fetch rollover time once on mount
    useEffect(() => {
        const fetchSettings = async () => {
            const settings = await getUserSettings(client, userId);
            
            if (settings?.rollover_time) {
                setRolloverTime(settings.rollover_time);
            }
        };
        
        void fetchSettings();
    }, [client, userId]);

    // Update time every second
    useEffect(() => {
        if (!rolloverTime) return;

        const updateTime = () => {
            const currentTime = getCurrentLocalTime();
            const timeLeft = calculateTimeDifference(currentTime, rolloverTime, false);
            setRemainingTime(timeLeft);
        };

        // Update immediately
        updateTime();

        // Then update every second
        const interval = setInterval(updateTime, 1000);

        return () => clearInterval(interval);
    }, [rolloverTime])

  if (!rolloverTime) {
    return null; // Don't show if no rollover time configured
  }

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg">
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
      <span className="text-blue-400 text-sm font-medium">
        Reset in: {remainingTime || "..."}
      </span>
    </div>
  )
}

export default TimeLeft
