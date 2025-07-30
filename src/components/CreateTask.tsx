'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { useClerkSupabaseClient } from '@/lib/supabaseClient' 



const CreateTask = () => {
    const [title, setTitle] = useState("");
    const [difficulty, setDifficulty] = useState("")
    const [days, setDays] = useState([""])

    const handleDayToggle = (day: string) => {
        setDays((prev) => 
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        )
    }


  return (
    <div className="w-full pb-24 pt-35 relative">
      <div className="container mx-auto max-w-7xl px-4">

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
          <div className="p-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-foreground">Add Your </span>
              <span className="text-primary">Task</span>
            </h2>
          </div>
          <form>
            <div>
                <label className="flex gap-2 justify-center">Task Title</label>
                <div className="flex flex-wrap gap-2 justify-center">
                <input 
                    type="text"
                    value={title}
                    placeholder='Enter task title'
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                </div>
            </div>
            <div className="flex gap-2 justify-center">
                <label>Task Difficulty</label>
                <div className="flex gap-2 justify-center">
                    {["Easy", "Medium", "Hard"].map((level) => (
                        <Button
                            type="button"
                            key={level}
                            onClick={() => setDifficulty(level)}
                            className={`px-4 py-2 rounded-lg border 
                            ${difficulty === level ? "bg-primary text-black" : "bg-gray-100"}
                `}
                        >
                            {level}
                        </Button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block font-medium mb-2">Days</label>
                <div className="flex flex-wrap gap-2 justify-center">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <Button
                    type="button"
                    key={day}
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-1 rounded-lg border transition
                        ${
                        days.includes(day)
                            ? "bg-green-500 text-white border-green-600"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                    >
                    {day}
                    </Button>
                ))}
                </div>
                {days.length > 0 && (
                <p className="mt-3 text-sm text-gray-600">
                    Selected: {days.join(", ")}
                </p>
                )}
            </div>
            <Button
                type="submit"
            >
                Create 
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;