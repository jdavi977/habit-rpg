'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { useClerkSupabaseClient } from '@/lib/supabaseClient' 

type Task = {
  id: string;
  name: string;

};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [gold, setGold] = useState<number | null>(null)
  const [mana, setMana] = useState<number | null>(null)
  const [name, setName] = useState('')

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


  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Insert task into the "tasks" database
    await client.from('tasks').insert({
      name,
    })
    window.location.reload()
  }

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
  <>
    <div>

      {!loading && (
        <>
          <p>Gold: {gold ?? "not avail"}</p>
          <p>Mana: {mana ?? "not avail"}</p>
        </>
      )}

      <h1>Tasks</h1>

      {loading && <p>Loading...</p>}

      {!loading && tasks.length === 0 && <p>Add a task here</p>}

      <form onSubmit={createTask}>
        <input
          autoFocus
          type="text"
          name="name"
          placeholder="Enter new task"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <Button
          type='submit'
        >
          Add
        </Button>

        {!loading && tasks.length > 0 && tasks.map((task: { id: string; name: string }) => (
        <div
          key={task.id}
          className="flex "
        >
          <Button
            type="button"
            onClick={() => completedTask()}
          >
            Complete task
          </Button>
          <p>{task.name}</p>
          <Button
            type="button"
            onClick={() => removeTask(task.id)}
          >
            Remove
          </Button>
        </div>
      ))}

      </form>
    </div>
  </>
  )
}