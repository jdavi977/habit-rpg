'use client'

import { getUserStats } from '@/lib/db'
import { SupabaseClient } from '@supabase/supabase-js'
import { useEffect, useRef, useState } from 'react'

type UserStats = {level: number, gold: number, mana: number}

const useUserStats = (client: SupabaseClient, userId?: string) => {
    const [stats, setStats] = useState<UserStats>()
    const reqIdRef = useRef(0);

    useEffect(() => {
      if (!userId) return;
      const myReqId = ++reqIdRef.current;
      (async () => {
        try {
          const stats = await getUserStats(client, userId)
          if (myReqId !== reqIdRef.current) return;
          setStats({
            level: stats?.level ?? 1,
            gold: stats?.gold ?? 0,
            mana: stats?.mana ?? 0,
          }) 
        } catch {}
      })()
      return () => { reqIdRef.current++ }
    }, [userId, client])

    return { stats }
    }

export default useUserStats;
