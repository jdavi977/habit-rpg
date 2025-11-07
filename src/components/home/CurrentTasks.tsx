/**
 * @fileoverview Today's tasks display component
 * @module components/profile/CurrentTasks
 * 
 * Displays tasks for the current day with completion tracking.
 * Uses useTasksByDay hook to fetch and manage today's tasks.
 * Shows progress indicator for remaining tasks.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import React from "react";
import useTasksByDay from "../hooks/useTasksByDay";
import TaskList from "./TaskList";

type CurrentTasksProps = {
  client: SupabaseClient;
  userId: string;
};

/**
 * Component that displays and manages today's tasks
 * 
 * Fetches tasks for the current day using useTasksByDay hook and
 * renders them with progress tracking. Shows encouraging messages
 * based on completion status.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - User ID to fetch tasks for
 * 
 * @returns {JSX.Element} Today's tasks display with TaskList component
 */
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
