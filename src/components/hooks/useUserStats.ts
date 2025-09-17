'use client'

import { getUserInfo, getUserStats } from '@/lib/db'
import { SupabaseClient } from '@supabase/supabase-js'
import { useEffect, useRef, useState } from 'react'

type UserStats = {name: string, health: number, total_health: number, gold: number, mana: number, total_mana: number, level: number, exp: number, total_exp: number}

const useUserStats = (client: SupabaseClient, userId?: string) => {
    const [stats, setStats] = useState<UserStats>()
    const reqIdRef = useRef(0);

    useEffect(() => {
      if (!userId) return;
      const myReqId = ++reqIdRef.current;
      (async () => {
        try {
          const stats = await getUserStats(client, userId)
          const userInfo = await getUserInfo(client, userId)
          if (myReqId !== reqIdRef.current) return;
          setStats({
            name: userInfo?.username,
            health: stats?.health,
            total_health: stats?.total_health,
            level: stats?.level ?? 1,
            gold: stats?.gold ?? 0,
            mana: stats?.mana ?? 0,
            total_mana:stats?.total_mana,
            exp: stats?.exp,
            total_exp: stats?.total_exp,
          }) 
        } catch {}
      })()
      return () => { reqIdRef.current++ }
    }, [userId, client])

    return { stats }
    }

export default useUserStats;
