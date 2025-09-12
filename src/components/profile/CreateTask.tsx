"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createTask } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { SupabaseClient } from "@supabase/supabase-js";

type CreateTaskProps = {
  client: SupabaseClient;
  userId?: string;
}

const CreateTask = ({ client, userId }: CreateTaskProps) => {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [days, setDays] = useState<string[]>([]);

  const handleDayToggle = (day: string) => {
    if (!day) return;
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId) return;
    if (!title.trim()) return alert("Please enter a task title");
    if (!difficulty) return alert("Please select a difficulty");
    if (days.length === 0) return alert("Please select at least one day");

    createTask(client, userId, title, difficulty, days);

    setTitle("");
    setDifficulty("");
    setDays([]);

    window.location.reload();
  }

  const difficultyLevels = [
    {
      name: "Easy",
      color: "from-green-500/20 to-green-600/10",
      borderColor: "border-green-500/30",
      textColor: "text-white-400",
    },
    {
      name: "Medium",
      color: "from-yellow-500/20 to-yellow-600/10",
      borderColor: "border-yellow-500/30",
      textColor: "text-white-400",
    },
    {
      name: "Hard",
      color: "from-red-500/20 to-red-600/10",
      borderColor: "border-red-500/30",
      textColor: "text-white-400",
    },
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-cyber-line-color shadow-lg shadow-cyber-glow-primary/20 h-fit">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-cyber-blue-bright flex items-center gap-2">
          <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
          Create New Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <p className="text-cyber-text-muted text-sm">
              Build your daily routine and level up your character
            </p>
          </div>

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Title Input */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-cyber-text-bright">
                Task Title
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-xl bg-gradient-to-r from-cyber-blue/10 to-cyber-blue/5 border border-cyber-line-color px-4 py-3 outline-none focus:border-cyber-blue-bright focus:ring-2 focus:ring-cyber-blue-bright/20 transition-all duration-200 text-cyber-text-bright placeholder-cyber-text-dim"
                  type="text"
                  value={title}
                  placeholder="Enter your task title..."
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyber-blue/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-cyber-text-bright">
                Task Difficulty
              </label>
              <div className="grid grid-cols-3 gap-3">
                {difficultyLevels.map((level) => (
                  <Button
                    key={level.name}
                    type="button"
                    onClick={() => setDifficulty(level.name)}
                    className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                      difficulty === level.name
                        ? `${level.color} ${level.borderColor} ${level.textColor} shadow-lg shadow-cyber-glow-primary/30`
                        : "bg-cyber-blue/10 border-cyber-line-color text-cyber-text-muted hover:bg-cyber-blue/20 hover:border-cyber-blue/40"
                    }`}
                  >
                    <span className="font-medium">{level.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Days Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-cyber-text-bright">
                Select Days
              </label>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <Button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                      days.includes(day)
                        ? "bg-cyber-blue-bright text-cyber-dark border-cyber-blue-bright shadow-lg shadow-cyber-blue-bright/30"
                        : "bg-cyber-blue/10 border-cyber-line-color text-cyber-text-muted hover:bg-cyber-blue/20 hover:border-cyber-blue/40"
                    }`}
                  >
                    <span className="text-sm font-medium">{day}</span>
                  </Button>
                ))}
              </div>
              {days.length > 0 && (
                <p className="text-xs text-cyber-text-muted text-center">
                  Selected: {days.join(", ")}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                className="w-full h-12 rounded-xl bg-gradient-to-r from-cyber-blue-bright to-cyber-blue text-cyber-dark font-bold text-lg shadow-lg shadow-cyber-blue-bright/30 hover:shadow-xl hover:shadow-cyber-blue-bright/40 transition-all duration-200 transform hover:scale-[1.02]"
                type="submit"
              >
                <span className="mr-2">✨</span>
                Create Task
                <span className="ml-2">✨</span>
              </Button>
            </div>

            {/* Visual Feedback */}
            {title && difficulty && days.length > 0 && (
              <div className="text-center p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/20">
                <p className="text-green-400 text-sm font-medium">
                  Ready to create:{" "}
                  <span className="text-green-300">{title}</span>
                </p>
                <p className="text-green-400/70 text-xs mt-1">
                  {difficulty} difficulty • {days.length} day
                  {days.length > 1 ? "s" : ""} selected
                </p>
              </div>
            )}
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateTask;
