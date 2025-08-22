import React, { useState } from "react";
import { Button } from "../ui/button";

type TaskListProps = {
  selectedDay: string,
  tasks: {id: string, title: string, isDone: boolean}[];
  completeTask: (taskId: string) => void,
  undoTask: (taskId: string) => void,
  removeTask: (taskId: string) => void,
  loading: boolean;
}

const TaskList = ({tasks, selectedDay, completeTask, undoTask, removeTask}: TaskListProps) => {
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    setLoading(true)
    if (tasks) {
        setLoading(false)
    }
}, [tasks])
  return (
    <div className="space-y-3">
      {loading ? (
        // Loading state while tasks are being fetched
        <div className="flex items-center justify-center h-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyber-blue-bright"></div>
        </div>
      ) : tasks.length === 0 ? (
        // Empty state when no tasks exist for selected day
        <div className="text-center py-8 text-cyber-text-muted">
          <div className="text-4xl mb-2">📝</div>
          <p>No tasks for {selectedDay}</p>
          <p className="text-sm">Create some tasks to get started!</p>
        </div>
      ) : (
        // Task list with completion and removal actions
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`group flex items-center justify-between rounded-xl border border-cyber-line-color p-4 transition-all duration-200 hover:shadow-lg hover:shadow-cyber-glow-primary/20 hover:border-cyber-blue/40
              ${task.isDone ? "bg-cyber-blue/300" : "bg-cyber-blue/100"}
            `}
            >
              <span className="truncate pr-3 text-cyber-text-bright font-medium">
                {task.title}
              </span>
              {/* Action buttons that appear on hover */}
              <div className="flex gap-2">
                {!task.isDone ? (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30"
                    onClick={() => completeTask(task.id)}
                  >
                    ✓ Complete
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-green-600/30"
                    onClick={() => undoTask(task.id)} // TO DO
                  >
                    Undo
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="shadow-lg shadow-red-600/30"
                  onClick={() => removeTask(task.id)}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
