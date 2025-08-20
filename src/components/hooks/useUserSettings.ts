'use client'
import { getUserSettings } from '@/lib/db';
import { SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState, useCallback } from 'react';

type RolloverTime = {
    hour: number;
    minute: number;
    period: 'AM' | 'PM';
  };

const useUserSettings = (client: SupabaseClient, userId?: string) => {
    const [convertedTime, setConvertedTime] = useState<RolloverTime>({ hour: 12, minute: 0, period: 'AM' })

    /**
   * This function takes the user settings data and loads it onto the page
   */
  const loadUserSettings = useCallback(async () => {
    if (!userId) return;
    const settingsInfo = await getUserSettings(client, userId)
    setConvertedTime(from24HourString(settingsInfo.rollover_time))
    }, [userId, client])

    /**
   * Converts the rollover time in the database to match the RolloverTime type fields 
   * @param pgTime The database time being coverted
   * @returns The database time converted to match RolloverTime type
   */
    function from24HourString(pgTime: string) {
        const [hh, mm] = pgTime.split(':').map(Number);
        let period: 'AM' | 'PM' = hh >= 12 ? 'PM' : 'AM';
        let hour = hh % 12;
        if (hour === 0) hour = 12; 
      
        return {
          hour,
          minute: mm,
          period,
        };
      }

    useEffect(() => {
        if(!userId) return;
        let alive = true;
        loadUserSettings();
        return () => {alive = false};
    }, [userId, client, loadUserSettings])

  return ( convertedTime )
}

export default useUserSettings
