/**
 * @fileoverview Task management and completion hook
 * @module components/hooks/useTasksByDay
 * 
 * Comprehensive hook for managing daily tasks including:
 * - Fetching tasks for a specific date
 * - Completing tasks and awarding rewards (gold, exp, mana, streak)
 * - Undoing task completions (reverses rewards)
 * - Removing tasks completely
 * - Tracking completion progress
 * 
 * This is one of the most complex hooks, handling the core game mechanics.
 */

"use client";

import {
  dailyCompletion,
  dailyTaskCheck,
  decreaseStreak,
  deleteTaskCompleted,
  expReward,
  getLastCompletionDate,
  getSelectedDayTasks,
  getTaskCompletionData,
  getTaskData,
  getUserStats,
  goldReward,
  increaseStreak,
  manaReward,
  healthIncrease,
  processStreakChecking,
  removeTaskDb,
  undoExpReward,
  undoGoldReward,
  undoManaReward,
  undoHealthIncrease,
} from "@/lib/db";
import { isConsecutiveCompletion } from "@/lib/streakHelper";
import { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

/**
 * Type definition for task objects with completion status
 */
type Task = {
  id: string;
  title: string;
  streak: number;
  isDone: boolean;
  startTime: string;
  endTime: string;
};

/**
 * Custom hook for managing tasks by day
 * 
 * Provides complete task management functionality for a given date including
 * fetching, completing, undoing, and removing tasks. Handles all reward calculations
 * and streak tracking. Automatically refetches when date or user changes.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Optional user ID
 * @param {string} selectedDay - Selected day identifier
 * @param {Date} selectedDate - Selected date for task filtering
 * @returns {Object} Object containing:
 *   - tasks: Array of tasks for the selected date
 *   - loading: Boolean indicating if data is being fetched
 *   - totalTasks: Total number of tasks
 *   - totalTasksCompleted: Number of completed tasks
 *   - refresh: Function to manually refresh tasks
 *   - completeTask: Function to complete a task (awards rewards)
 *   - undoTask: Function to undo a completion (removes rewards)
 *   - removeTask: Function to permanently delete a task
 * 
 * @example
 * const { tasks, loading, completeTask, undoTask } = useTasksByDay(client, userId, "Monday", date);
 * await completeTask(taskId); // Awards rewards and increases streak
 * await undoTask(taskId); // Reverses rewards and decreases streak
 */
const useTasksByDay = (
  client: SupabaseClient,
  userId?: string,
  selectedDay?: string,
  selectedDate?: Date
) => {
  // State management for tasks and UI
  const [tasks, setTasks] = useState<Task[]>([]); // All tasks for the selected day
  const [loading, setLoading] = useState(false); // Loading indicator for async operations
  const [totalTasksCompleted, setTotalTasksCompleted] = useState(0); // Count of completed tasks
  const totalTasks = tasks.length; // Total number of tasks (computed value)

  // Convert selectedDate (Date object) to ISO format string (YYYY-MM-DD)
  // Needed for database queries and comparison operations
  const date = selectedDate
    ? (() => {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0"); // getMonth() is 0-indexed
        const day = String(selectedDate.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      })()
    : undefined;

  // Fetch and display tasks for the selected date
  const refresh = useCallback(async () => {
    if (!client || !userId || !selectedDay) return; // Guard: skip if required params missing

    processStreakChecking(client)
    
    setLoading(true); // Show loading indicator
    try {
      // If no date selected, clear tasks and stop loading
      if (!date) {
        setTasks([]);
        setLoading(false);
        return;
      }
      
      // Fetch all tasks that should appear on this date
      // Handles both one-time tasks (date match) and recurring tasks (RRULE)
      const taskForDay = (await getSelectedDayTasks(client, userId, date)) ?? [];
      
      // For each task, check if it's been completed today and format the data
      // isDone is determined by querying task_completions table
      const taskWithStatus = await Promise.all(
        taskForDay.map(async (t) => ({
          id: t.id,
          title: t.title,
          streak: t.streak,
          startTime: t.start_time,
          endTime: t.end_time,
          isDone: await dailyTaskCheck(client, userId, Number(t.id), date),
        }))
      );
      setTasks(taskWithStatus); // Update state with formatted tasks
    } finally {
      setLoading(false); // Always clear loading state, even on error
    }
  }, [client, userId, selectedDay, date]);

  // Count completed tasks and update state for progress tracking
  const totalTasksLeft = useCallback(() => {
    const completedTasks = tasks.filter((task) => task.isDone).length;
    setTotalTasksCompleted(completedTasks);
  }, [tasks]);

  // Auto-refresh tasks when dependencies change (date, user, client)
  // This keeps the UI in sync with the database
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Recalculate completion count whenever tasks array changes
  useEffect(() => {
    totalTasksLeft();
  }, [totalTasksLeft]);

  // Complete a task and award all rewards
  const completeTask = useCallback(
    async (taskId: string) => {
      if (!userId || !date) return; // Guard: require user and date

      // Step 1: Check if task is already completed (prevent duplicates)
      const alreadyCompleted = await dailyTaskCheck(
        client,
        userId,
        Number(taskId),
        date
      );

      if (alreadyCompleted) return; // Skip if already done

      // Step 2: Get task properties and current user stats
      const taskData = await getTaskData(client, taskId);
      const stats = await getUserStats(client, userId);

      // Step 3: Determine if this is a consecutive completion for streak calculation
      const lastCompletion = await getLastCompletionDate(client, userId, taskId);
      console.log("111", lastCompletion)
      const isConsecutive = isConsecutiveCompletion(taskData, date, lastCompletion || taskData.date);
      console.log("aaa", isConsecutive)
      
      // Step 4: Update streak (increment if consecutive, reset to 1 if not)
      await increaseStreak(client, taskId, taskData?.streak, isConsecutive)

      // Step 5: Award gold reward (scaled by difficulty and streak)
      await goldReward(
        client,
        userId,
        taskData?.difficulty,
        taskData?.streak,
        stats?.gold
      );
      
      // Step 6: Award experience (may trigger level up)
      await expReward(
        client,
        userId,
        taskData?.difficulty,
        taskData?.streak,
        stats.exp,
        stats.total_exp,
        stats.level
      );
      
      // Step 7: Award mana (capped at max mana, returns actual amount gained)
      const manaResult = await manaReward(
        client,
        userId,
        taskData?.difficulty,
        taskData?.streak,
        stats?.mana,
        stats?.total_mana
      );

      // Step 7.1: Increase health (capped at max health)
      const healthResult = await healthIncrease(
        client,
        userId,
        taskData?.difficulty,
        taskData?.streak,
        stats?.health
      );
      
      // Step 8: Record completion in task_completions table (with mana gain for undo support)
      await dailyCompletion(
        client,
        userId,
        Number(taskId),
        date,
        manaResult.actualIncrease,
        healthResult.actualIncrease
      );
      
      // Step 9: Update local state immediately for instant UI feedback
      setTasks((ts) =>
        ts.map((t) => (t.id === taskId ? { ...t, isDone: true } : t))
      );
      
      // Step 10: Refresh from DB to get updated streak counts and other changes
      await refresh();
    },
    [client, userId, date, refresh]
  );

  // Undo a task completion and reverse all rewards
  const undoTask = useCallback(
    async (taskId: string) => {
      if (!userId || !date) return; // Guard: require user and date

      try {
        // Step 1: Get completion data (includes mana_increase for reversal)
        const completedData = await getTaskCompletionData(
          client,
          userId,
          Number(taskId),
          date
        );
        
        // Step 2: Delete the completion record from task_completions table
        await deleteTaskCompleted(client, userId, Number(taskId), date);
        
        // Step 3: Get current task data and user stats for reversal calculations
        const taskData = await getTaskData(client, taskId);
        const stats = await getUserStats(client, userId);
        if (!stats) {
          console.error("User stats not found, cannot undo task rewards");
          return;
        }

        // Step 4: Save current mana and original increase for accurate reversal
        const currentMana = stats.mana;
        const manaIncrease = completedData.mana_increase;
        const currentHealth = stats.health;
        const healthIncrease= completedData.health_increase;

        // Step 5: Decrease streak by 1 (to reverse the increase from completion)
        await decreaseStreak(client, taskId, taskData?.streak);
        
        // Step 6: Reverse gold reward (using streak - 1 since we just decreased it)
        await undoGoldReward(
          client,
          userId,
          taskData?.difficulty,
          taskData?.streak - 1,
          stats.gold
        );
        
        // Step 7: Reverse experience reward (may trigger level down)
        await undoExpReward(
          client,
          userId,
          taskData?.difficulty,
          taskData?.streak - 1,
          stats.exp,
          stats.level
        );
        
        // Step 8: Reverse mana reward using the actual amount that was gained
        await undoManaReward(client, userId, currentMana, manaIncrease);

        await undoHealthIncrease(client, userId, currentHealth, healthIncrease)

        // Step 9: Update local state for instant UI feedback
        setTasks((ts) =>
          ts.map((t) => (t.id === taskId ? { ...t, isDone: false } : t))
        );
        
        // Step 10: Refresh from DB to get updated streak counts
        await refresh();
      } catch (error) {
        console.error("Error undoing task:", error);
        throw error; // Re-throw to be caught by removeTask
      }
    },
    [client, userId, date, refresh]
  );

  // Permanently delete a task (first undoes it, then removes from database)
  const removeTask = useCallback(
    async (taskId: string) => {
      if (!userId) return; // Guard: require user

      try {
        // Step 1: First undo the task to reverse rewards and decrease streak
        // This ensures no orphaned rewards remain in the system
        await undoTask(taskId);

        // Step 2: Then permanently delete the task from the database
        await removeTaskDb(client, taskId);

        // Step 3: Update local state to remove task from UI
        setTasks((ts) => ts.filter((t) => t.id !== taskId));
      } catch (error) {
        console.error("Error removing task:", error);
        // On error, refresh to restore correct state from database
        await refresh();
      }
    },
    [client, userId, undoTask, refresh]
  );

  // Return all data and functions for component use
  return {
    tasks, // Array of tasks for the current date
    loading, // Loading state indicator
    totalTasks, // Total number of tasks
    totalTasksCompleted, // Number of completed tasks
    refresh, // Function to manually refresh tasks
    completeTask, // Function to complete a task and award rewards
    undoTask, // Function to undo a completion and reverse rewards
    removeTask, // Function to permanently delete a task
  };
};

export default useTasksByDay;
