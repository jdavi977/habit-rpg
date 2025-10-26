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
  removeTaskDb,
  undoExpReward,
  undoGoldReward,
  undoManaReward,
} from "@/lib/db";
import { isConsecutiveCompletion } from "@/lib/streakHelper";
import { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  streak: number;
  isDone: boolean;
  startTime: string;
  endTime: string;
};

const useTasksByDay = (
  client: SupabaseClient,
  userId?: string,
  selectedDay?: string,
  selectedDate?: Date
) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalTasksCompleted, setTotalTasksCompleted] = useState(0);
  const totalTasks = tasks.length;

  const date = selectedDate
    ? (() => {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      })()
    : undefined;

  const refresh = useCallback(async () => {
    if (!client || !userId || !selectedDay) return;
    setLoading(true);
    try {
      if (!date) {
        setTasks([]);
        setLoading(false);
        return;
      }
      const taskForDay = (await getSelectedDayTasks(client, userId, date)) ?? [];
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
      setTasks(taskWithStatus);
    } finally {
      setLoading(false);
    }
  }, [client, userId, selectedDay, date]);

  const totalTasksLeft = useCallback(() => {
    const completedTasks = tasks.filter((task) => task.isDone).length;
    setTotalTasksCompleted(completedTasks);
  }, [tasks]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    totalTasksLeft();
  }, [totalTasksLeft]);

  const completeTask = useCallback(
    async (taskId: string) => {
      if (!userId || !date) return;

      const alreadyCompleted = await dailyTaskCheck(
        client,
        userId,
        Number(taskId),
        date
      );

      if (alreadyCompleted) return;

      const taskData = await getTaskData(client, taskId);
      const stats = await getUserStats(client, userId);

      const lastCompletion = await getLastCompletionDate(client, userId, taskId);
      const isConsecutive = isConsecutiveCompletion(taskData, date, lastCompletion || taskData.date);
      
      await increaseStreak(client, taskId, taskData?.streak, isConsecutive)

      await goldReward(
        client,
        userId,
        taskData?.difficulty,
        taskData?.streak,
        stats?.gold
      );
      await expReward(
        client,
        userId,
        taskData?.difficulty,
        taskData?.streak,
        stats.exp,
        stats.total_exp,
        stats.level
      );
      const manaResult = await manaReward(
        client,
        userId,
        taskData?.difficulty,
        taskData?.streak,
        stats?.mana,
        stats?.total_mana
      );
      await dailyCompletion(
        client,
        userId,
        Number(taskId),
        date,
        manaResult.actualIncrease
      );
      setTasks((ts) =>
        ts.map((t) => (t.id === taskId ? { ...t, isDone: true } : t))
      );
      // Refresh tasks to get updated streak counts
      await refresh();
      // window.location.reload()
    },
    [client, userId, date, refresh]
  );

  const undoTask = useCallback(
    async (taskId: string) => {
      if (!userId || !date) return;

      try {
        const completedData = await getTaskCompletionData(
          client,
          userId,
          Number(taskId),
          date
        );
        await deleteTaskCompleted(client, userId, Number(taskId), date);
        const taskData = await getTaskData(client, taskId);
        const stats = await getUserStats(client, userId);
        if (!stats) {
          console.error("User stats not found, cannot undo task rewards");
          return;
        }

        const currentMana = stats.mana;
        const manaIncrease = completedData.mana_increase;

        await decreaseStreak(client, taskId, taskData?.streak);
        await undoGoldReward(
          client,
          userId,
          taskData?.difficulty,
          taskData?.streak - 1,
          stats.gold
        );
        await undoExpReward(
          client,
          userId,
          taskData?.difficulty,
          taskData?.streak - 1,
          stats.exp,
          stats.level
        );
        await undoManaReward(client, userId, currentMana, manaIncrease);

        setTasks((ts) =>
          ts.map((t) => (t.id === taskId ? { ...t, isDone: false } : t))
        );
        // Refresh tasks to get updated streak counts
        await refresh();
        // window.location.reload()
      } catch (error) {
        console.error("Error undoing task:", error);
        throw error; // Re-throw to be caught by removeTask
      }
    },
    [client, userId, date, refresh]
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      if (!userId) return;

      try {
        // First undo the task to handle rewards and streaks
        await undoTask(taskId);

        // Then remove the task from the database
        await removeTaskDb(client, taskId);

        // Finally update the local state
        setTasks((ts) => ts.filter((t) => t.id !== taskId));
      } catch (error) {
        console.error("Error removing task:", error);
        // Optionally refresh the tasks to get the correct state
        await refresh();
      }
    },
    [client, userId, undoTask, refresh]
  );

  return {
    tasks,
    loading,
    totalTasks,
    totalTasksCompleted,
    refresh,
    completeTask,
    undoTask,
    removeTask,
  };
};

export default useTasksByDay;
