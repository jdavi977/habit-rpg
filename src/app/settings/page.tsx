"use client"
import useAuthClient from '@/components/hooks/useAuthClient';
import SettingsCard from '@/components/profile/SettingsCard';


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
