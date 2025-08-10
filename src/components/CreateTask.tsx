'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useClerkSupabaseClient } from '@/lib/supabaseClient' 

const CreateTask = () => {
    const [title, setTitle] = useState("");
    const [difficulty, setDifficulty] = useState("")
    const [days, setDays] = useState<string[]>([])

    const client = useClerkSupabaseClient();

    const handleDayToggle = (day: string) => {
      if (!day) return;
      setDays((prev) => 
          prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
      )
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      if (!title.trim()) return alert("Please enter a task title");
      if (!difficulty) return alert("Please select a difficulty");
      if (days.length === 0) return alert("Please select at least one day");

      await client.from("tasks").insert({title, difficulty, days})

      setTitle("");
      setDifficulty("");
      setDays([]);

      window.location.reload()
    };

  return (
    <div>
        {/* HEADER- PROGRAM GALLERY */}
        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg overflow-hidden mb-16">
          {/* HEADER BAR */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-background/70">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
              <span className="text-sm text-primary font-medium">HabitRPG - Ascend</span>
            </div>

          </div>

          {/* HEADER CONTENT */}
          <div className="p-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
              <span className="text-foreground">Add Your </span>
              <span className="text-primary">Task</span>
            </h2>
          </div>

          <form
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            <div>
                <label className="block text-sm font-medium mb-2 text-center">Task Title</label>
                <div className="flex flex-wrap gap-2 justify-center">
                  <input 
                      className="w-150 rounded-xl bg-black/30 border border-border px-4 py-3 outline-none focus:border-primary"
                      type="text"
                      value={title}
                      placeholder='Enter task title'
                      onChange={(e) => setTitle(e.target.value)}
                      required
                  />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2 text-center">Task Difficulty</label>
                <div className="flex gap-3 justify-center">
                    {["Easy", "Medium", "Hard"].map((level) => (
                        <Button
                            type="button"
                            key={level}
                            onClick={() => setDifficulty(level)}
                            className={`px-4 py-2 rounded-full ${
                              difficulty === level ? "bg-primary text-black" : "bg-white/70 hover:bg-white/100"
                            }`}
                        >
                            {level}
                        </Button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2 text-center">Days</label>
                <div className="flex flex-wrap gap-3 justify-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <Button
                    type="button"
                    key={day}
                    onClick={() => handleDayToggle(day)}
                    className={`px-4 py-2 rounded-full transition ${
                         days.includes(day)
                           ? "bg-primary text-black"
                           : "bg-white/70 hover:bg-white/100"
                       }`}
                    >
                    {day}
                    </Button>
                ))}
                </div>
            </div>
            <div className='flex justify-center pb-10'>
              <Button
                  className="px-6 py-3 rounded-xl bg-primary text-black font-semibold"
                  type="submit"
              >
                  Create 
              </Button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default CreateTask;