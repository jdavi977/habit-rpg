/**
 * @fileoverview Main dashboard/home page
 * @module app/home/page
 * 
 * Authenticated user dashboard featuring:
 * - Daily reset configuration warning
 * - Character statistics card
 * - Today's tasks display
 * 
 * Protected route accessible only to signed-in users.
 */

"use client";
import StatsCard from "@/components/profile/StatsCard";
import CurrentTasks from "@/components/profile/CurrentTasks";
import useAuthClient from "@/components/hooks/useAuthClient";
import WarningRollover from "@/components/profile/WarningRollover";

/**
 * Home page component - Main user dashboard
 *
 * Serves as the primary interface for authenticated users to:
 * - View character stats (level, gold, mana, health)
 * - See and complete today's tasks
 * - Check rollover configuration status
 * - Navigate to other sections
 *
 * @component Home
 * @returns {JSX.Element} Dashboard with stats card and today's tasks
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

        <CurrentTasks
          client={client}
          userId={userId}
        />
      </div>
    </div>
  );
}
