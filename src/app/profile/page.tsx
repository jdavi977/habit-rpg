'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { useClerkSupabaseClient } from '@/lib/supabaseClient' 
import CreateTask from '@/components/CreateTask'

type Task = {
  id: string;
  title: string;

};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [gold, setGold] = useState<number | null>(null)
  const [mana, setMana] = useState<number | null>(null)

  // The `useUser()` hook is used to ensure that Clerk has loaded data about the signed in user
  const { user } = useUser()

  // Create a `client` object for accessing Supabase data using the Clerk token
  const client = useClerkSupabaseClient()

  // This `useEffect` will wait for the User object to be loaded before requesting
  // the tasks for the signed in user
  useEffect(() => {
    if (!user) return

    async function loadData() {
      setLoading(true)

      const { data: tasksData} = await client.from('tasks').select()
      if (tasksData) setTasks(tasksData)

      const { data: userStats, error } = await client
        .from('users')
        .select('gold, mana')
        .eq('id', user?.id)
        .maybeSingle()

      if (error) {
        console.error("Error fetching user stats:", error.message)
      } else if (userStats) {
        setGold(userStats.gold)
        setMana(userStats.mana)
      } else {
        console.log("No user row found yet for", user?.id)
      }

      setLoading(false)
    }

    loadData()
  }, [user])


  async function removeTask(id: string) {
    console.log(gold)
    await client.from('tasks').delete().eq('id', id)
    window.location.reload()
  }

async function completedTask() {
  const id = user?.id;
  const { data, error } = await client
    .from('users')
    .update({ gold: (gold ?? 0) + 10, mana: (mana ?? 0) + 5 })
    .eq('id', id)
    .select()
    .single()

  if (!error && data) {
    setGold(data.gold) //
    setMana(data.mana)
  }
}

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,_#0b1220_1px,_#0a0f1a_1px)] [background-size:32px_32px] text-slate-200">
      <div className="container mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-10">

          {/* LEFT SIDE CONTENT*/}
          <aside className="space-y-6">

            {/* STATS */}
            <section className="rounded-2xl border border-border bg-card/90 backdrop-blur-sm p-5">
              <h2 className="text-sm uppercase tracking-wider opacity-70 mb-3">Stats</h2>
              {!loading && (
                <div className="flex gap-6">
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
                      onClick={() => completedTask()}
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