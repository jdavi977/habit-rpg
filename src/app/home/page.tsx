
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

  async function selectDays(days: string) {
    // pulls day selection from database and compares it to buttons
    const { data: taskDays, error} = await client.from('tasks').select().contains('days', [days])

    // hides/shows tasks based on day(s) selected
    if (error) {
      console.error("Error fetching tasks:", error);
      return;
    }
    if (taskDays) setTasks(taskDays)
  }

  async function currDay(){
    // constants for highlighting buttons based on the day
    const weekday = new Array('Sun', 'Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat')
    const today = new Date()
    const day = weekday[today.getDay()]
  
    // makes current day a different color
    const todayButton = document.querySelector(`#${day}`);
    if (!todayButton) {
      console.error("Today button not found");
      return;
    }
    if (todayButton) {
      todayButton.setAttribute('style', 'background-color: #ffcc00; color: black;')
    }    
  }

    useEffect(() => {
        currDay();
    });

  async function removeTask(id: string) {
    await client.from('tasks').delete().eq('id', id)
    window.location.reload()
  }

  async function completedTask(task_id: string) {
    const id = user?.id;
    const today = new Date().toISOString().slice(0, 10)
    const taskIdNum = Number(task_id)
    
    const { count } = 
      await client.from('task_completions')
      .select('*', { count: 'exact', head: true})
      .eq('user_id', id)
      .eq('task_id', taskIdNum)
      .eq('date', today);

    const completed = (count ?? 0) > 0;

    if (!completed) {
      await client.from('task_completions').upsert([{ user_id: id, task_id: taskIdNum, date: today}],
        { onConflict: 'user_id, task_id, date', ignoreDuplicates: true},
      )
    }

    console.log(completed, count)

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
    <div className="min-h-screen [background-size:32px_32px] text-slate-200">
      <div className="container mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-10">

        
          {/* LEFT SIDE CONTENT*/}
          <aside className="space-y-6">

            <h1>TESTING PAGEEEEEEEEEEEEEEEEEEEEEEEE</h1>

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
              
              { /* Days Selector */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs opacity-70 mb-3">Select a day to see your tasks</h3>
                </div>
                <div id = "days">
                  <Button
                    type="button"
                      size="sm" 
                      className="bg-primary text-black"
                      onClick={() => selectDays('Sun')}
                      id = "Sun"
                      >
                        Sun
                      </Button>
                      <Button
                    type="button"
                      size="sm" 
                      className="bg-primary text-black"
                      onClick={() => selectDays('Mon')}
                      id = "Mon"
                      >
                        Mon
                      </Button>
                  <Button
                    type="button"
                      size="sm" 
                      className="bg-primary text-black"
                      onClick={() => selectDays('Tue')}
                      id = "Tue"
                      >
                        Tue
                      </Button>
                  <Button
                    type="button"
                      size="sm" 
                      className="bg-primary text-black"
                      onClick={() => selectDays('Wed')}
                      id = "Wed"
                      >
                        Wed
                      </Button>
                      <Button
                    type="button"
                      size="sm" 
                      className="bg-primary text-black"
                      onClick={() => selectDays('Thu')}
                      id = "Thu"
                      >
                        Thu
                      </Button>
                      <Button
                    type="button"
                      size="sm" 
                      className="bg-primary text-black"
                      onClick={() => selectDays('Fri')}
                      id = "Fri"
                      >
                        Fri
                      </Button>
                      <Button
                    type="button"
                      size="sm" 
                      className="bg-primary text-black"
                      onClick={() => selectDays('Sat')}
                      id = "Sat"
                      >
                        Sat
                      </Button>
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