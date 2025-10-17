"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { createTask } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { SupabaseClient } from "@supabase/supabase-js";
import { Calendar } from "../ui/calendar";
import { X, Plus, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import React from "react";

type CreateTaskProps = {
  client: SupabaseClient;
  userId?: string;
};

const CreateTask = ({ client, userId }: CreateTaskProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [repeatOptions, setRepeatOptions] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date>();

  function updateSelectedDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDifficulty("");
    setRepeatOptions("");
    setDays([]);
    setSelectedDates(undefined);
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
    if (!selectedDates) return alert("Please select a date");
    if (repeatOptions == "") return alert("Please choose a repeat option");

    const date = updateSelectedDate(selectedDates);


    createTask(
      client,
      userId,
      title,
      description,
      difficulty,
      date,
      repeatOptions
    );

    

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
      rrule: "DNR",
      color: "from-green-500/20 to-green-600/10",
      borderColor: "border-green-500/30",
      textColor: "text-white-400",
    },
    {
      name: "Daily",
      rrule: "D",
      color: "from-green-500/20 to-green-600/10",
      borderColor: "border-green-500/30",
      textColor: "text-white-400",
    },
    {
      name: "Weekly",
      rrule: "W",
      color: "from-yellow-500/20 to-yellow-600/10",
      borderColor: "border-yellow-500/30",
      textColor: "text-white-400",
    },
    {
      name: "Monthly",
      rrule: "M", 
      color: "from-red-500/20 to-red-600/10",
      borderColor: "border-red-500/30",
      textColor: "text-white-400",
    },
    {
      name: "Every Weekday",
      rrule: "DW",
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
        className="bg-cyber-blue hover:bg-cyber-blue-bright text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-cyber-blue/30"
      >
        <Plus className="mr-2 h-6 w-6" />
        Create New Task
        <span className="ml-2">✨</span>
      </Button>

      {/* Modal Overlay */}
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Enhanced Backdrop with Grid Pattern */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={(e) => {
                // Only close if clicking directly on the backdrop, not on child elements
                if (e.target === e.currentTarget) {
                  closeModal();
                }
              }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(24,206,242,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(24,206,242,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>
            </div>

            {/* Modal Content with Enhanced Styling */}
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden mx-auto my-auto">
              {/* Outer Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyber-blue-bright/30 via-cyber-blue/20 to-cyber-blue-bright/30 rounded-2xl blur-sm opacity-60"></div>

              <Card className="relative bg-gradient-to-br from-cyber-dark/95 via-cyber-terminal-bg/95 to-cyber-dark/95 backdrop-blur-xl border-2 border-cyber-line-color shadow-2xl shadow-cyber-glow-primary/30 overflow-hidden">
                {/* Header with Enhanced Styling */}
                <CardHeader className="relative border-b border-cyber-line-color/50 bg-gradient-to-r from-cyber-blue/10 to-transparent">
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-3 h-3 bg-cyber-blue-bright rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-cyber-blue-bright rounded-full animate-ping opacity-30"></div>
                      </div>
                      <CardTitle className="text-2xl font-bold text-cyber-blue-bright tracking-wider">
                        CREATE NEW TASK
                      </CardTitle>
                    </div>
                    <Button
                      onClick={closeModal}
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 hover:bg-cyber-blue/20 border border-cyber-line-color/50 hover:border-cyber-blue-bright/50 transition-all duration-200"
                    >
                      <X className="h-5 w-5 text-cyber-text-muted hover:text-cyber-blue-bright transition-colors" />
                    </Button>
                  </div>

                  {/* Subtitle */}
                  <div className="mt-3 text-center">
                    <p className="text-cyber-text-muted text-sm font-medium">
                      ⚡ Build your daily routine and level up your character ⚡
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="p-8 overflow-x-hidden">
                  <div className="space-y-8">
                    {/* Form Container */}
                    <form
                      onSubmit={handleSubmit}
                      className="space-y-8 overflow-x-hidden"
                    >
                      {/* Basic Information Section */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-1 h-6 bg-cyber-blue-bright rounded-full"></div>
                          <h3 className="text-lg font-bold text-cyber-blue-bright tracking-wide">
                            BASIC INFORMATION
                          </h3>
                        </div>

                        {/* Task Title Input */}
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-cyber-text-bright flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyber-blue-bright rounded-full"></span>
                            Task Title
                          </label>
                          <div className="relative group">
                            <input
                              className="w-full rounded-xl bg-gradient-to-r from-cyber-blue/15 to-cyber-blue/8 border-2 border-cyber-line-color px-6 py-4 outline-none focus:border-cyber-blue-bright focus:ring-4 focus:ring-cyber-blue-bright/20 transition-all duration-300 text-cyber-text-bright placeholder-cyber-text-dim text-lg font-medium"
                              type="text"
                              value={title}
                              placeholder="Enter your epic task title..."
                              onChange={(e) => setTitle(e.target.value)}
                              required
                            />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyber-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyber-blue-bright to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        </div>

                        {/* Task Description Input */}
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-cyber-text-bright flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyber-blue-bright rounded-full"></span>
                            Description
                          </label>
                          <div className="relative group">
                            <textarea
                              className="w-full rounded-xl bg-gradient-to-r from-cyber-blue/15 to-cyber-blue/8 border-2 border-cyber-line-color px-6 py-4 outline-none focus:border-cyber-blue-bright focus:ring-4 focus:ring-cyber-blue-bright/20 transition-all duration-300 text-cyber-text-bright placeholder-cyber-text-dim resize-none h-24"
                              value={description}
                              placeholder="Describe your task in detail..."
                              onChange={(e) => setDescription(e.target.value)}
                            />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyber-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyber-blue-bright to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        </div>
                      </div>

                      {/* Task Configuration Section */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-1 h-6 bg-cyber-blue-bright rounded-full"></div>
                          <h3 className="text-lg font-bold text-cyber-blue-bright tracking-wide">
                            TASK CONFIGURATION
                          </h3>
                        </div>

                        {/* Difficulty Selection */}
                        <div className="space-y-4">
                          <label className="text-sm font-semibold text-cyber-text-bright flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyber-blue-bright rounded-full"></span>
                            Task Difficulty
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {difficultyLevels.map((level) => (
                              <Button
                                key={level.name}
                                type="button"
                                onClick={() => setDifficulty(level.name)}
                                className={`h-16 rounded-xl border-2 transition-all duration-300 ${
                                  difficulty === level.name
                                    ? `${level.color} ${level.borderColor} ${level.textColor} shadow-xl shadow-cyber-glow-primary/40 ring-2 ring-cyber-blue-bright/50`
                                    : "bg-gradient-to-br from-cyber-blue/15 to-cyber-blue/8 border-cyber-line-color text-cyber-text-muted hover:bg-gradient-to-br hover:from-cyber-blue/25 hover:to-cyber-blue/15 hover:border-cyber-blue/50 hover:text-cyber-text-bright"
                                }`}
                              >
                                <span className="font-bold text-lg">
                                  {level.name}
                                </span>
                              </Button>
                            ))}
                          </div>
                        </div>
                        {/* Schedule Section */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-1 h-6 bg-cyber-blue-bright rounded-full"></div>
                            <h3 className="text-lg font-bold text-cyber-blue-bright tracking-wide">
                              SCHEDULE & TIMING
                            </h3>
                          </div>

                          {/* Calendar */}
                          <div className="space-y-4">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "justify-start text-left font-normal",
                                    !selectedDates && "text-muted-foreground"
                                  )}
                                  onClick={() => console.log(selectedDates)}
                                >
                                  <CalendarIcon className="mr-2 size-4" />
                                  {selectedDates ? (
                                    selectedDates.toLocaleDateString()
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 z-[10000]">
                                <Calendar
                                  mode="single"
                                  selected={selectedDates}
                                  onSelect={setSelectedDates}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        {/* Repeat Options */}
                        <div className="space-y-4">
                          <label className="text-sm font-semibold text-cyber-text-bright flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyber-blue-bright rounded-full"></span>
                            Repeat Options
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {taskRepeatOptions.map((option) => (
                              <Button
                                key={option.rrule}
                                type="button"
                                onClick={() => setRepeatOptions(option.rrule)}
                                className={`h-14 rounded-xl border-2 transition-all duration-300 ${
                                  repeatOptions === option.rrule
                                    ? `${option.color} ${option.borderColor} ${option.textColor} shadow-xl shadow-cyber-glow-primary/40 ring-2 ring-cyber-blue-bright/50`
                                    : "bg-gradient-to-br from-cyber-blue/15 to-cyber-blue/8 border-cyber-line-color text-cyber-text-muted hover:bg-gradient-to-br hover:from-cyber-blue/25 hover:to-cyber-blue/15 hover:border-cyber-blue/50 hover:text-cyber-text-bright"
                                }`}
                              >
                                <span className="font-medium text-sm text-center leading-tight">
                                  {option.name}
                                </span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Submit Section */}
                      <div className="pt-6 border-t border-cyber-line-color/50">
                        <div className="space-y-4">
                          {/* Submit Button */}
                          <Button
                            className="w-full h-16 rounded-xl bg-gradient-to-r from-cyber-blue-bright via-cyber-blue to-cyber-blue-bright text-cyber-dark font-bold text-xl shadow-2xl shadow-cyber-blue-bright/40 hover:shadow-3xl hover:shadow-cyber-blue-bright/50 transition-all duration-300 hover:brightness-110"
                            type="submit"
                          >
                            <span className="mr-3 text-2xl">⚡</span>
                            CREATE TASK
                            <span className="ml-3 text-2xl">⚡</span>
                          </Button>

                          {/* Visual Feedback */}
                          {title && difficulty && days.length > 0 && (
                            <div className="relative">
                              <div className="absolute -inset-1 bg-gradient-to-r from-green-500/30 to-green-600/20 rounded-xl blur-sm opacity-60"></div>
                              <div className="relative text-center p-6 rounded-xl bg-gradient-to-r from-green-500/15 to-green-600/8 border-2 border-green-500/30">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                  <p className="text-green-400 text-lg font-bold">
                                    READY TO DEPLOY
                                  </p>
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                </div>
                                <p className="text-green-300 text-base font-medium mb-1">
                                  Task:{" "}
                                  <span className="text-green-200 font-bold">
                                    {title}
                                  </span>
                                </p>
                                <p className="text-green-400/80 text-sm">
                                  {difficulty} difficulty • {days.length} day
                                  {days.length > 1 ? "s" : ""} selected
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default CreateTask;
