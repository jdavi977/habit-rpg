"use client"
import useAuthClient from '@/components/hooks/useAuthClient';
import SettingsCard from '@/components/profile/SettingsCard';
import { getLocalTimeZone } from '@/lib/localTimezone';


const UserSettings = () => {
  const { client, userId } = useAuthClient();

  return (
    <div>
      <SettingsCard
        client={client}
        id={userId}
      />
    </div>
  )
}

export default UserSettings;
