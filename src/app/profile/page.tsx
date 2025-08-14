'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClerkSupabaseClient } from '@/lib/supabaseClient' 
import CreateTask from '@/components/CreateTask'
import TimeSelector from '@/components/TimeSelector'
import { dailyCompletion, dailyTaskCheck, getTaskData, getUserStats, goldReward, removeTaskDb } from '@/lib/db'
import { diffMultiplier, streakMultiplier } from '@/lib/reward'

type Task = {
  id: string;
  title: string;
};

export default function Profile() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [gold, setGold] = useState<number | null>(null)
  const [mana, setMana] = useState<number | null>(null)
  const [exp, setExp] = useState<number | null>(null)
  const [level, setLevel] = useState<number | 1>(1)
  const [rolloverTime, setRolloverTime] = useState({ hour: 12, minute: 0, period: 'AM' as 'AM' | 'PM' })
  const [selectedDay, setSelectedDay] = useState<string>('')

  // The `useUser()` hook is used to ensure that Clerk has loaded data about the signed in user
  const { user } = useUser()

  // Create a `client` object for accessing Supabase data using the Clerk token
  const client = useClerkSupabaseClient()

  // The unique identifier of the authenticated user.
  const id = user?.id;

  // This `useEffect` will wait for the User object to be loaded before requesting
  // the tasks for the signed in user
  useEffect(() => {
    if (!user) return

    async function loadData() {
      setLoading(true)

      const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' });
      setSelectedDay(todayShort)
      selectDays(todayShort)

      const userStats = await getUserStats(client, (id ?? ""))
      if (userStats) {
        setLevel(userStats.level)
        setGold(userStats.gold)
        setMana(userStats.mana)
        setExp(userStats.exp)
      } else {
        console.log("No user stats found yet for", user?.id)
      }
      setLoading(false)
    }

    loadData()
  }, [user])

  async function selectDays(days: string) {
    setSelectedDay(days)
    const { data: taskDays } = await client.from('tasks').select().contains('days', [days])
    if (taskDays) setTasks(taskDays)
  }

  async function removeTask(task_id: string) {
    removeTaskDb(client, task_id)
    window.location.reload()
  }

  async function completedTask(task_id: string) {
    const today = new Date().toISOString().slice(0, 10)
    const taskIdNum = Number(task_id)
    const completedTaskCheck = await dailyTaskCheck(client, (id ?? ""), taskIdNum, today)

    if (!completedTaskCheck) {
      dailyCompletion(client, (id ?? ""), taskIdNum, today)
      reward(task_id)
    }
  }

  async function reward(task_id: string) {
    const userData = await getTaskData(client, task_id)
    await goldReward(client, (id ?? ""), (diffMultiplier(userData?.difficulty) ?? 0), streakMultiplier(userData?.streak), (gold ?? 0))
    window.location.reload()
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-cyber-black to-cyber-dark text-slate-200 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(24,206,242,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(24,206,242,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50"></div>
      
      {/* Animated Scan Lines */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-blue/5 to-transparent animate-scanline"></div>
      
      <div className="container mx-auto max-w-7xl px-4 py-10 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          {/* Add content here*/}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
          {/* LEFT SIDE CONTENT */}
          <div className="space-y-6">
            {/* STATS CARD */}
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
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-cyber-blue/10 to-cyber-blue/5 border border-cyber-line-color">
                      <div className="text-2xl font-bold text-cyber-blue-bright mb-1">{level ?? "1"}</div>
                      <div className="text-xs text-cyber-text-muted uppercase tracking-wider">Level</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
                      <div className="text-2xl font-bold text-yellow-400 mb-1">{gold ?? "0"}</div>
                      <div className="text-xs text-cyber-text-muted uppercase tracking-wider">Gold</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                      <div className="text-2xl font-bold text-purple-400 mb-1">{mana ?? "0"}</div>
                      <div className="text-xs text-cyber-text-muted uppercase tracking-wider">Mana</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue-bright"></div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-cyber-line-color">
                  <h3 className="text-sm font-semibold text-cyber-text-bright mb-3">Daily Reset Time</h3>
                  <TimeSelector 
                    initialTime={rolloverTime}
                    onTimeChange={setRolloverTime}
                  />
                </div>
              </CardContent>
            </Card>

            {/* TASKS CARD */}
            <Card className="bg-card/80 backdrop-blur-sm border-cyber-line-color shadow-lg shadow-cyber-glow-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-cyber-blue-bright flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
                  Daily Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Days Selector */}
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

                {/* Tasks List */}
                <div className="space-y-3">
                  {loading ? (
                    <div className="flex items-center justify-center h-20">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyber-blue-bright"></div>
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-8 text-cyber-text-muted">
                      <div className="text-4xl mb-2">📝</div>
                      <p>No tasks for {selectedDay}</p>
                      <p className="text-sm">Create some tasks to get started!</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {tasks.map((task: { id: string; title: string }) => (
                        <li 
                          key={task.id}
                          className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-cyber-blue/10 to-cyber-blue/5 border border-cyber-line-color p-4 transition-all duration-200 hover:shadow-lg hover:shadow-cyber-glow-primary/20 hover:border-cyber-blue/40"
                        >
                          <span className="truncate pr-3 text-cyber-text-bright font-medium">{task.title}</span>
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

          {/* RIGHT SIDE - CREATE TASK */}
          <div className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-sm border-cyber-line-color shadow-lg shadow-cyber-glow-primary/20 h-fit">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-cyber-blue-bright flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
                  Create New Task
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CreateTask />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}