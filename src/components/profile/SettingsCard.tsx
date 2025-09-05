"use client";
import React, { useState } from "react";
import RolloutSelector from "./RolloutSelector";
import { SupabaseClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import useUserSettings from "../hooks/useUserSettings";
import { getLocalTimeZone } from "@/lib/localTimezone";

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
  period: "AM" | "PM";
};

type SettingsCardProp = {
  client: SupabaseClient;
  id: string;
};

const SettingsCard = ({ client, id}: SettingsCardProp) => {
  const {convertedTime, nextRolloverNull} = useUserSettings(client, id);
  const tz = getLocalTimeZone();
  const [rolloverTime, setRolloverTime] = useState<RolloverTime>({
    hour: 12,
    minute: 0,
    period: "AM",
  });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (convertedTime) {
      setRolloverTime(convertedTime);
      setLoading(false);
    }
  }, [convertedTime]);
  
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-cyber-line-color shadow-lg shadow-cyber-glow-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-cyber-blue-bright flex items-center gap-2">
          <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
          Reset Time{" "}
        </CardTitle>
      </CardHeader>
      <CardContent>
      {nextRolloverNull ? (
        <div>
          Please select a Daily Reset Time.
        </div>
      ) : (
        <div>{tz}</div>
      )}
      {!loading ? (
        <div>
          <RolloutSelector
            client={client}
            tz={tz}
            initialTime={rolloverTime}
            onTimeChange={setRolloverTime}
            userId={id}
          />
        </div>
      ) : (
        // Loading spinner while stats are being fetched
        <div className="flex items-center justify-center h-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue-bright"></div>
        </div>
      )}
      </CardContent>
    </Card>
  );
};
export default SettingsCard;
