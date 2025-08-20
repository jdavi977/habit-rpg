'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClerkSupabaseClient } from '@/lib/supabaseClient' 
import CreateTask from '@/components/profile/CreateTask'
import { checkUserExists, dailyCompletion, dailyTaskCheck, getUserSettings, getSelectedDayTasks, getTaskData, getUserStats, goldReward, removeTaskDb, deleteTaskCompleted, undoGoldReward } from '@/lib/db'
import { diffMultiplier, streakMultiplier } from '@/lib/reward'
import useUserStats from '@/components/hooks/useUserStats';
import StatsCard from '@/components/profile/StatsCard'
import SettingsCard from '@/components/profile/SettingsCard'
import useUserSettings from '@/components/hooks/useUserSettings'

/**
 * Represents a task in the system
 * @typedef {Object} Task
 * @property {string} id - Unique identifier for the task
 * @property {string} title - Display name/description of the task
 */
type Task = {
  id: string;
  title: string;
};
/**
 * Profile page component that displays user statistics, daily tasks, and task management
 * 
 * This component serves as the main dashboard for users to:
 * - View their character stats (level, gold, mana)
 * - Manage daily tasks by day of the week
 * - Complete tasks to earn rewards
 * - Create new tasks
 * - Set daily reset time preferences
 * 
 * @component Profile
 * @returns {JSX.Element} The rendered profile page with user dashboard
 * 
 */
