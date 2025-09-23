"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createTask } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { SupabaseClient } from "@supabase/supabase-js";
import { Calendar } from "../ui/8bit/calendar";
import TimePicker from "../ui/TimePicker";
import { X, Plus } from "lucide-react";

type CreateTaskProps = {
  client: SupabaseClient;
  userId?: string;
}

const CreateTask = ({ client, userId }: CreateTaskProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("")
  const [difficulty, setDifficulty] = useState("");
  const [repeatOptions, setRepeatOptions] = useState("")
  const [days, setDays] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [timeSlot, setTimeSlot] = useState("")
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number; period: 'AM' | 'PM' }>({ hour: 9, minute: 0, period: 'AM' })
  const [endTime, setEndTime] = useState<{ hour: number; minute: number; period: 'AM' | 'PM' }>({ hour: 10, minute: 0, period: 'AM' })

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (!dates) return;
    setSelectedDates(dates);
  };

  // Convert selected dates to day names and update days state
  const updateDaysFromDates = () => {
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const uniqueDays = [...new Set(selectedDates.map(date => dayNames[date.getDay()]))];
    setDays(uniqueDays);
  };

  // Sync selected dates with days state
  useEffect(() => {
    updateDaysFromDates();
  }, [selectedDates]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDifficulty("");
    setRepeatOptions("");
    setDays([]);
    setSelectedDates([]);
    setTimeSlot("");
    setSelectedTime({ hour: 9, minute: 0, period: 'AM' });
    setEndTime({ hour: 10, minute: 0, period: 'AM' });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId) return;
    if (!title.trim()) return alert("Please enter a task title");
    if (!difficulty) return alert("Please select a difficulty");
    if (days.length === 0) return alert("Please select at least one day");

    createTask(client, userId, title, difficulty, days);

    resetForm();
    setIsModalOpen(false);

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

  const taskRepeatOptions = [
    {
      name: "Does Not Repeat",
      color: "from-green-500/20 to-green-600/10",
      borderColor: "border-green-500/30",
      textColor: "text-white-400",
    },
    {
      name: "Daily",
      color: "from-green-500/20 to-green-600/10",
      borderColor: "border-green-500/30",
      textColor: "text-white-400",
    },
    {
      name: "Weekly",
      color: "from-yellow-500/20 to-yellow-600/10",
      borderColor: "border-yellow-500/30",
      textColor: "text-white-400",
    },
    {
      name: "Monthly",
      color: "from-red-500/20 to-red-600/10",
      borderColor: "border-red-500/30",
      textColor: "text-white-400",
    },
    {
      name: "Every Weekday (Mon - Fri)",
      color: "from-red-500/20 to-red-600/10",
      borderColor: "border-red-500/30",
      textColor: "text-white-400",
    },
  ];

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={() => setIsModalOpen(true)}
        className="w-full h-16 rounded-xl bg-gradient-to-r from-cyber-blue-bright to-cyber-blue text-cyber-dark font-bold text-lg shadow-lg shadow-cyber-blue-bright/30 hover:shadow-xl hover:shadow-cyber-blue-bright/40 transition-all duration-200 transform hover:scale-[1.02]"
      >
        <Plus className="mr-2 h-6 w-6" />
        Create New Task
        <span className="ml-2">✨</span>
      </Button>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <Card className="bg-card/95 backdrop-blur-sm border-cyber-line-color shadow-2xl shadow-cyber-glow-primary/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold text-cyber-blue-bright flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
                  Create New Task
                </CardTitle>
                <Button
                  onClick={closeModal}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-cyber-blue/20"
                >
                  <X className="h-4 w-4" />
                </Button>
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
                    {/* Task Description Input */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-cyber-text-bright">
                        Description
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded-xl bg-gradient-to-r from-cyber-blue/10 to-cyber-blue/5 border border-cyber-line-color px-4 py-3 outline-none focus:border-cyber-blue-bright focus:ring-2 focus:ring-cyber-blue-bright/20 transition-all duration-200 text-cyber-text-bright placeholder-cyber-text-dim"
                          type="text"
                          value={description}
                          placeholder="Describe your task here!"
                          onChange={(e) => setDescription(e.target.value)}
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
                     <Calendar 
                       mode="multiple"
                       selected={selectedDates}
                       onSelect={handleDateSelect}
                     />

                     {/* Start Time Picker */}
                     <TimePicker
                       label="Start Time"
                       value={selectedTime}
                       onChange={setSelectedTime}
                     />

                     {/* End Time Picker */}
                     <TimePicker
                       label="End Time"
                       value={endTime}
                       onChange={setEndTime}
                     />

                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        {taskRepeatOptions.map((level) => (
                          <Button
                            key={level.name}
                            type="button"
                            onClick={() => setRepeatOptions(level.name)}
                            className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                              repeatOptions === level.name
                                ? `${level.color} ${level.borderColor} ${level.textColor} shadow-lg shadow-cyber-glow-primary/30`
                                : "bg-cyber-blue/10 border-cyber-line-color text-cyber-text-muted hover:bg-cyber-blue/20 hover:border-cyber-blue/40"
                            }`}
                          >
                            <span className="font-medium">{level.name}</span>
                          </Button>
                        ))}
                      </div>
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
          </div>
        </div>
      )}
    </>
  );
};

export default CreateTask;
