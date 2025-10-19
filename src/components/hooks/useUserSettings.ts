"use client";
import { getUserSettings } from "@/lib/db";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";

type RolloverTime = {
  hour: number;
  minute: number;
  period: "AM" | "PM";
};

const useUserSettings = (client: SupabaseClient, userId: string) => {
  const [rolloverTimeSelected, setRolloverTimeSelected] = useState(false);
  const [rolloverTime, setRolloverTime] = useState<RolloverTime>();
  const reqIdRef = useRef(0);

  function from24HourString(pgTime: string) {
    const [hh, mm] = pgTime.split(":").map(Number);
    const period: "AM" | "PM" = hh >= 12 ? "PM" : "AM";
    let hour = hh % 12;
    if (hour === 0) hour = 12;

    return {
      hour,
      minute: mm,
      period,
    };
  }

  useEffect(() => {
    if (!userId) return;
    const myReqId = ++reqIdRef.current;
    (async () => {
      try {
        const settingsInfo = await getUserSettings(client, userId);
        if (myReqId !== reqIdRef.current) return;
        if (settingsInfo.rollover_time !== null) {
          setRolloverTimeSelected(true);
          setRolloverTime(from24HourString(settingsInfo.rollover_time));
        } else {
          setRolloverTimeSelected(false);
          setRolloverTime(undefined);
        }
      } catch {}
    })();
    return () => {
      const currentReqId = reqIdRef.current;
      reqIdRef.current = currentReqId + 1;
    };
  }, [userId, client]);

  return { rolloverTimeSelected, rolloverTime };
};

export default useUserSettings;
