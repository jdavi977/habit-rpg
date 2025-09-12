"use client";
import CreateTask from "@/components/profile/CreateTask";
import StatsCard from "@/components/profile/StatsCard";
import TaskCard from "@/components/profile/TaskCard";
import useAuthClient from "@/components/hooks/useAuthClient";
import WarningRollover from "@/components/profile/WarningRollover";
import { Sword, Target, Zap, Star } from "lucide-react";

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

  return (
    <div className="min-h-screen text-slate-200 relative overflow-hidden">
      {/* Background Grid Pattern - Creates a subtle cyberpunk grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(24,206,242,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(24,206,242,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50"></div>

      {/* Animated Scan Lines - Adds dynamic cyberpunk visual effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-blue/5 to-transparent animate-scanline"></div>

      <div className="container mx-auto max-w-7xl px-4 py-10 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          {/* Main Title */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-1 h-12 bg-cyber-blue-bright rounded-full animate-pulse"></div>
            <Sword className="h-12 w-12 text-cyber-blue-bright animate-pulse" />
            <div className="w-1 h-12 bg-cyber-blue-bright rounded-full animate-pulse"></div>
          </div>
          
          <h1 className="text-5xl font-bold text-cyber-blue-bright mb-4 tracking-wider">
            HABIT RPG
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <Star className="h-5 w-5 text-yellow-400 animate-pulse" />
            <span className="text-cyber-text-muted text-lg">Level up your life through daily habits</span>
            <Star className="h-5 w-5 text-yellow-400 animate-pulse" />
          </div>
          
          <p className="text-cyber-text-muted text-lg max-w-3xl mx-auto mb-8">
            Complete daily tasks to earn experience, gold, and mana. Build your character 
            and unlock new abilities as you develop consistent habits.
          </p>

          {/* Warning Rollover */}
          <WarningRollover 
            client={client}
            userId={userId}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
          
          {/* LEFT SIDE CONTENT */}
          <div className="space-y-6">
            {/* Character Stats Section */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyber-blue-bright/20 to-cyber-blue/20 rounded-xl blur-sm opacity-50"></div>
              <div className="relative">
                <StatsCard
                  client={client}
                  userId={userId}
                />
              </div>
            </div>
            
            {/* Daily Tasks Section */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyber-blue/20 to-cyber-blue-bright/20 rounded-xl blur-sm opacity-50"></div>
              <div className="relative">
                <TaskCard 
                  client={client}
                  userId={userId} 
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Task Creation */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyber-blue-bright/20 to-cyber-blue/20 rounded-xl blur-sm opacity-50"></div>
            <div className="relative">
              <CreateTask 
                client={client}
                userId={userId}        
              />
            </div>
          </div>

        </div>

        {/* Bottom Section - Future Features */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-cyber-terminal-bg/50 border border-cyber-line-color rounded-lg">
            <Target className="h-5 w-5 text-cyber-blue-bright" />
            <span className="text-cyber-text-muted text-sm">
              More features coming soon: Achievements, Quests, and Guilds
            </span>
            <Zap className="h-5 w-5 text-cyber-blue-bright" />
          </div>
        </div>
      </div>
    </div>
  );
}
