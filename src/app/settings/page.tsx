"use client"
import useAuthClient from '@/components/hooks/useAuthClient';
import SettingsCard from '@/components/settings/SettingsCard';
import { Settings, Zap } from 'lucide-react';

const UserSettings = () => {
  const { client, userId } = useAuthClient();

  return (
    <div className="min-h-screen text-slate-200 relative overflow-hidden">
      {/* Background Grid Pattern - Creates a subtle cyberpunk grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(24,206,242,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(24,206,242,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50"></div>

      {/* Animated Scan Lines - Adds dynamic cyberpunk visual effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-blue/5 to-transparent animate-scanline"></div>

      <div className="container mx-auto max-w-4xl px-4 py-10 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-1 h-8 bg-cyber-blue-bright rounded-full animate-pulse"></div>
            <Settings className="h-8 w-8 text-cyber-blue-bright" />
            <div className="w-1 h-8 bg-cyber-blue-bright rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-bold text-cyber-blue-bright mb-4 tracking-wider">
            SYSTEM CONFIGURATION
          </h1>
          <p className="text-cyber-text-muted text-lg max-w-2xl mx-auto">
            Configure your daily reset time and system preferences. 
            Your tasks will automatically reset at the specified time each day.
          </p>
        </div>

        {/* Settings Card */}
        <div className="flex justify-center">
          <SettingsCard
            client={client}
            id={userId}
          />
        </div>

        {/* Additional Info Section */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-terminal-bg border border-cyber-line-color rounded-lg">
            <Zap className="h-4 w-4 text-cyber-blue-bright" />
            <span className="text-sm text-cyber-text-muted">
              Changes take effect immediately after applying
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserSettings;
