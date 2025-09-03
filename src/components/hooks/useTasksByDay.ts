'use client'

import { dailyCompletion, dailyTaskCheck, decreaseStreak, deleteTaskCompleted, getSelectedDayTasks, getTaskData, getUserStats, goldReward, increaseStreak, removeTaskDb, undoGoldReward } from "@/lib/db";
import { diffMultiplier, streakMultiplier } from "@/lib/reward";
import { SupabaseClient } from "@supabase/supabase-js"
import { useCallback, useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  streak: number;
  isDone: boolean;
};

const useTasksByDay = (client: SupabaseClient, userId?: string, selectedDay?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const refresh = useCallback(async () => {
      if (!client || !userId || !selectedDay) return
      setLoading(true)
      try {
        const taskForDay = (await getSelectedDayTasks(client, selectedDay) ?? [])
        const taskWithStatus = await Promise.all(taskForDay.map(async (t) => ({
          ...t,
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
    await increaseStreak(client, taskId, taskData?.streak)
    await goldReward(client, userId, diffMultiplier(taskData?.difficulty), streakMultiplier(taskData?.streak), stats?.gold ?? 0)
    setTasks(ts => ts.map(t => t.id === taskId ? {...t, isDone: true} : t))
    window.location.reload()

  }, [client, userId, today])

  const undoTask = useCallback(async (taskId: string) => {
    if (!userId) return
    await deleteTaskCompleted(client, userId, Number(taskId), today)
    const taskData = await getTaskData(client, taskId)
    const stats = await getUserStats(client, userId)
    await decreaseStreak(client, taskId, taskData?.streak)
    await undoGoldReward(client, userId, diffMultiplier(taskData?.difficulty), streakMultiplier(taskData?.streak), stats?.gold ?? 0)
    setTasks(ts => ts.map(t => t.id === taskId ? {...t, isDone: false} : t))
    window.location.reload()

  }, [client, userId, today])
  

  const removeTask = useCallback(async (taskId: string) => {
    if (!userId) return
    await removeTaskDb(client, taskId)
    setTasks(ts => ts.filter(t => t.id !== taskId))
    window.location.reload()
  }, [])

  return {tasks, loading, refresh, completeTask, undoTask, removeTask}


}

export default useTasksByDay;



