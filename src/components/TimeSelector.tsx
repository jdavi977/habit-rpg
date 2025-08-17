'use client'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown } from 'lucide-react'

/**
 * Interfac for the TimsSelector props
 * 
 * @property onTimeChange - optional callback that is triggered when the user selects a new time.
 * @property initialTime - optional initial time to display when the object is first rendered.
 */
interface TimeSelectorProps {
  onTimeChange?: (time: { hour: number; minute: number; period: 'AM' | 'PM' }) => void
  initialTime?: { hour: number; minute: number; period: 'AM' | 'PM' }
}

/**
 * 
 * @param param0 
 * @returns 
 */
export default function TimeSelector({ onTimeChange, initialTime }: TimeSelectorProps) {
  const [selectedHour, setSelectedHour] = useState(initialTime?.hour || 12)
  const [selectedMinute, setSelectedMinute] = useState(initialTime?.minute || 0)
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(initialTime?.period || 'AM')
  
  const [displayHour, setDisplayHour] = useState(initialTime?.hour || 12)
  const [displayMinute, setDisplayMinute] = useState(initialTime?.minute || 0)
  const [displayPeriod, setDisplayPeriod] = useState<'AM' | 'PM'>(initialTime?.period || 'AM')
  
  const hourRef = useRef<HTMLDivElement>(null)
  const minuteRef = useRef<HTMLDivElement>(null)
  const periodRef = useRef<HTMLDivElement>(null)

  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = [0, 30]
  const periods: ('AM' | 'PM')[] = ['AM', 'PM']

  useEffect(() => {
    if (onTimeChange) {
      onTimeChange({ hour: selectedHour, minute: selectedMinute, period: selectedPeriod })
    }
  }, [selectedHour, selectedMinute, selectedPeriod, onTimeChange])

  const scrollToValue = (ref: React.RefObject<HTMLDivElement | null>, value: number | string) => {
    if (ref.current) {
      const element = ref.current.querySelector(`[data-value="${value}"]`) as HTMLElement
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  const handleHourChange = (hour: number) => {
    setDisplayHour(hour)
    scrollToValue(hourRef, hour)
  }

  const handleMinuteChange = (minute: number) => {
    setDisplayMinute(minute)
    scrollToValue(minuteRef, minute)
  }

  const handlePeriodChange = (period: 'AM' | 'PM') => {
    setDisplayPeriod(period)
    scrollToValue(periodRef, period)
  }

  const scrollUp = (type: 'hour' | 'minute' | 'period', values: (number | string)[], currentValue: number | string) => {
    const currentIndex = values.indexOf(currentValue)
    const newIndex = currentIndex === 0 ? values.length - 1 : currentIndex - 1
    const newValue = values[newIndex]
    
    if (type === 'hour' && typeof newValue === 'number') {
      handleHourChange(newValue)
    } else if (type === 'minute' && typeof newValue === 'number') {
      handleMinuteChange(newValue)
    } else if (type === 'period' && typeof newValue === 'string') {
      handlePeriodChange(newValue as 'AM' | 'PM')
    }
  }

  const scrollDown = (type: 'hour' | 'minute' | 'period', values: (number | string)[], currentValue: number | string) => {
    const currentIndex = values.indexOf(currentValue)
    const newIndex = currentIndex === values.length - 1 ? 0 : currentIndex + 1
    const newValue = values[newIndex]
    
    if (type === 'hour' && typeof newValue === 'number') {
      handleHourChange(newValue)
    } else if (type === 'minute' && typeof newValue === 'number') {
      handleMinuteChange(newValue)
    } else if (type === 'period' && typeof newValue === 'string') {
      handlePeriodChange(newValue as 'AM' | 'PM')
    }
  }

  const applyChanges = () => {
    setSelectedHour(displayHour)
    setSelectedMinute(displayMinute)
    setSelectedPeriod(displayPeriod)
  }

  const resetChanges = () => {
    setDisplayHour(selectedHour)
    setDisplayMinute(selectedMinute)
    setDisplayPeriod(selectedPeriod)
    scrollToValue(hourRef, selectedHour)
    scrollToValue(minuteRef, selectedMinute)
    scrollToValue(periodRef, selectedPeriod)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        {/* Hour Selector */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-700"
            onClick={() => scrollUp('hour', hours, displayHour)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          
          <div 
            ref={hourRef}
            className="h-16 w-16 overflow-hidden border border-gray-600 rounded-lg bg-gray-800"
          >
            <div className="flex flex-col items-center">
              <div className="h-8 w-full"></div>
              {hours.map((hour) => (
                <div
                  key={hour}
                  data-value={hour}
                  className={`h-8 w-full flex items-center justify-center text-sm cursor-pointer transition-colors ${
                    displayHour === hour 
                      ? 'text-white bg-blue-600' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => handleHourChange(hour)}
                >
                  {hour.toString().padStart(2, '0')}
                </div>
              ))}
              <div className="h-8 w-full"></div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-700"
            onClick={() => scrollDown('hour', hours, displayHour)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        <span className="text-2xl font-bold text-gray-400">:</span>

        {/* Minute Selector */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-700"
            onClick={() => scrollUp('minute', minutes, displayMinute)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          
          <div 
            ref={minuteRef}
            className="h-16 w-16 overflow-hidden border border-gray-600 rounded-lg bg-gray-800"
          >
            <div className="flex flex-col items-center">
              <div className="h-8 w-full"></div>
              {minutes.map((minute) => (
                <div
                  key={minute}
                  data-value={minute}
                  className={`h-8 w-full flex items-center justify-center text-sm cursor-pointer transition-colors ${
                    displayMinute === minute 
                      ? 'text-white bg-blue-600' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => handleMinuteChange(minute)}
                >
                  {minute.toString().padStart(2, '0')}
                </div>
              ))}
              <div className="h-8 w-full"></div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-700"
            onClick={() => scrollDown('minute', minutes, displayMinute)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Period Selector */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-700"
            onClick={() => scrollUp('period', periods, displayPeriod)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          
          <div 
            ref={periodRef}
            className="h-16 w-16 overflow-hidden border border-gray-600 rounded-lg bg-gray-800"
          >
            <div className="flex flex-col items-center">
              <div className="h-8 w-full"></div>
              {periods.map((period) => (
                <div
                  key={period}
                  data-value={period}
                  className={`h-8 w-full flex items-center justify-center text-sm cursor-pointer transition-colors ${
                    displayPeriod === period 
                      ? 'text-white bg-blue-600' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => handlePeriodChange(period)}
                >
                  {period}
                </div>
              ))}
              <div className="h-8 w-full"></div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-700"
            onClick={() => scrollDown('period', periods, displayPeriod)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={resetChanges}
          className="text-xs"
        >
          Reset
        </Button>
        <Button
          size="sm"
          onClick={applyChanges}
          className="text-xs"
        >
          Apply
        </Button>
      </div>
    </div>
  )
}
