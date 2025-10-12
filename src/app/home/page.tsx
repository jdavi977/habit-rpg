"use client";
import StatsCard from "@/components/profile/StatsCard";
import TaskCard from "@/components/profile/TaskCard";
import useAuthClient from "@/components/hooks/useAuthClient";
import WarningRollover from "@/components/profile/WarningRollover";

/**
 * Home page component that displays user statistics, daily tasks, and task management
 *
 * This component serves as the main dashboard for users to:
 * - View their character stats (level, gold, mana)
 * - Manage daily tasks by day of the week
 * - Complete tasks to earn rewards
 * - Create new tasks
 * - Set daily reset time preferences
 *
 * @component Home
 * @returns {JSX.Element} The rendered home page with user dashboard
 */
export default function Home() {
  const { client, userId } = useAuthClient();

  return (
    <div className="text-text-primary relative">
      <div className="space-y-8 py-8">
        {/* Warning Rollover */}
        <WarningRollover
          client={client}
          userId={userId}
        />

        {/* Stats Card */}
        <StatsCard
          client={client}
          userId={userId}
        />

        {/* Task Card */}
        <TaskCard
          client={client}
          userId={userId}
        />
      </div>
    </div>
  );
}
