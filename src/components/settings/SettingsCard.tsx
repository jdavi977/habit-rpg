"use client";
import React, { useState } from "react";
import RolloutSelector from "../profile/RolloutSelector";
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

const SettingsCard = ({ client, id }: SettingsCardProp) => {
  const { rolloverTimeSelected, rolloverTime } = useUserSettings(client, id);
  const tz = getLocalTimeZone();
  const [time, setTime] = useState<RolloverTime>({
    hour: 12,
    minute: 0,
    period: "AM",
  });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (rolloverTime) {
      setTime(rolloverTime);
      setLoading(false);
    }
  }, [rolloverTime]);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-cyber-line-color shadow-lg shadow-cyber-glow-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-cyber-blue-bright flex items-center gap-2">
          <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
          Reset Time{" "}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!rolloverTimeSelected ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-terminal-bg/50 border border-cyber-line-color rounded-lg mb-4">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-cyber-text-muted text-sm">
                No reset time configured
              </span>
            </div>
            <p className="text-cyber-text-muted">
              Please select a Daily Reset Time below.
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-terminal-bg/50 border border-cyber-line-color rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-cyber-text-bright text-sm font-mono">
                Timezone: {tz}
              </span>
            </div>
          </div>
        )}
        {!loading ? (
          <div>
            <RolloutSelector
              client={client}
              tz={tz}
              initialTime={time}
              onTimeChange={setTime}
              userId={id}
            />
          </div>
        ) : (
          // Enhanced loading state
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyber-line-color"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyber-blue-bright absolute top-0 left-0"></div>
            </div>
            <div className="text-center">
              <p className="text-cyber-text-muted text-sm">
                Loading configuration...
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="w-1 h-1 bg-cyber-blue-bright rounded-full animate-pulse"></div>
                <div
                  className="w-1 h-1 bg-cyber-blue-bright rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-1 h-1 bg-cyber-blue-bright rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default SettingsCard;
