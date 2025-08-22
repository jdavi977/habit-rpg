import React from 'react'
import { Button } from '../ui/button'

type DaysSelectorProps = {
    days: string[],
    selectedDay: string,
    selectDay: (day: string) => void,
}

const DaySelector = ({ days, selectedDay, selectDay }: DaysSelectorProps) => {
  return (
    <div className="space-y-3">
    <h3 className="text-sm text-cyber-text-muted">Select a day to view tasks</h3>
    <div className="flex flex-wrap gap-2">
      {days.map((day) => (
        <Button
          key={day}
          type="button"
          size="sm"
          variant={selectedDay === day ? "default" : "secondary"}
          className={`transition-all duration-200 ${
            selectedDay === day 
              ? 'bg-cyber-blue-bright text-cyber-dark shadow-lg shadow-cyber-blue-bright/30' 
              : 'bg-cyber-blue/20 text-cyber-blue-bright border-cyber-line-color hover:bg-cyber-blue/30'
          }`}
          onClick={() => selectDay(day)}
        >
          {day}
        </Button>
      ))}
    </div>
  </div>
  )
}

export default DaySelector
