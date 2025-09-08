import React from 'react'
import useUserSettings from '../hooks/useUserSettings'
import { SupabaseClient } from '@supabase/supabase-js';

type WarningRolloverProps = {
    client: SupabaseClient;
    userId: string;
}

const WarningRollover = ({client, userId}: WarningRolloverProps) => {
    const { nextRolloverNull } = useUserSettings(client, userId)

    return (
        <>
        {nextRolloverNull ? (
            <div>
              Please select a Daily Reset Time in Settings.
            </div>
          ) : (
            <div></div>
          )}
    </>
    )
}

export default WarningRollover
