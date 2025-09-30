import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import DaySelector from "./DaySelector";
import TaskList from "./TaskList";
import { SupabaseClient } from "@supabase/supabase-js";
import useTasksByDay from "../hooks/useTasksByDay";
// import WeekSelector from "./WeekSelector";

type TaskCardProps = {
  client: SupabaseClient;
  userId: string;
};

const TaskCard = ({ client, userId }: TaskCardProps) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayShort = new Date().toLocaleDateString("en-US", {
    weekday: "short",
  });
  const [selectedDay, setSelectedDay] = useState<string>(() => todayShort);
  const { tasks, loading, completeTask, undoTask, removeTask } = useTasksByDay(
    client,
    userId,
    selectedDay
  );
  // const [selectedWeek, setSelectedWeek] = useState(() => {
  //   const today = new Date()
  //   const dayOfWeek = today.getDay()
  //   const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  //   const monday = new Date(today.setDate(diff))
  //   return monday.toISOString().slice(0, 10)
  // })


  return (
    <Card className="bg-card/80 backdrop-blur-sm border-cyber-line-color shadow-lg shadow-cyber-glow-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-cyber-blue-bright flex items-center gap-2">
          <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
          Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* <WeekSelector
          selectedWeek={selectedWeek}
          selectWeek={setSelectedWeek}
        /> */}
        <DaySelector
          days={days}
          selectedDay={selectedDay}
          selectDay={setSelectedDay}
        />
        <div className="border-t border-cyber-line-color/50 pt-4">
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
  );
};

export default TaskCard;
