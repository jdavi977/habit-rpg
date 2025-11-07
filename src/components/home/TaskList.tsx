/**
 * @fileoverview Task list display and management component
 * @module components/profile/TaskList
 * 
 * Renders a list of tasks with completion controls, streak counters,
 * and removal options. Shows different states (empty, loading, completed).
 * Only allows completion/undo for current day tasks (view-only for past).
 */

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Flame, CheckCircle, RotateCcw, Trash2 } from "lucide-react";

type TaskListProps = {
  selectedDay: string,
  tasks: {id: string, title: string, streak: number, isDone: boolean, startTime: string, endTime: string}[];
  completeTask: (taskId: string) => void,
  undoTask: (taskId: string) => void,
  removeTask: (taskId: string) => void,
  currentDay: string;
  loading: boolean;
}

/**
 * Component that renders and manages task list
 * 
 * Displays tasks with completion controls, streak indicators, and remove buttons.
 * Only allows task completion/undo on the current day (past days are view-only).
 * Shows loading and empty states.
 * 
 * @param {TaskListProps} props - Component props
 * @returns {JSX.Element} Task list with controls
 */
const TaskList = ({tasks, selectedDay, completeTask, undoTask, removeTask, currentDay}: TaskListProps) => {
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    setLoading(true)
    if (tasks) {
        setLoading(false)
    }
}, [tasks])

  return (
    <div className="space-y-4">
        <>
          {loading ? (
        // Enhanced loading state
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-border/30"></div>
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-soft-primary absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <p className="text-text-secondary text-sm">Loading tasks...</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <div className="w-1 h-1 bg-soft-primary rounded-full animate-gentle-pulse"></div>
              <div className="w-1 h-1 bg-soft-primary rounded-full animate-gentle-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-1 h-1 bg-soft-primary rounded-full animate-gentle-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
      ) : tasks.length === 0 ? (
        // Enhanced empty state
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-card-bg-secondary border border-border rounded-2xl mb-4">
            <div className="text-2xl">📝</div>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No tasks for {selectedDay}</h3>
          <p className="text-text-secondary text-sm">Create some tasks to get started on your journey!</p>
        </div>
      ) : (
        // Task list with completion and removal actions
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`group flex items-center justify-between rounded-2xl border p-4 transition-all duration-300 hover:shadow-md hover:border-soft-primary/40 hover:scale-[1.01]
              ${task.isDone 
                ? "bg-gradient-to-r from-soft-secondary/20 to-soft-secondary/10 border-soft-secondary/30" 
                : "bg-gradient-to-r from-card-bg-secondary to-card-bg border-border"
              }
            `}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Streak Counter */}
                <div className="flex items-center gap-2 bg-card-bg-secondary border border-border rounded-xl px-3 py-2">
                  <Flame className="h-4 w-4 text-soft-accent"/>
                  <span className="text-soft-accent font-semibold text-sm">{task.streak}</span>
                </div>
                
                {/* Task Title */}
                <div className="flex-1 min-w-0">
                  <span className={`font-medium truncate block text-base ${
                    task.isDone ? "text-soft-secondary line-through" : "text-text-primary"
                  }`}>
                    {task.title}
                  </span>
                  {task.isDone && (
                    <div className="text-sm text-soft-secondary/70 mt-1">Completed!</div>
                  )}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2 ml-4">
                {currentDay === selectedDay ? (!task.isDone ? (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-soft-secondary hover:bg-soft-secondary/80 text-text-primary shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 min-h-[44px] min-w-[44px]"
                    onClick={async () => {
                      await completeTask(task.id);
                      // Refresh stats after task completion
                      const win = window as Window & { refreshStats?: () => void };
                      if (win.refreshStats) {
                        win.refreshStats();
                      }
                    }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="ml-1">Complete</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-soft-primary hover:bg-soft-primary/80 text-text-primary shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 min-h-[44px] min-w-[44px]"
                    onClick={async () => {
                      await undoTask(task.id);
                      // Refresh stats after undoing task
                      const win = window as Window & { refreshStats?: () => void };
                      if (win.refreshStats) {
                        win.refreshStats();
                      }
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="ml-1">Undo</span>
                  </Button>
                )) : (
                  <div className="w-20 h-11 flex items-center justify-center">
                    <span className="text-xs text-text-secondary">View Only</span>
                  </div>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 min-h-[44px] min-w-[44px]"
                  onClick={() => removeTask(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="ml-1">Remove</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
          )}
        </>
    </div>
  );
};

export default TaskList;
