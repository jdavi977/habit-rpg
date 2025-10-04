import React, { useState } from "react";
import { Button } from "../ui/button";
import { Flame } from "lucide-react";
import '../../styles/fullcalendar-cyber.css'


type TaskListProps = {
  selectedDay: string,
  tasks: {id: string, title: string, streak: number, isDone: boolean, startTime: string, endTime: string}[];
  completeTask: (taskId: string) => void,
  undoTask: (taskId: string) => void,
  removeTask: (taskId: string) => void,
  currentDay: string;
  loading: boolean;
}

const TaskList = ({tasks, selectedDay, completeTask, undoTask, removeTask, currentDay}: TaskListProps) => {
  const [loading, setLoading] = useState(true)

  // Log today, dayOfWeek, and diff right away
  const today = new Date()

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
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyber-line-color"></div>
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cyber-blue-bright absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <p className="text-cyber-text-muted text-sm">Loading tasks...</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <div className="w-1 h-1 bg-cyber-blue-bright rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-cyber-blue-bright rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-1 h-1 bg-cyber-blue-bright rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
      ) : tasks.length === 0 ? (
        // Enhanced empty state
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyber-terminal-bg/50 border border-cyber-line-color rounded-full mb-4">
            <div className="text-2xl">📝</div>
          </div>
          <h3 className="text-lg font-semibold text-cyber-text-bright mb-2">No tasks for {selectedDay}</h3>
          <p className="text-cyber-text-muted text-sm">Create some tasks to get started on your journey!</p>
        </div>
      ) : (
        // Task list with completion and removal actions
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`group flex items-center justify-between rounded-xl border p-4 transition-all duration-300 hover:shadow-lg hover:shadow-cyber-glow-primary/20 hover:border-cyber-blue/40 hover:scale-[1.02]
              ${task.isDone 
                ? "bg-gradient-to-r from-green-500/20 to-green-600/10 border-green-500/30" 
                : "bg-gradient-to-r from-cyber-blue/10 to-cyber-blue/5 border-cyber-line-color"
              }
            `}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Streak Counter */}
                <div className="flex items-center gap-2 bg-cyber-terminal-bg/50 border border-cyber-line-color rounded-lg px-3 py-2">
                  <Flame className="h-4 w-4 text-orange-400"/>
                  <span className="text-orange-400 font-bold text-sm">{task.streak}</span>
                </div>
                
                {/* Task Title */}
                <div className="flex-1 min-w-0">
                  <span className={`font-medium truncate block ${
                    task.isDone ? "text-green-400 line-through" : "text-cyber-text-bright"
                  }`}>
                    {task.title}
                  </span>
                  {task.isDone && (
                    <div className="text-xs text-green-300/70 mt-1">Completed!</div>
                  )}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2 ml-4">
                {currentDay === selectedDay ? (!task.isDone ? (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 transition-all duration-200 hover:scale-105"
                    onClick={() => completeTask(task.id)}
                  >
                    ✓ Complete
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-200 hover:scale-105"
                    onClick={() => undoTask(task.id)}
                  >
                    ↶ Undo
                  </Button>
                )) : (
                  <div className="w-20 h-8 flex items-center justify-center">
                    <span className="text-xs text-cyber-text-muted">View Only</span>
                  </div>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40 transition-all duration-200 hover:scale-105"
                  onClick={() => removeTask(task.id)}
                >
                  🗑️ Remove
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
