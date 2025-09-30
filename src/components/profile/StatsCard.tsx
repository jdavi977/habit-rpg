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
    <Card className="bg-card/90 backdrop-blur-md border-cyber-line-color shadow-xl shadow-cyber-glow-primary/20 hover:shadow-cyber-glow-primary/30 transition-all duration-500 group max-w-xl mx-auto">
      <CardHeader className="relative overflow-hidden">
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
        
      </CardHeader>
      
      <CardContent className="space-y-4 relative">
        {!loading ? (
          <div className="space-y-5">
            {/* Character Name Section */}
            <div className="text-center py-2 px-3 bg-gradient-to-r from-cyber-blue/10 via-cyber-blue-bright/5 to-cyber-blue/10 rounded-lg border border-cyber-line-color/50 hover:border-cyber-blue-bright/30 transition-all duration-300 group/name">
              <div className="text-2xl font-bold text-cyber-text-bright mb-1 group-hover/name:text-cyber-blue-bright transition-colors duration-300">
                {stats?.name || "Unknown Character"}
              </div>
              <div className="text-xs text-cyber-text-muted uppercase tracking-wider">
                Level {stats?.level || 1} Adventurer
              </div>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-cyber-line-color to-transparent mt-2"></div>
            </div>

            {/* Stats Bars Section */}
            <div className="space-y-4">
              {/* Health Bar */}
              <div className="group/health">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-cyber-text-bright uppercase tracking-wider">Health</span>
                  </div>
                  <div className="text-xs font-mono text-cyber-text-muted">
                    {stats?.health || 0} / {stats?.total_health || 100}
                  </div>
                </div>
                <HealthBar value={stats?.health} className="h-2" variant="retro"/>
              </div>

              {/* Mana Bar */}
              <div className="group/mana">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-cyber-text-bright uppercase tracking-wider">Mana</span>
                  </div>
                  <div className="text-xs font-mono text-cyber-text-muted">
                    {stats?.mana || 0} / {stats?.total_mana || 100}
                  </div>
                </div>
                <ManaBar value={stats?.mana} className="h-2" variant="retro"/>
              </div>

              {/* Experience Bar */}
              <div className="group/exp">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-cyber-text-bright uppercase tracking-wider">Experience</span>
                  </div>
                  <div className="text-xs font-mono text-cyber-text-muted">
                    {stats?.exp || 0} / {stats?.total_exp || 100}
                  </div>
                </div>
                <ExperienceBar value={stats?.exp} className="h-2" variant="retro"/>
              </div>
            </div>
            </div>
                ) : (
                  // Enhanced loading state
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="relative">
                      {/* Outer ring */}
                      <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyber-line-color/30"></div>
                      {/* Inner ring */}
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyber-blue-bright absolute top-0 left-0"></div>
                      {/* Center dot */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
                    </div>
                    
                    <div className="text-center space-y-2">
                      <p className="text-cyber-text-bright text-base font-semibold">Loading Character Data</p>
                      <p className="text-cyber-text-muted text-xs">Initializing stats system...</p>
                      
                      {/* Animated dots */}
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-40 h-1 bg-cyber-line-color/20 rounded-full overflow-hidden mt-4">
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
