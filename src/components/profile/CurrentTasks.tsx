import { SupabaseClient } from "@supabase/supabase-js";
import React from "react";
import useTasksByDay from "../hooks/useTasksByDay";
import TaskList from "./TaskList";

type CurrentTasksProps = {
  client: SupabaseClient;
  userId: string;
};

const CurrentTasks = ({ client, userId }: CurrentTasksProps) => {
  const todayShort = new Date().toLocaleDateString("en-US", {
    weekday: "short",
  });
  const today = new Date();
  const {
    tasks,
    loading,
    totalTasks,
    totalTasksCompleted,
    completeTask,
    undoTask,
    removeTask,
  } = useTasksByDay(client, userId, todayShort, today);
  const tasksLeft = totalTasks - totalTasksCompleted;

  return (
    <div className="border-t border-border/50 pt-4">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {tasksLeft === 0
            ? "You completed all your tasks!"
            : tasksLeft === 1
            ? "1 task left for today!"
            : `${tasksLeft} tasks left for today!`}
        </p>
      </div>

      <TaskList
        tasks={tasks}
        loading={loading}
        selectedDay={todayShort}
        currentDay={todayShort}
        completeTask={completeTask}
        undoTask={undoTask}
        removeTask={removeTask}
      />
    </div>
  );
};

export default CurrentTasks;
