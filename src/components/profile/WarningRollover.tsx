import React from 'react'
import useUserSettings from '../hooks/useUserSettings'
import { SupabaseClient } from '@supabase/supabase-js';
import { AlertTriangle, Settings, Clock } from 'lucide-react';

type WarningRolloverProps = {
    client: SupabaseClient;
    userId: string;
}

const WarningRollover = ({client, userId}: WarningRolloverProps) => {
    const { rolloverTimeSelected } = useUserSettings(client, userId)

    return (
        <>
        {!rolloverTimeSelected ? (
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl shadow-lg shadow-yellow-500/20 animate-pulse">
              <AlertTriangle className="h-6 w-6 text-yellow-400" />
              <div className="text-center">
                <p className="text-yellow-400 font-semibold text-lg">Configuration Required</p>
                <p className="text-yellow-300/80 text-sm">
                  Please select a Daily Reset Time in 
                  <span className="inline-flex items-center gap-1 mx-1">
                    <Settings className="h-4 w-4" />
                    Settings
                  </span>
                </p>
              </div>
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">System Configured</span>
            </div>
          )}
    </>
    )
}

export default WarningRollover
