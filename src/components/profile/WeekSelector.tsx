import next from "next";
import React, { useState } from "react";
import { Button } from "../ui/button";

type WeekSelectorProps = {
  selectedWeek: Date;
  selectDate: (day: Date) => void;
};

const WeekSelector = ({ selectedWeek, selectDate }: WeekSelectorProps) => {
  const day = selectedWeek.getDate();
  const selectedDayOfWeek = selectedWeek.getDay();
  const year = selectedWeek.getFullYear();
  const month = selectedWeek.getMonth();
  const currentMonthYear = new Date(year, month);
  const [monthDisplay, setMonthDisplay] = useState<string[]>([]);
  
  // Memoize the expensive date calculation
  const date = React.useMemo(() => monthRangeChecker(), [selectedWeek]);

  function monthRangeChecker(): string {
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const weekStart = day - selectedDayOfWeek;
    const weekEnd = day - selectedDayOfWeek + 6;

    if (weekStart < 1) {
      const prevMonth = new Date(year, month, 0);
      const prevMonthDay = prevMonth.getDate() + weekStart;
      const prevMonthStart = new Date(year, month - 1, prevMonthDay);
      const currentMonthEnd = new Date(year, month, weekEnd);

      setMonthDisplay([
        prevMonthStart.toLocaleDateString("en-US", {
          month: "short",
        }),
        currentMonthEnd.toLocaleDateString("en-US", {
          month: "short",
        }),
      ]);
      return (
        prevMonthStart.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        }) +
        "," +
        currentMonthEnd.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        })
      );
    }

    if (weekEnd > daysInMonth) {
      const monthEnd = weekEnd - daysInMonth;
      const nextMonthEnd = new Date(year, month + 1, monthEnd);
      const currentMonthStart = new Date(year, month, weekStart);

      setMonthDisplay([
        currentMonthStart.toLocaleDateString("en-US", {
          month: "short",
        }),
        nextMonthEnd.toLocaleDateString("en-US", {
          month: "short",
        }),
      ]);

      return (
        currentMonthStart.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        }) +
        "," +
        nextMonthEnd.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        })
      );
    }

    const currentStart = new Date(year, month, weekStart);
    const currentEnd = new Date(year, month, weekEnd);
    setMonthDisplay([
      currentStart.toLocaleDateString("en-US", {
        month: "long",
      }),
    ]);

    return (
      currentStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }) +
      "," +
      currentEnd.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    );
  }

  function selectToday() {
    const today = new Date();
    selectDate(today);
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-cyber-terminal-bg/30 border border-cyber-line-color rounded-lg">
      <Button 
        type="button" 
        onClick={() => selectToday()}
        className="bg-cyber-blue hover:bg-cyber-blue-bright text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-cyber-blue/30"
      >
        Today
      </Button>
      
      <div className="flex items-center gap-2 text-cyber-text-bright">
        {monthDisplay.map((day, index) => (
          <span key={index} className="font-medium text-cyber-blue-bright">
            {day}
            {index < monthDisplay.length - 1 && (
              <span className="text-cyber-text-muted mx-1"> - </span>
            )}
          </span>
        ))}
        <span className="font-medium text-cyber-blue-brightm">
          {year}
        </span>
      </div>
      
      {/* {date} */}
    </div>
  );
};

export default React.memo(WeekSelector);
