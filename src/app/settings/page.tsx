"use client"
import useAuthClient from '@/components/hooks/useAuthClient';
import SettingsCard from '@/components/settings/SettingsCard';
import { Settings } from 'lucide-react';

const UserSettings = () => {
  const { client, userId } = useAuthClient();

  return (
    <div className="text-text-primary relative">
      <div className="space-y-8 py-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-soft-primary/20 to-soft-secondary/10 border border-border rounded-2xl">
              <Settings className="h-6 w-6 text-soft-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Settings
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Configure your daily reset time and system preferences.
            Your tasks will automatically reset at the specified time each day.
          </p>
        </div>

        {/* Settings Card */}
        <SettingsCard
          client={client}
          id={userId}
        />
      </div>
    </div>
  )
}

export default UserSettings;
