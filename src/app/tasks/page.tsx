/**
 * @fileoverview Task management page
 * @module app/tasks/page
 * 
 * Full-featured task management interface with:
 * - Calendar for date navigation
 * - Week selector for quick navigation
 * - Task list with completion controls
 * - Create task functionality
 * 
 * Protected route for authenticated users.
 */

"use client"

import useAuthClient from "@/components/hooks/useAuthClient";
import TaskCard from "@/components/home/TaskCard";

/**
 * Tasks management page
 * 
 * Provides comprehensive task management including calendar navigation,
 * week selection, task creation, and completion controls.
 * 
 * @returns {JSX.Element} Task management interface
 */
const TasksPage = () => {
  const { client, userId } = useAuthClient();

  return (
    <div className="py-10">
        <TaskCard client={client} userId={userId} />
    </div>
  )
};

export default TasksPage;
