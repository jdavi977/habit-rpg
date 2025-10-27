/**
 * @fileoverview User statistics and character data hook
 * @module components/hooks/useUserStats
 * 
 * Manages user character statistics including level, experience, gold, mana, and health.
 * Automatically fetches and caches user stats from the database with request deduplication.
 * Used for displaying character information in stats cards and progress bars.
 */

'use client'

import { getUserInfo, getUserStats } from '@/lib/db'
import { SupabaseClient } from '@supabase/supabase-js'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Type definition for user character statistics
 */
type UserStats = {name: string, health: number, total_health: number, gold: number, mana: number, total_mana: number, level: number, exp: number, total_exp: number}

/**
 * Custom hook to fetch and manage user character statistics
 * 
 * Fetches user stats and profile info from the database. Uses request ID tracking
 * to prevent race conditions and stale data. Automatically refetches when userId changes.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Optional user ID (if not provided, fetches will be skipped)
 * @returns {Object} Object containing:
 *   - stats: User statistics object with character data or undefined if not loaded
 *   - refresh: Function to manually refresh the stats (useful after task completion)
 * 
 * @example
 * const { stats, refresh } = useUserStats(client, userId);
 * // Call refresh() after completing/undoing tasks to update stats
 * await completeTask(taskId);
 * await refresh(); // Updates stats in real-time
 */
const useUserStats = (client: SupabaseClient, userId?: string) => {
    const [stats, setStats] = useState<UserStats>()
    const reqIdRef = useRef(0);

    const fetchStats = useCallback(async () => {
      if (!userId) return;
      const myReqId = ++ reqIdRef.current;
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
    }, [userId, client])

    useEffect(() => {
      fetchStats()
    }, [fetchStats])

    return { stats, refresh: fetchStats }
}

export default useUserStats;
