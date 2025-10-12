"use client"
import useAuthClient from "@/components/hooks/useAuthClient";
import TaskCard from "@/components/profile/TaskCard";

const page = () => {
  const { client, userId } = useAuthClient();

  return <TaskCard client={client} userId={userId} />;
};

export default page;
