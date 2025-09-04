'use client'
import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { saveUserRollover } from '@/lib/db'
import { SupabaseClient } from '@supabase/supabase-js'
import { DateTime } from "luxon";

/**
 * Interface that defines the shape of these props
 */
interface TimeSelectorProp {
    onTimeChange?: (time: {hour: number, minute: number, period: 'AM' | 'PM'}) => void
    tz: string;
    initialTime?: {hour: number, minute: number, period: 'AM' | 'PM'}
    userId?: string | null 
    client: SupabaseClient
}

/**
 * RolloutSelector component where the user is able to update their daily reset time
 * @param param0 
 * @returns 
 */
const RolloutSelector = ({client, tz, onTimeChange, initialTime, userId} : TimeSelectorProp) => {
    // The daily reset time selected by the user
    const [selectedHour, setSelectedHour] = useState(initialTime?.hour || 12)
    const [selectedMinute, setSelectedMinute] = useState(initialTime?.minute || 0)
    const [selectedPeriod, setSelectedPeriod] = useState(initialTime?.period || 'AM')

    // The display reset time shown to the user
    const [displayHour, setDisplayHour] = useState(initialTime?.hour || 12)
    const [displayMinute, setDisplayMinute] = useState(initialTime?.minute || 0)
    const [displayPeriod, setDisplayPeriod] = useState(initialTime?.period || 'AM')

    /**
     * Once there is a change to either selectedHour, selectedMinute, or selectedPeriod it will check and run onTimeChange
     */
    useEffect(() => {
      if (onTimeChange) {
        onTimeChange({hour: selectedHour, minute: selectedMinute, period: selectedPeriod})
      }
    }, [selectedHour, selectedMinute, selectedPeriod, onTimeChange])

    /**
     * Function to apply the save time
     */
    const applyChanges = () => {
      if (!userId)
        return
      setSelectedHour(displayHour)
      setSelectedMinute(displayMinute)
      setSelectedPeriod(displayPeriod)
      const timeConversion = to24HourString(displayHour, displayMinute, displayPeriod)
      const nextRollover = computeNextRolloverUTC(tz, timeConversion)
      saveUserRollover(client, tz, userId, timeConversion, nextRollover)
    }

    /**
     * Function to convert to time on database
     */
    const to24HourString = (hour: number, minute: number, period: 'AM' | 'PM') => {
      let h = hour % 12;
      if (period === "PM") h += 12;
      return `${h.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    }

    const computeNextRolloverUTC = (tz: string, rolloverTime: string): string => {
      const [h, m] = rolloverTime.split(":").map(Number);
      const nowLocal = DateTime.now().setZone(tz);

      const todayRollover = nowLocal.set({ hour: h, minute: m, second: 0, millisecond: 0 });

      const nextRollover = nowLocal > todayRollover ? todayRollover.plus({ days: 1 }) : todayRollover;

      return nextRollover.toUTC().toISO() || '';
    }

  return (
    <div>
      <div className="flex items-center justify-center gap-2">
        {/* Hour Selector */}
        <div className='flex flex-col items-center'>
          <Button
            onClick={() => setDisplayHour(
              (displayHour == 12 ? 1 : displayHour + 1)
            )}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <div>
            {displayHour}
          </div>
          <Button
            onClick={() => setDisplayHour(
              (displayHour == 1 ? 12 : displayHour - 1)
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        <div className='flex'>
        <span className="text-2xl font-bold text-gray-400">:</span>
        </div>
        {/* Minute Selector */}
        <div className='flex flex-col items-center'>
          <Button
            onClick={() => setDisplayMinute(
              (displayMinute == 30 ? 0 : 30)
            )}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <div>
            {(displayMinute == 0 ? "00" : displayMinute)}
          </div>
          <Button
            onClick={() => setDisplayMinute(
              (displayMinute == 30 ? 0 : 30)
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        {/* Period Selector */}
        <div className='flex flex-col items-center'>
          <Button
            onClick={() => setDisplayPeriod(
              (displayPeriod ==  "AM" ? "PM" : "AM")
            )}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <div>
            {displayPeriod}
          </div>
          <Button
            onClick={() => setDisplayPeriod(
              (displayPeriod ==  "AM" ? "PM" : "AM")
            )}
          >
            <ChevronDown className="h-4 w-4" />
            </Button>
        </div>
      </div>
        {/* APPLY BUTTON */}
        <div className='flex justify-center justify-content pt-5'>
          <Button
            onClick={applyChanges}
          >
            <p>Apply</p>
          </Button>
        </div>
    </div>
  )
}

export default RolloutSelector
