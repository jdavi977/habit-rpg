'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { SupabaseClient } from '@supabase/supabase-js'
import useUserStats from '../hooks/useUserStats'
import HealthBar from "@/components/ui/8bit/health-bar"
import ManaBar from '../ui/8bit/mana-bar'
import ExperienceBar from '../ui/8bit/experience-bar'



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
                  <div>
                    <div className='mb-10'>
                      <HealthBar value={stats?.health} className='mb-7'/>
                      <ManaBar value={20} className='mb-7'/>
                      <ExperienceBar value={50} className='mb-7' variant='retro'/>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {/* Level Display */}
                      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-cyber-blue/10 to-cyber-blue/5 border border-cyber-line-color hover:border-cyber-blue-bright/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyber-glow-primary/20 group">
                        <div className="text-2xl font-bold text-cyber-blue-bright mb-1 group-hover:scale-110 transition-transform duration-300">{stats?.level ?? "1"}</div>
                        <div className="text-xs text-cyber-text-muted uppercase tracking-wider">Level</div>
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-blue-bright to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2"></div>
                      </div>
                      {/* Gold Display */}
                      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 group">
                        <div className="text-2xl font-bold text-yellow-400 mb-1 group-hover:scale-110 transition-transform duration-300">{stats?.gold ?? "0"}</div>
                        <div className="text-xs text-cyber-text-muted uppercase tracking-wider">Gold</div>
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2"></div>
                      </div>
                      {/* Mana Display */}
                      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 group">
                        <div className="text-2xl font-bold text-purple-400 mb-1 group-hover:scale-110 transition-transform duration-300">{stats?.mana ?? "0"}</div>
                        <div className="text-xs text-cyber-text-muted uppercase tracking-wider">Mana</div>
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Enhanced loading state
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyber-line-color"></div>
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyber-blue-bright absolute top-0 left-0"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-cyber-text-muted text-sm">Loading character data...</p>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <div className="w-1 h-1 bg-cyber-blue-bright rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-cyber-blue-bright rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-1 h-1 bg-cyber-blue-bright rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
    </Card>
  )
}

export default StatsCard
