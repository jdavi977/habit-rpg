/**
 * @fileoverview Task management card component
 * @module components/profile/TaskCard
 * 
 * Main container for task management featuring:
 * - Collapsible calendar view
 * - Week selector for navigation
 * - Task list with completion controls
 * - Integration with useTasksByDay hook for state management
 */

"use client"
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TaskList from "./TaskList";
import { SupabaseClient } from "@supabase/supabase-js";
import useTasksByDay from "../hooks/useTasksByDay";
import { Calendar } from "../ui/8bit/calendar"; 
import WeekSelector from "./WeekSelector";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../ui/button";

type TaskCardProps = {
  client: SupabaseClient;
  userId: string;
};

/**
 * Main task management component
 * 
 * Provides calendar navigation, week selection, and task completion
 * controls. Manages selected date state and passes it to useTasksByDay hook.
 * 
 * @param {TaskCardProps} props - Component props
 * @returns {JSX.Element} Task management interface with calendar and task list
 */
const TaskCard = ({ client, userId }: TaskCardProps) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const todayShort = new Date().toLocaleDateString("en-US", {
    weekday: "short",
  });
  const [selectedDay, setSelectedDay] = useState<string>(() => todayShort);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const { tasks, loading, completeTask, undoTask, removeTask } = useTasksByDay(
    client,
    userId,
    selectedDay,
    selectedDate
  );

  return (
    <div className="space-y-6">
      {/* Calendar Section - Collapsible */}
      <Card className="bg-card/95 backdrop-blur-sm border-border shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <div className="w-2 h-2 bg-soft-primary rounded-full animate-gentle-pulse"></div>
              Calendar
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
              className="text-text-secondary hover:text-text-primary"
            >
              {isCalendarExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {isCalendarExpanded && (
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              font="retro"
              required
            />
          </CardContent>
        )}
      </Card>

      {/* Tasks Section */}
      <Card className="bg-card/95 backdrop-blur-sm border-border shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <div className="w-2 h-2 bg-soft-secondary rounded-full animate-gentle-pulse"></div>
            Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <WeekSelector
            selectedDate={selectedDate}
            selectDate={setSelectedDate}
            days={days}
            selectedDay={selectedDay}
            selectDay={setSelectedDay}
            client={client}
            userId={userId}
          />

          <div className="border-t border-border/50 pt-4">
            <TaskList
              tasks={tasks}
              loading={loading}
              selectedDay={selectedDay}
              currentDay={todayShort}
              completeTask={completeTask}
              undoTask={undoTask}
              removeTask={removeTask}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskCard;
