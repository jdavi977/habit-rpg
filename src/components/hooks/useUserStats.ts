'use client'

import { getUserStats } from '@/lib/db'
import { SupabaseClient } from '@supabase/supabase-js'
import { useEffect, useRef, useState, useCallback } from 'react'

const useUserStats = (client: SupabaseClient, userId?: string) => {
    const [loading, setLoading] = useState(true)
    const [gold, setGold] = useState<number | null>(null)
    const [mana, setMana] = useState<number | null>(null)
    const [level, setLevel] = useState<number | null>(null)

    const clientRef = useRef(client);
    useEffect(() => { clientRef.current = client }, [client]);
    
    const fetchStats = useCallback(async () => {
      if (!userId) return;
      let alive = true;
      setLoading(true);
      try {
        const stats = await getUserStats(clientRef.current, userId);
        if (!alive) return;
        setLevel(stats?.level ?? 1);
        setGold(stats?.gold ?? 0);
        setMana(stats?.mana ?? 0);
      } finally {
        if (alive) setLoading(false);
      }
    }, [userId]);
    
    useEffect(() => {
      if (!userId) return;
      let alive = true;
      fetchStats();
      return () => { alive = false };
    }, [userId, fetchStats]);

    return { loading, gold, mana, level }
}

export default useUserStats;
