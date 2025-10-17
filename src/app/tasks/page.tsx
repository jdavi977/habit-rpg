"use client"

import useAuthClient from "@/components/hooks/useAuthClient";
import TaskCard from "@/components/profile/TaskCard";

const TasksPage = () => {
  const { client, userId } = useAuthClient();

  return (
    <div className="py-10">
        <TaskCard client={client} userId={userId} />
    </div>
  )
};

export default TasksPage;
