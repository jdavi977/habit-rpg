import React from 'react'
import { Button } from '../ui/button'

type DaysSelectorProps = {
    days: string[],
    selectedDay: string,
    selectDay: (day: string) => void,
}

const DaySelector = ({ days, selectedDay, selectDay }: DaysSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <Button
            key={day}
            type="button"
            size="sm"
            variant={selectedDay === day ? "default" : "secondary"}
            className={`h-12 rounded-xl transition-all duration-200 font-medium ${
              selectedDay === day 
                ? 'bg-cyber-blue-bright text-cyber-dark shadow-lg shadow-cyber-blue-bright/30 hover:shadow-xl hover:shadow-cyber-blue-bright/40 transform hover:scale-105' 
                : 'bg-cyber-blue/10 text-cyber-blue-bright border border-cyber-line-color hover:bg-cyber-blue/20 hover:border-cyber-blue-bright/50 hover:shadow-md hover:shadow-cyber-glow-primary/20'
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
