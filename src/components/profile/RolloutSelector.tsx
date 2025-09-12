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
      window.location.reload()
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

      const isoString = nextRollover.toUTC().toISO();
      if (!isoString) {
        throw new Error('Failed to compute next rollover time');
      }
      return isoString;
    }

  return (
    <div className="space-y-6">
      {/* Time Display Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-cyber-text-bright mb-2">Select Reset Time</h3>
        <p className="text-sm text-cyber-text-muted">Choose when your daily tasks reset</p>
      </div>

      {/* Time Selector Container */}
      <div className="bg-cyber-terminal-bg/50 border border-cyber-line-color rounded-lg p-6">
        <div className="flex items-center justify-center gap-6">
          {/* Hour Selector */}
          <div className='flex flex-col items-center space-y-2'>
            <Button
              onClick={() => setDisplayHour(
                (displayHour == 12 ? 1 : displayHour + 1)
              )}
              className="bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-line-color hover:border-cyber-blue-bright transition-all duration-200 hover:shadow-lg hover:shadow-cyber-glow-primary/20"
              size="sm"
            >
              <ChevronUp className="h-4 w-4 text-cyber-blue-bright" />
            </Button>
            <div className="bg-cyber-dark border border-cyber-line-color rounded-lg px-4 py-2 min-w-[60px] text-center">
              <span className="text-2xl font-mono font-bold text-cyber-blue-bright">
                {displayHour.toString().padStart(2, '0')}
              </span>
            </div>
            <Button
              onClick={() => setDisplayHour(
                (displayHour == 1 ? 12 : displayHour - 1)
              )}
              className="bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-line-color hover:border-cyber-blue-bright transition-all duration-200 hover:shadow-lg hover:shadow-cyber-glow-primary/20"
              size="sm"
            >
              <ChevronDown className="h-4 w-4 text-cyber-blue-bright" />
            </Button>
          </div>

          {/* Colon Separator */}
          <div className='flex items-center justify-center h-20'>
            <span className="text-3xl font-bold text-cyber-blue-bright animate-pulse">:</span>
          </div>

          {/* Minute Selector */}
          <div className='flex flex-col items-center space-y-2'>
            <Button
              onClick={() => setDisplayMinute(
                (displayMinute == 30 ? 0 : 30)
              )}
              className="bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-line-color hover:border-cyber-blue-bright transition-all duration-200 hover:shadow-lg hover:shadow-cyber-glow-primary/20"
              size="sm"
            >
              <ChevronUp className="h-4 w-4 text-cyber-blue-bright" />
            </Button>
            <div className="bg-cyber-dark border border-cyber-line-color rounded-lg px-4 py-2 min-w-[60px] text-center">
              <span className="text-2xl font-mono font-bold text-cyber-blue-bright">
                {(displayMinute == 0 ? "00" : displayMinute)}
              </span>
            </div>
            <Button
              onClick={() => setDisplayMinute(
                (displayMinute == 30 ? 0 : 30)
              )}
              className="bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-line-color hover:border-cyber-blue-bright transition-all duration-200 hover:shadow-lg hover:shadow-cyber-glow-primary/20"
              size="sm"
            >
              <ChevronDown className="h-4 w-4 text-cyber-blue-bright" />
            </Button>
          </div>

          {/* Period Selector */}
          <div className='flex flex-col items-center space-y-2'>
            <Button
              onClick={() => setDisplayPeriod(
                (displayPeriod ==  "AM" ? "PM" : "AM")
              )}
              className="bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-line-color hover:border-cyber-blue-bright transition-all duration-200 hover:shadow-lg hover:shadow-cyber-glow-primary/20"
              size="sm"
            >
              <ChevronUp className="h-4 w-4 text-cyber-blue-bright" />
            </Button>
            <div className="bg-cyber-dark border border-cyber-line-color rounded-lg px-4 py-2 min-w-[60px] text-center">
              <span className="text-2xl font-mono font-bold text-cyber-blue-bright">
                {displayPeriod}
              </span>
            </div>
            <Button
              onClick={() => setDisplayPeriod(
                (displayPeriod ==  "AM" ? "PM" : "AM")
              )}
              className="bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-line-color hover:border-cyber-blue-bright transition-all duration-200 hover:shadow-lg hover:shadow-cyber-glow-primary/20"
              size="sm"
            >
              <ChevronDown className="h-4 w-4 text-cyber-blue-bright" />
            </Button>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className='flex justify-center pt-2'>
        <Button
          onClick={applyChanges}
          className="bg-cyber-blue-bright hover:bg-cyber-blue text-cyber-dark font-bold px-8 py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-cyber-glow-strong/30 hover:scale-105"
        >
          <span className="flex items-center gap-2">
            <span>Apply Changes</span>
            <div className="w-2 h-2 bg-cyber-dark rounded-full animate-pulse"></div>
          </span>
        </Button>
      </div>
    </div>
  )
}

export default RolloutSelector
