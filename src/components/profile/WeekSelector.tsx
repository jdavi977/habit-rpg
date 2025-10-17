"use client"
import React, { useState } from "react";
import { Button } from "../ui/button";
import CreateTask from "./CreateTask";
import { SupabaseClient } from "@supabase/supabase-js";

const DAYS_WEEK = 7;

type WeekSelectorProps = {
  selectedDate: Date;
  selectDate: (day: Date) => void;
  days: string[];
  selectedDay: string;
  selectDay: (day: string) => void;
  client: SupabaseClient;
  userId: string;
};

const WeekSelector = ({
  selectedDate,
  selectDate,
  days,
  selectedDay,
  selectDay,
  userId,
  client,
}: WeekSelectorProps) => {
  const day = selectedDate.getDate();
  const selectedDayOfWeek = selectedDate.getDay();
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const [monthDisplay, setMonthDisplay] = useState<string[]>([]);
  const date = React.useMemo(() => monthRangeChecker(), [selectedDate]);
  const numberedDays = React.useMemo(() => createNumberedDays(date), [date]);

  React.useEffect(() => {
    changeDay();
  }, [selectedDate]);

  function changeDay() {
    selectDay(selectedDate.toLocaleDateString("en-US", { weekday: "short" }));
  }

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
          month: "long",
        }),
        currentMonthEnd.toLocaleDateString("en-US", {
          month: "long",
        }),
      ]);
      return (
        prevMonthStart.toLocaleDateString("en-US", {
          day: "numeric",
        }) +
        "," +
        currentMonthEnd.toLocaleDateString("en-US", {
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
          month: "long",
        }),
        nextMonthEnd.toLocaleDateString("en-US", {
          month: "long",
        }),
      ]);

      return (
        currentMonthStart.toLocaleDateString("en-US", {
          day: "numeric",
        }) +
        "," +
        nextMonthEnd.toLocaleDateString("en-US", {
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
        day: "numeric",
      }) +
      "," +
      currentEnd.toLocaleDateString("en-US", {
        day: "numeric",
      })
    );
  }

  function selectToday() {
    const today = new Date();
    selectDate(today);
  }

  function createNumberedDays(week: string) {
    const name = week.split(",");
    const startDate = parseInt(name[0]);
    const endDate = parseInt(name[1]);
    const startRange: number[] = [];
    const range: number[] = [];
    if (endDate < 8) {
      for (let i = 1; i <= endDate; i++) {
        range.push(i);
      }
    }
    const endRangeLength = range.length;
    const startRangeLength = DAYS_WEEK - endRangeLength - 1;

    for (let i = startDate; i <= startDate + startRangeLength; i++) {
      startRange.push(i);
    }

    return startRange.concat(range);
  }

  function sendDate(date: number, day: string) {
    const monthMap = {
      january: 0,
      jan: 0,
      february: 1,
      feb: 1,
      march: 2,
      mar: 2,
      april: 3,
      apr: 3,
      may: 4,
      june: 5,
      jun: 5,
      july: 6,
      jul: 6,
      august: 7,
      aug: 7,
      september: 8,
      sep: 8,
      sept: 8,
      october: 9,
      oct: 9,
      november: 10,
      nov: 10,
      december: 11,
      dec: 11,
    };

    let monthName: string;
    let targetYear = year;

    if (date < 8 && monthDisplay.length > 1) {
      monthName = monthDisplay[1];
      // If it's the next month, increment year if needed
      if (monthDisplay[1] === "January" && monthDisplay[0] === "December") {
        targetYear = year + 1;
      }
    } else {
      monthName = monthDisplay[0];
    }

    const monthIndex =
      monthMap[monthName.toLowerCase() as keyof typeof monthMap];
    const fullDate = new Date(targetYear, monthIndex, date);

    selectDay(day);
    selectDate(fullDate);
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-cyber-terminal-bg/30 border border-cyber-line-color rounded-lg">
        <div className="flex items-center gap-4">
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
            <span className="font-medium text-cyber-blue-brightm">{year}</span>
          </div>
        </div>
        <CreateTask client={client} userId={userId} />
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <Button
              key={day}
              type="button"
              size="sm"
              variant={selectedDay ? "default" : "secondary"}
              className={`h-16 rounded-xl transition-all duration-200 font-medium flex flex-col items-center justify-center gap-1 ${
                selectedDay === day
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/70 transform hover:scale-105"
                  : "bg-cyber-blue/10 text-cyber-blue-bright border border-cyber-line-color hover:bg-cyber-blue/20 hover:border-cyber-blue-bright/50 hover:shadow-md hover:shadow-cyber-glow-primary/20"
              }`}
              onClick={() => sendDate(numberedDays[index], day)}
            >
              <span className="text-xs font-bold uppercase tracking-wider">
                {day}
              </span>
              <span className="text-lg font-bold">{numberedDays[index]}</span>
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};

export default React.memo(WeekSelector);
