'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClerkSupabaseClient } from '@/lib/supabaseClient' 
import CreateTask from '@/components/CreateTask'
import TimeSelector from '@/components/TimeSelector'
import { checkUserExists, dailyCompletion, dailyTaskCheck, getUserSettings, getSelectedDayTasks, getTaskData, getUserStats, goldReward, removeTaskDb } from '@/lib/db'
import { diffMultiplier, streakMultiplier } from '@/lib/reward'
import RolloutSelector from '@/components/RolloutSelector'

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
 * Time configuration for daily rollover
 * @typedef {Object} RolloverTime
 * @property {number} hour - Hour in 12-hour format (1-12)
 * @property {number} minute - Minute (0-59)
 * @property {'AM' | 'PM'} period - Time period (AM or PM)
 */
type RolloverTime = {
  hour: number;
  minute: number;
  period: 'AM' | 'PM';
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
export default function Home() {
  // State for managing tasks and user data
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const [gold, setGold] = useState<number | null>(null)
  const [mana, setMana] = useState<number | null>(null)
  const [level, setLevel] = useState<number | 1>(1)

  // Available days for task selection
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const [selectedDay, setSelectedDay] = useState<string>('')

  const [rolloverTime, setRolloverTime] = useState<RolloverTime>({ hour: 12, minute: 0, period: 'AM' })

  // Clerk authentication hook
  const { user } = useUser()

  // Supabase client for database operations
  const client = useClerkSupabaseClient()

  // Extract user ID from Clerk user object
  const id = user?.id;

  /**
   * This function takes the user settings data and loads it onto the page
   */
  const loadUserSettings = async () => {
    if (!id)
      return;
    const settingsInfo = await getUserSettings(client, id)
    const convertedTime = from24HourString(settingsInfo.rollover_time)
    setRolloverTime(convertedTime)
  }

  /**
   * Converts the rollover time in the database to match the RolloverTime type fields 
   * @param pgTime The database time being coverted
   * @returns The database time converted to match RolloverTime type
   */
  function from24HourString(pgTime: string) {
    const [hh, mm] = pgTime.split(':').map(Number);
  
    let period: 'AM' | 'PM' = hh >= 12 ? 'PM' : 'AM';
  
    let hour = hh % 12;
    if (hour === 0) hour = 12; 
  
    return {
      hour,
      minute: mm,
      period,
    };
  }

  /**
   * Initialize user data and load initial state
   * Sets up the selected day to today and loads user statistics
   */
  useEffect(() => {
    if (!user) return

    const initializeUser = async () => {
      setLoading(true)

      // Set selected day to current day
      const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' });
      setSelectedDay(todayShort)

      // Call selectDays which updates tasks to current day
      selectDays(todayShort)


      // Ensure user exists in database before fetching stats
      const userExists = await checkUserExists(client, user.id)
      if (userExists) {
        loadUserStats();
        loadUserSettings();
      }
      
      setLoading(false);
    }
    
    /**
     * Load user statistics from the database
     * Updates level, gold, and mana state with user data
     */
    const loadUserStats = async () => {
      try {
        const userStats = await getUserStats(client, (id ?? ""))
        if (userStats) {
          setLevel(userStats.level)
          setGold(userStats.gold)
          setMana(userStats.mana)
        }
      } catch (error) {
        console.log("Failed to load user stats: ", error)
      }
    };

    initializeUser()
  }, [id])

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
  async function completedTask(task_id: string) {
    const today = new Date().toISOString().slice(0, 10)
    const taskIdNum = Number(task_id)
    const completedTaskCheck = await dailyTaskCheck(client, (id ?? ""), taskIdNum, today)

    if (!completedTaskCheck) {
      dailyCompletion(client, (id ?? ""), taskIdNum, today)
      reward(task_id)
    }
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
            {/* STATS CARD - Displays character level, gold, and mana */}
            <Card className="bg-card/80 backdrop-blur-sm border-cyber-line-color shadow-lg shadow-cyber-glow-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-cyber-blue-bright flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
                  Character Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!loading ? (
                  <div className="grid grid-cols-3 gap-4">
                    {/* Level Display */}
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-cyber-blue/10 to-cyber-blue/5 border border-cyber-line-color">
                      <div className="text-2xl font-bold text-cyber-blue-bright mb-1">{level ?? "1"}</div>
                      <div className="text-xs text-cyber-text-muted uppercase tracking-wider">Level</div>
                    </div>
                    {/* Gold Display */}
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
                      <div className="text-2xl font-bold text-yellow-400 mb-1">{gold ?? "0"}</div>
                      <div className="text-xs text-cyber-text-muted uppercase tracking-wider">Gold</div>
                    </div>
                    {/* Mana Display */}
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                      <div className="text-2xl font-bold text-purple-400 mb-1">{mana ?? "0"}</div>
                      <div className="text-xs text-cyber-text-muted uppercase tracking-wider">Mana</div>
                    </div>
                  </div>
                ) : (
                  // Loading spinner while stats are being fetched
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue-bright"></div>
                  </div>
                )}
                
                {/* Daily Reset Time Configuration */}
                <div className="pt-4 border-t border-cyber-line-color">
                  <h3 className="text-sm font-semibold text-cyber-text-bright mb-3">Daily Reset Time</h3>
                  <TimeSelector 
                    initialTime={rolloverTime}
                    onTimeChange={setRolloverTime}
                  />
                  <div>
                    Current Reset Time: --
                    {rolloverTime.hour}
                    {rolloverTime.minute}
                    {rolloverTime.period}
                  </div>
                  <RolloutSelector 
                    initialTime={rolloverTime}
                    onTimeChange={setRolloverTime}
                    userId={id}
                  />
                </div>
              </CardContent>
            </Card>

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
                      {tasks.map((task: { id: string; title: string }) => (
                        <li 
                          key={task.id}
                          className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-cyber-blue/10 to-cyber-blue/5 border border-cyber-line-color p-4 transition-all duration-200 hover:shadow-lg hover:shadow-cyber-glow-primary/20 hover:border-cyber-blue/40"
                        >
                          <span className="truncate pr-3 text-cyber-text-bright font-medium">{task.title}</span>
                          {/* Action buttons that appear on hover */}
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              type="button"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30"
                              onClick={() => completedTask(task.id)}
                            >
                              ✓ Complete
                            </Button>
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