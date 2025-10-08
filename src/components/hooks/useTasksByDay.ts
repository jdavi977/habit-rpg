'use client'

import { dailyCompletion, dailyTaskCheck, decreaseStreak, deleteTaskCompleted, expReward, getSelectedDayTasks, getTaskData, getUserStats, goldReward, increaseStreak, manaReward, removeTaskDb, undoExpReward, undoGoldReward, undoManaReward } from "@/lib/db";
import { diffMultiplier, streakMultiplier } from "@/lib/reward";
import { SupabaseClient } from "@supabase/supabase-js"
import React, { useCallback, useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  streak: number;
  isDone: boolean;
  startTime: string; 
  endTime: string;    
};

const useTasksByDay = (client: SupabaseClient, userId?: string, selectedDay?: string, selectedDate?: Date) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  // Memoize today to prevent unnecessary re-renders
  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const date = selectedDate?.toISOString().slice(0, 10)

  const refresh = useCallback(async () => {
      if (!client || !userId || !selectedDay) return
      setLoading(true)
      try {
        if (!date) {
          setTasks([]);
          setLoading(false);
          return;
        }
        const taskForDay = (await getSelectedDayTasks(client, date) ?? []);
        const taskWithStatus = await Promise.all(taskForDay.map(async (t) => ({
          id: t.id,
          title: t.title,
          streak: t.streak,
          startTime: t.start_time,  // Map snake_case to camelCase
          endTime: t.end_time,      // Map snake_case to camelCase
          isDone: await dailyTaskCheck(client, userId, Number(t.id), today),
        })))
        setTasks(taskWithStatus)
      } finally {
        setLoading(false)
      }
  }, [client, userId, selectedDay, today])

  useEffect(() => {void refresh() }, [refresh])

  const completeTask = useCallback(async (taskId: string) => {
    if (!userId) return
    const alreadyCompleted = await dailyTaskCheck(client, userId, Number(taskId), today)
    if (alreadyCompleted) return
    await dailyCompletion(client, userId, Number(taskId), today)
    const taskData = await getTaskData(client, taskId)
    const stats = await getUserStats(client, userId)
    // FIX THIS FOR ALL
    await increaseStreak(client, taskId, taskData?.streak)
    await goldReward(client, userId, diffMultiplier(taskData?.difficulty), streakMultiplier(taskData?.streak), stats?.gold)
    await expReward(client, userId, diffMultiplier(taskData?.difficulty), streakMultiplier(taskData?.streak), stats?.exp)
    await manaReward(client, userId, diffMultiplier(taskData?.difficulty), streakMultiplier(taskData?.streak), stats?.mana)
    setTasks(ts => ts.map(t => t.id === taskId ? {...t, isDone: true} : t))
    // Refresh tasks to get updated streak counts
    await refresh()

  }, [client, userId, today, refresh])

  const undoTask = useCallback(async (taskId: string) => {
    if (!userId) return
    
    try {
      await deleteTaskCompleted(client, userId, Number(taskId), today)
      const taskData = await getTaskData(client, taskId)
      const stats = await getUserStats(client, userId)
      
      if (!stats) {
        console.error('User stats not found, cannot undo task rewards')
        return
      }
      
      await decreaseStreak(client, taskId, taskData?.streak)
      await undoGoldReward(client, userId, diffMultiplier(taskData?.difficulty), streakMultiplier(taskData?.streak - 1), stats.gold)
      await undoExpReward(client, userId, diffMultiplier(taskData?.difficulty), streakMultiplier(taskData?.streak - 1), stats.exp)
      await undoManaReward(client, userId, diffMultiplier(taskData?.difficulty), streakMultiplier(taskData?.streak - 1), stats.mana)
      setTasks(ts => ts.map(t => t.id === taskId ? {...t, isDone: false} : t))
      // Refresh tasks to get updated streak counts
      await refresh()
    } catch (error) {
      console.error('Error undoing task:', error)
      throw error // Re-throw to be caught by removeTask
    }
  }, [client, userId, today, refresh])

  const removeTask = useCallback(async (taskId: string) => {
    if (!userId) return
    
    try {
      // First undo the task to handle rewards and streaks
      await undoTask(taskId)
      
      // Then remove the task from the database
      await removeTaskDb(client, taskId)
      
      // Finally update the local state
      setTasks(ts => ts.filter(t => t.id !== taskId))
    } catch (error) {
      console.error('Error removing task:', error)
      // Optionally refresh the tasks to get the correct state
      await refresh()
    }
  }, [client, userId, undoTask, refresh])

  return {tasks, loading, refresh, completeTask, undoTask, removeTask}


}

export default useTasksByDay;



