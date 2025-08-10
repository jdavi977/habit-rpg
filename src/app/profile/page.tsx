'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { useClerkSupabaseClient } from '@/lib/supabaseClient' 
import CreateTask from '@/components/CreateTask'
import { dailyCompletion, dailyTaskCheck, getTaskData, getTasks, getUserStats, goldReward, removeTaskDb } from '@/lib/db'
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
  const [level, setLevel] = useState<number | 1>(1)

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
      const tasksData = await getTasks(client)    
      const userStats = await getUserStats(client, (id ?? ""))
      
      if (tasksData) setTasks(tasksData)

      if (userStats) {
        setLevel(userStats.level)
        setGold(userStats.gold)
        setMana(userStats.mana)
      } else {
        console.log("No user row found yet for", user?.id)
      }
      setLoading(false)
    }

    loadData()
  }, [user])


  async function removeTask(task_id: string) {
    removeTaskDb(client, task_id)
    window.location.reload()
  }

  async function completedTask(task_id: string) {
    const today = new Date().toISOString().slice(0, 10)
    const taskIdNum = Number(task_id)
    const completedTaskCheck = await dailyTaskCheck(client, (id ?? ""), taskIdNum, today)

    reward(task_id)
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

  return (
    <div className="min-h-screen [background-size:32px_32px] text-slate-200">
      <div className="container mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-10">

          {/* LEFT SIDE CONTENT*/}
          <aside className="space-y-6">

            {/* STATS */}
            <section className="rounded-2xl border border-border bg-card/90 backdrop-blur-sm p-5">
              <h2 className="text-sm uppercase tracking-wider opacity-70 mb-3">Stats</h2>
              {!loading && (
                <div className="flex gap-6">
                  <div>
                    <div className="text-xs opacity-70">Level: </div>                                
                    <div className="text-xl font-semibold">{level ?? "not avail"}</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-70">Gold: </div>                                
                    <div className="text-xl font-semibold">{gold ?? "not avail"}</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-70">Mana: </div>
                    <div className="text-xl font-semibold">{mana ?? "not avail"}</div>
                  </div>
                </div>
              )}
            </section>

            {/* TASKS */}
            <section className="rounded-2xl border border-border bg-card/90 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm uppercase tracking-wider opacity-70">Tasks</h2>
              </div>

              <ul className="space-y-3">
              {loading && <p>Loading...</p>}

              {!loading && tasks.length === 0}
                {!loading && tasks.length > 0 && tasks.map((task: { id: string; title: string }) => (
                <li 
                  className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2"
                  key={task.id}>
                  <span className="truncate pr-3">{task.title}</span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm" 
                      className="bg-primary text-black"
                      onClick={() => completedTask(task.id)}
                    >
                      Done
                    </Button>
                    <Button
                      type="button"
                      size="sm" 
                      variant="secondary"
                      onClick={() => removeTask(task.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
              </ul>
            </section>
          </aside>

          <CreateTask/>
          </div>
        </div>
  )
}