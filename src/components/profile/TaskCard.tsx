import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import DaySelector from "./DaySelector";
import TaskList from "./TaskList";
import { SupabaseClient } from "@supabase/supabase-js";
import useTasksByDay from "../hooks/useTasksByDay";

type TaskCardProps = {
  client: SupabaseClient;
  userId?: string;
  stats?: { level: number; gold: number; mana: number };
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

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-cyber-line-color shadow-lg shadow-cyber-glow-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-cyber-blue-bright flex items-center gap-2">
          <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
          Daily Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DaySelector
          days={days}
          selectedDay={selectedDay}
          selectDay={setSelectedDay}
        />
        <TaskList
          tasks={tasks}
          loading={loading}
          selectedDay={selectedDay}
          currentDay={todayShort}
          completeTask={completeTask}
          undoTask={undoTask}
          removeTask={removeTask}
        />
      </CardContent>
    </Card>
  );
};

export default TaskCard;
