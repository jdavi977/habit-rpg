'use client'
import React, { useState } from 'react'
import RolloutSelector from './RolloutSelector';
import { SupabaseClient } from '@supabase/supabase-js';
import { Card } from '../ui/card';

/**
 * Time configuration for daily rollover
 * @typedef {Object} RolloverTime
 * @property {number} hour - Hour in 12-hour format (1-12)
 * @property {number} minute - Minute (0-59)
 * @property {'AM' | 'PM'} period - Time period (AM or PM)
 */
type RolloverTime = {
    hour: number;
    minute: number;
    period: 'AM' | 'PM';
  };

type SettingsCardProp = {
    client: SupabaseClient;
    id: string | null | undefined;
    convertedTime?: {hour: number, minute: number, period: 'AM' | 'PM'}
}
  
const SettingsCard = ({client, id, convertedTime}: SettingsCardProp) => {
    const [rolloverTime, setRolloverTime] = useState<RolloverTime>({ hour: 12, minute: 0, period: 'AM' })
    // Sync incoming convertedTime once it's loaded
    React.useEffect(() => {
        if (convertedTime) {
            setRolloverTime(convertedTime)
        }
    }, [convertedTime])
        return (
        <Card className="bg-card/80 backdrop-blur-sm border-cyber-line-color shadow-lg shadow-cyber-glow-primary/20">
            <div className="p-5">
                <h3 className="text-sm font-semibold text-cyber-text-bright mb-3">Daily Reset Time</h3>
            <div>
                Current Reset Time
            </div>
            <div>
                {rolloverTime.hour}:
                {(rolloverTime.minute == 0 ? "00" : rolloverTime.minute)}
                {rolloverTime.period}
            </div>
            <RolloutSelector 
                client={client}
                initialTime={convertedTime}
                onTimeChange={setRolloverTime}
                userId={id}
            />
            </div>
        </Card>
        )
    }

export default SettingsCard
