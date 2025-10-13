'use client'

import { dailyCompletion, dailyTaskCheck, decreaseStreak, deleteTaskCompleted, expReward, getSelectedDayTasks, getTaskCompletionData, getTaskData, getUserStats, goldReward, increaseStreak, manaReward, removeTaskDb, undoExpReward, undoGoldReward, undoManaReward } from "@/lib/db";
import { computeRewardMultipliers } from "@/lib/reward";
import { SupabaseClient } from "@supabase/supabase-js"
import { useCallback, useEffect, useState } from "react";

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
  const [totalTasksCompleted, setTotalTasksCompleted] = useState(0);
  const totalTasks = tasks.length

  const date = selectedDate ? (() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })() : undefined;
  

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
          startTime: t.start_time,  
          endTime: t.end_time,     
          isDone: await dailyTaskCheck(client, userId, Number(t.id), date),
        })))
        setTasks(taskWithStatus)
      } finally {
        setLoading(false)
      }
  }, [client, userId, selectedDay, date])

  function totalTasksLeft() {
    const completedTasks = tasks.filter(task => task.isDone).length
    setTotalTasksCompleted(completedTasks)
  }

  useEffect(() => {void refresh() }, [refresh])

  useEffect(() => {
    totalTasksLeft()
  }, [tasks])

  const completeTask = useCallback(async (taskId: string) => {
    if (!userId || !date) return
    const alreadyCompleted = await dailyTaskCheck(client, userId, Number(taskId), date)
    if (alreadyCompleted) return
    const taskData = await getTaskData(client, taskId)
    const stats = await getUserStats(client, userId)
    
    // Calculate reward multipliers using helper function
    const multipliers = computeRewardMultipliers(taskData?.difficulty, taskData?.streak)
    
    await increaseStreak(client, taskId, taskData?.streak)
    await goldReward(client, userId, multipliers.diffMultiplier, multipliers.streakMultiplier, stats?.gold)
    await expReward(client, userId, multipliers.diffMultiplier, multipliers.streakMultiplier, stats?.exp)
    const manaResult = await manaReward(client, userId, multipliers.diffMultiplier, multipliers.streakMultiplier, stats?.mana, stats?.total_mana)
    await dailyCompletion(client, userId, Number(taskId), date, manaResult.actualIncrease)
    setTasks(ts => ts.map(t => t.id === taskId ? {...t, isDone: true} : t))
    // Refresh tasks to get updated streak counts
    await refresh()
    // window.location.reload()
  }, [client, userId, date, refresh])

  const undoTask = useCallback(async (taskId: string) => {
    if (!userId || !date) return
    
    try {
      const completedData = await getTaskCompletionData(client, userId, Number(taskId), date)
      await deleteTaskCompleted(client, userId, Number(taskId), date)
      const taskData = await getTaskData(client, taskId)
      const stats = await getUserStats(client, userId)
      if (!stats) {
        console.error('User stats not found, cannot undo task rewards')
        return
      }
      
      // Calculate reward multipliers for undo (using streak - 1)
      const undoMultipliers = computeRewardMultipliers(taskData?.difficulty, taskData?.streak - 1)
      const currentMana = stats.mana
      const manaIncrease = completedData.mana_increase
      
      await decreaseStreak(client, taskId, taskData?.streak)
      await undoGoldReward(client, userId, undoMultipliers.diffMultiplier, undoMultipliers.streakMultiplier, stats.gold)
      await undoExpReward(client, userId, undoMultipliers.diffMultiplier, undoMultipliers.streakMultiplier, stats.exp)
      await undoManaReward(client, userId, currentMana, manaIncrease)
      
      setTasks(ts => ts.map(t => t.id === taskId ? {...t, isDone: false} : t))
      // Refresh tasks to get updated streak counts
      await refresh()
      // window.location.reload()

    } catch (error) {
      console.error('Error undoing task:', error)
      throw error // Re-throw to be caught by removeTask
    }
  }, [client, userId, date, refresh])

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

  return {tasks, loading, totalTasks, totalTasksCompleted, refresh, completeTask, undoTask, removeTask}


}

export default useTasksByDay;



