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
    <Card className="bg-card/90 backdrop-blur-md border-cyber-line-color shadow-2xl shadow-cyber-glow-primary/30 hover:shadow-cyber-glow-primary/40 transition-all duration-500 group">
      <CardHeader className="pb-6 relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(24, 206, 242, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(24, 206, 242, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        <CardTitle className="text-2xl font-bold text-cyber-blue-bright flex items-center gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyber-blue-bright rounded-full animate-pulse shadow-lg shadow-cyber-blue-bright/50"></div>
            <div className="w-1 h-1 bg-cyber-blue-bright rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="w-1 h-1 bg-cyber-blue-bright rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          <span className="bg-gradient-to-r from-cyber-blue-bright to-cyber-blue-glow bg-clip-text text-transparent">
            Character Stats
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-cyber-line-color via-cyber-blue-bright/50 to-transparent"></div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-8 relative">
        {!loading ? (
          <div className="space-y-8">
            {/* Character Name Section */}
            <div className="text-center py-4 px-6 bg-gradient-to-r from-cyber-blue/10 via-cyber-blue-bright/5 to-cyber-blue/10 rounded-xl border border-cyber-line-color/50 hover:border-cyber-blue-bright/30 transition-all duration-300 group/name">
              <div className="text-3xl font-bold text-cyber-text-bright mb-2 group-hover/name:text-cyber-blue-bright transition-colors duration-300">
                {stats?.name || "Unknown Character"}
              </div>
              <div className="text-sm text-cyber-text-muted uppercase tracking-wider">
                Level {stats?.level || 1} Adventurer
              </div>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-cyber-line-color to-transparent mt-3"></div>
            </div>

            {/* Stats Bars Section */}
            <div className="space-y-6">
              {/* Health Bar */}
              <div className="group/health">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-cyber-text-bright uppercase tracking-wider">Health</span>
                  </div>
                  <div className="text-sm font-mono text-cyber-text-muted">
                    {stats?.health || 0} / {stats?.total_health || 100}
                  </div>
                </div>
                <HealthBar value={stats?.health} className="h-3" variant="retro"/>
              </div>

              {/* Mana Bar */}
              <div className="group/mana">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-cyber-text-bright uppercase tracking-wider">Mana</span>
                  </div>
                  <div className="text-sm font-mono text-cyber-text-muted">
                    {stats?.mana || 0} / {stats?.total_mana || 100}
                  </div>
                </div>
                <ManaBar value={stats?.mana} className="h-3" variant="retro"/>
              </div>

              {/* Experience Bar */}
              <div className="group/exp">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-cyber-text-bright uppercase tracking-wider">Experience</span>
                  </div>
                  <div className="text-sm font-mono text-cyber-text-muted">
                    {stats?.exp || 0} / {stats?.total_exp || 100}
                  </div>
                </div>
                <ExperienceBar value={stats?.exp} className="h-3" variant="retro"/>
              </div>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6">
              {/* Level Display */}
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-cyber-blue/15 to-cyber-blue/5 border border-cyber-line-color/50 hover:border-cyber-blue-bright/60 transition-all duration-500 hover:shadow-xl hover:shadow-cyber-glow-primary/30 group/level relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue-bright/5 to-transparent opacity-0 group-hover/level:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="text-3xl font-bold text-cyber-blue-bright mb-2 group-hover/level:scale-110 transition-transform duration-300 font-mono">
                    {stats?.level ?? "1"}
                  </div>
                  <div className="text-xs text-cyber-text-muted uppercase tracking-wider font-semibold">Level</div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-blue-bright to-transparent opacity-0 group-hover/level:opacity-100 transition-opacity duration-500 mt-3"></div>
                </div>
              </div>

              {/* Gold Display */}
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-yellow-500/15 to-yellow-500/5 border border-yellow-500/30 hover:border-yellow-400/60 transition-all duration-500 hover:shadow-xl hover:shadow-yellow-500/30 group/gold relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover/gold:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="text-3xl font-bold text-yellow-400 mb-2 group-hover/gold:scale-110 transition-transform duration-300 font-mono">
                    {stats?.gold ?? "0"}
                  </div>
                  <div className="text-xs text-cyber-text-muted uppercase tracking-wider font-semibold">Gold</div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-0 group-hover/gold:opacity-100 transition-opacity duration-500 mt-3"></div>
                </div>
              </div>

              {/* Mana Display */}
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-500/15 to-purple-500/5 border border-purple-500/30 hover:border-purple-400/60 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/30 group/mana relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-transparent opacity-0 group-hover/mana:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="text-3xl font-bold text-purple-400 mb-2 group-hover/mana:scale-110 transition-transform duration-300 font-mono">
                    {stats?.mana ?? "0"}
                  </div>
                  <div className="text-xs text-cyber-text-muted uppercase tracking-wider font-semibold">Mana</div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 group-hover/mana:opacity-100 transition-opacity duration-500 mt-3"></div>
                </div>
              </div>
            </div>
                  </div>
                ) : (
                  // Enhanced loading state
                  <div className="flex flex-col items-center justify-center py-12 space-y-6">
                    <div className="relative">
                      {/* Outer ring */}
                      <div className="animate-spin rounded-full h-16 w-16 border-2 border-cyber-line-color/30"></div>
                      {/* Inner ring */}
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-cyber-blue-bright absolute top-0 left-0"></div>
                      {/* Center dot */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
                    </div>
                    
                    <div className="text-center space-y-3">
                      <p className="text-cyber-text-bright text-lg font-semibold">Loading Character Data</p>
                      <p className="text-cyber-text-muted text-sm">Initializing stats system...</p>
                      
                      {/* Animated dots */}
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-48 h-1 bg-cyber-line-color/20 rounded-full overflow-hidden mt-4">
                        <div className="h-full bg-gradient-to-r from-cyber-blue to-cyber-blue-bright rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
    </Card>
  )
}

export default StatsCard
