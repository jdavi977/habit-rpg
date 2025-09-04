"use client";
import CreateTask from "@/components/profile/CreateTask";
import StatsCard from "@/components/profile/StatsCard";
import SettingsCard from "@/components/profile/SettingsCard";
import useUserSettings from "@/components/hooks/useUserSettings";
import TaskCard from "@/components/profile/TaskCard";
import { getLocalTimeZone } from "@/lib/localTimezone";
import useAuthClient from "@/components/hooks/useAuthClient";

/**
 * Profile page component that displays user statistics, daily tasks, and task management
 *
 * This component serves as the main dashboard for users to:
 * - View their character stats (level, gold, mana)
 * - Manage daily tasks by day of the week
 * - Complete tasks to earn rewards
 * - Create new tasks
 * - Set daily reset time preferences
 *
 * @component Profile
 * @returns {JSX.Element} The rendered profile page with user dashboard
 *
 */
export default function Home() {
  const { client, userId } = useAuthClient();

  const convertedTime = useUserSettings(client, userId);
  const tz = getLocalTimeZone();

  return (
    <div className="min-h-screen text-slate-200 relative overflow-hidden">
      {/* Background Grid Pattern - Creates a subtle cyberpunk grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(24,206,242,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(24,206,242,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50"></div>

      {/* Animated Scan Lines - Adds dynamic cyberpunk visual effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-blue/5 to-transparent animate-scanline"></div>

      <div className="container mx-auto max-w-7xl px-4 py-10 relative z-10">
        {/* Header Section - Reserved for future content */}
        <div className="text-center mb-12">{/* Add content here*/}</div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
          
          {/* LEFT SIDE CONTENT */}
          <div className="space-y-6">
            {/* STATS CARD */}
            <StatsCard
              client={client}
              userId={userId}
            />
            {/* SETTINGS CARD */}
            <SettingsCard
              client={client}
              id={userId}
              tz={tz}
              convertedTime={convertedTime}
            />
            {/* TASKS CARD */}
            <TaskCard client={client} userId={userId} />
          </div>

          {/* RIGHT SIDE */}
          <div>
            {/* TASK CREATION CARD  */}
            <CreateTask 
              client={client}
              userId={userId}        
            />
          </div>

        </div>
      </div>
    </div>
  );
}
