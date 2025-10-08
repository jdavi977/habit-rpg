import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TaskList from "./TaskList";
import { SupabaseClient } from "@supabase/supabase-js";
import useTasksByDay from "../hooks/useTasksByDay";
import { Calendar } from "../ui/8bit/calendar";
import WeekSelector from "./WeekSelector";

type TaskCardProps = {
  client: SupabaseClient;
  userId: string;
};

const TaskCard = ({ client, userId }: TaskCardProps) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today= new Date()
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const todayShort = new Date().toLocaleDateString("en-US", {
    weekday: "short",
  });
  const [selectedDay, setSelectedDay] = useState<string>(() => todayShort);
  const { tasks, loading, completeTask, undoTask, removeTask } = useTasksByDay(
    client,
    userId,
    selectedDay,
    selectedDate
  );

  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-14 gap-8">
      {/* Calendar Section */}
      <div className="lg:col-span-4">
      <Card className="bg-card/80 backdrop-blur-sm border-cyber-line-color shadow-lg shadow-cyber-glow-primary/20 h-fit w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-cyber-blue-bright flex items-center gap-2">
              <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="flex p-4 justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              font="retro"
              required
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Tasks Section */}
      <div className="lg:col-span-10">
      <Card className="bg-card/80 backdrop-blur-sm border-cyber-line-color shadow-lg shadow-cyber-glow-primary/20 w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-cyber-blue-bright flex items-center gap-2">
              <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
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
      </div>
    </div>
  );
};

export default TaskCard;
