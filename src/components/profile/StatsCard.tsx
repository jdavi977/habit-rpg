'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { SupabaseClient } from '@supabase/supabase-js'
import useUserStats from '../hooks/useUserStats'

type StatsCardProps = {
  client: SupabaseClient;
  userId: string;
}

const StatsCard = ({client, userId}: StatsCardProps) => {
  const { stats } = useUserStats(client, userId);
  const [loading, setLoading] = useState(true)

    React.useEffect(() => {
      if ( stats ) {
          setLoading(false)
      }
  }, [stats])

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-cyber-line-color shadow-lg shadow-cyber-glow-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-cyber-blue-bright flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
                  Character Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!loading ? (
                  <div className="grid grid-cols-3 gap-4">
                    {/* Level Display */}
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-cyber-blue/10 to-cyber-blue/5 border border-cyber-line-color">
                      <div className="text-2xl font-bold text-cyber-blue-bright mb-1">{stats?.level ?? "1"}</div>
                      <div className="text-xs text-cyber-text-muted uppercase tracking-wider">Level</div>
                    </div>
                    {/* Gold Display */}
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
                      <div className="text-2xl font-bold text-yellow-400 mb-1">{stats?.gold ?? "0"}</div>
                      <div className="text-xs text-cyber-text-muted uppercase tracking-wider">Gold</div>
                    </div>
                    {/* Mana Display */}
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                      <div className="text-2xl font-bold text-purple-400 mb-1">{stats?.mana ?? "0"}</div>
                      <div className="text-xs text-cyber-text-muted uppercase tracking-wider">Mana</div>
                    </div>
                  </div>
                ) : (
                  // Loading spinner while stats are being fetched
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue-bright"></div>
                  </div>
                )}
              </CardContent>
    </Card>
  )
}

export default StatsCard