export default function Profile() {
  // Clerk authentication hook
  const { user } = useUser()

  // Supabase client for database operations
  const client = useClerkSupabaseClient()
  
  // Extract user ID from Clerk user object
  const id = user?.id;

  // State for managing tasks and user data
  const [tasks, setTasks] = useState<Task[]>([])
  const { loading, level, gold, mana } = useUserStats(client, id)
  const convertedTime = useUserSettings(client, id)

  // Available days for task selection
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const [selectedDay, setSelectedDay] = useState<string>('')

  // const [rolloverTime, setRolloverTime] = useState<RolloverTime>({ hour: 12, minute: 0, period: 'AM' })

  const [taskWithStatus, setTaskWithStatus] = useState<{id: string; title: string; isDone: boolean}[]>([]);

  const today = new Date().toISOString().slice(0, 10)


  // This useEffect will create a new array of tasks but with isDone boolean added to see if the task is completed
  useEffect(() => {
    if (!id || tasks.length === 0) { setTaskWithStatus([]); return; }
    let alive = true;
    (async () => {
      const results = await Promise.all(tasks.map(async t => ({
        ...t,
        isDone: await isTaskCompletedToday(t.id),
      })));
      if (alive) setTaskWithStatus(results)
    })();

    return () => { alive = false; };
  }, [id, tasks])


  useEffect(() => {
    if (!id) return
    let alive = true;
    (async () => {
      const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' });
      setSelectedDay(todayShort)
      await selectDays(todayShort)
  })();
    return () => { alive = false; };
  }, [id, client])

  /**
   * Select tasks for a specific day of the week
   * Updates the selected day and fetches corresponding tasks from database
   * 
   * @param {string} days - Three-letter day abbreviation (e.g., 'Mon', 'Tue')
   */
  async function selectDays(days: string) {
    setSelectedDay(days)
    const taskDays = await getSelectedDayTasks(client, days)
    if (taskDays) setTasks(taskDays)
  }

  /**
   * Remove a task from the database
   * Deletes the specified task and reloads the page to reflect changes
   * 
   * @param {string} task_id - Unique identifier of the task to remove
   */
  async function removeTask(task_id: string) {
    removeTaskDb(client, task_id)
    window.location.reload()
  }

  /**
   * Mark a task as completed for the current day
   * Checks if task was already completed today, then marks it complete and awards rewards
   * 
   * @param {string} task_id - Unique identifier of the completed task
   */
  async function markTaskCompletedToday(task_id: string) {
    const taskIdNum = Number(task_id)
    const completedTaskCheck = await dailyTaskCheck(client, (id ?? ""), taskIdNum, today)

    if (!completedTaskCheck) {
      await dailyCompletion(client, (id ?? ""), taskIdNum, today)
      await reward(task_id)
    }
  }

  async function isTaskCompletedToday(task_id: string) {
    const taskIdNum = Number(task_id)
    const completedTaskCheck = await dailyTaskCheck(client, (id ?? ""), taskIdNum, today)
    return completedTaskCheck;
  }

  async function undoTaskCompletion(task_id: string) {
    const taskIdNum = Number(task_id)
    deleteTaskCompleted(client, (id ?? ""), taskIdNum, today)
    undoReward(task_id)
  }

  async function undoReward(task_id: string) {
    const userData = await getTaskData(client, task_id)
    await undoGoldReward(client, (id ?? ""), (diffMultiplier(userData?.difficulty) ?? 0), streakMultiplier(userData?.streak), (gold ?? 0))
    window.location.reload()
  }

  /**
   * Award gold rewards for completing a task
   * Calculates reward based on task difficulty and user streak, then updates user's gold
   * 
   * @param {string} task_id - Unique identifier of the completed task
   */
  async function reward(task_id: string) {
    const userData = await getTaskData(client, task_id)
    await goldReward(client, (id ?? ""), (diffMultiplier(userData?.difficulty) ?? 0), streakMultiplier(userData?.streak), (gold ?? 0))
    window.location.reload()
  }

  return (
    <div className="min-h-screen text-slate-200 relative overflow-hidden">
      {/* Background Grid Pattern - Creates a subtle cyberpunk grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(24,206,242,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(24,206,242,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50"></div>
      
      {/* Animated Scan Lines - Adds dynamic cyberpunk visual effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-blue/5 to-transparent animate-scanline"></div>
      
      <div className="container mx-auto max-w-7xl px-4 py-10 relative z-10">
        {/* Header Section - Reserved for future content */}
        <div className="text-center mb-12">
          {/* Add content here*/}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
          {/* LEFT SIDE CONTENT - User stats and task management */}
          <div className="space-y-6">
            <StatsCard 
              loading={loading}
              level={level}
              gold={gold}
              mana={mana}
            />
            <SettingsCard 
              client={client}
              id={id}
              convertedTime={convertedTime}
            />
            {/* TASKS CARD - Task management and completion interface */}
            <Card className="bg-card/80 backdrop-blur-sm border-cyber-line-color shadow-lg shadow-cyber-glow-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-cyber-blue-bright flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
                  Daily Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Days Selector - Choose which day's tasks to view */}
                <div className="space-y-3">
                  <h3 className="text-sm text-cyber-text-muted">Select a day to view tasks</h3>
                  <div className="flex flex-wrap gap-2">
                    {days.map((day) => (
                      <Button
                        key={day}
                        type="button"
                        size="sm"
                        variant={selectedDay === day ? "default" : "secondary"}
                        className={`transition-all duration-200 ${
                          selectedDay === day 
                            ? 'bg-cyber-blue-bright text-cyber-dark shadow-lg shadow-cyber-blue-bright/30' 
                            : 'bg-cyber-blue/20 text-cyber-blue-bright border-cyber-line-color hover:bg-cyber-blue/30'
                        }`}
                        onClick={() => selectDays(day)}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Tasks List - Display and manage tasks for selected day */}
                <div className="space-y-3">
                  {loading ? (
                    // Loading state while tasks are being fetched
                    <div className="flex items-center justify-center h-20">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyber-blue-bright"></div>
                    </div>
                  ) : tasks.length === 0 ? (
                    // Empty state when no tasks exist for selected day
                    <div className="text-center py-8 text-cyber-text-muted">
                      <div className="text-4xl mb-2">📝</div>
                      <p>No tasks for {selectedDay}</p>
                      <p className="text-sm">Create some tasks to get started!</p>
                    </div>
                  ) : (
                    // Task list with completion and removal actions
                    <ul className="space-y-3">
                      {taskWithStatus.map(task => (
                        <li 
                          key={task.id}
                          className={`group flex items-center justify-between rounded-xl border border-cyber-line-color p-4 transition-all duration-200 hover:shadow-lg hover:shadow-cyber-glow-primary/20 hover:border-cyber-blue/40
                            ${task.isDone ? "bg-cyber-blue/300" : "bg-cyber-blue/100"}
                          `}
                        >
                          <span className="truncate pr-3 text-cyber-text-bright font-medium">{task.title}</span>
                          {/* Action buttons that appear on hover */}
                          <div className="flex gap-2">
                            {!task.isDone ? <Button
                              type="button"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30"
                              onClick={() => markTaskCompletedToday(task.id)}
                            >
                              ✓ Complete
                            </Button> : <Button
                              type="button"
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-green-600/30"
                              onClick={() => undoTaskCompletion(task.id)} // TO DO
                            >
                              Undo
                            </Button>
                            }
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="shadow-lg shadow-red-600/30"
                              onClick={() => removeTask(task.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE - Task creation interface */}
          <div className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-sm border-cyber-line-color shadow-lg shadow-cyber-glow-primary/20 h-fit">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-cyber-blue-bright flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
                  Create New Task
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CreateTask userId={id ?? ""}/>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}