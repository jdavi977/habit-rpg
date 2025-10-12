'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { SupabaseClient } from '@supabase/supabase-js'
import useUserStats from '../hooks/useUserStats'
import { ProgressBar } from '../ui/progress'
import { Heart, Sparkles, Star } from 'lucide-react'

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
    <Card className="bg-card/95 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(125, 211, 252, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(125, 211, 252, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
      </CardHeader>
      
      <CardContent className="space-y-6 relative">
        {!loading ? (
          <div className="space-y-6">
            {/* Character Name Section */}
            <div className="text-center py-4 px-4 bg-gradient-to-r from-soft-primary/10 via-soft-secondary/5 to-soft-primary/10 rounded-2xl border border-border/50 hover:border-soft-primary/30 transition-all duration-300">
              <div className="text-2xl font-bold text-text-primary mb-2 group-hover:text-soft-primary transition-colors duration-300">
                {stats?.name || "Unknown Character"}
              </div>
              <div className="text-sm text-text-secondary">
                Level {stats?.level || 1} Adventurer
              </div>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mt-3"></div>
            </div>

            {/* Stats Bars Section */}
            <div className="space-y-5">
              {/* Health Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-health" />
                    <span className="text-sm font-medium text-text-primary">Health</span>
                  </div>
                  <div className="text-sm font-mono text-text-secondary">
                    {stats?.health || 0} / {stats?.total_health || 100}
                  </div>
                </div>
                <ProgressBar value={stats?.health} max={stats?.total_health} variant="health" />
              </div>

              {/* Mana Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-mana" />
                    <span className="text-sm font-medium text-text-primary">Mana</span>
                  </div>
                  <div className="text-sm font-mono text-text-secondary">
                    {stats?.mana || 0} / {stats?.total_mana || 100}
                  </div>
                </div>
                <ProgressBar value={stats?.mana} max={stats?.total_mana} variant="mana" />
              </div>

              {/* Experience Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-exp" />
                    <span className="text-sm font-medium text-text-primary">Experience</span>
                  </div>
                  <div className="text-sm font-mono text-text-secondary">
                    {stats?.exp || 0} / {stats?.total_exp || 100}
                  </div>
                </div>
                <ProgressBar value={stats?.exp} max={stats?.total_exp} variant="exp" />
              </div>
            </div>
            </div>
                ) : (
                  // Enhanced loading state
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="relative">
                      {/* Outer ring */}
                      <div className="animate-spin rounded-full h-12 w-12 border-2 border-border/30"></div>
                      {/* Inner ring */}
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-soft-primary absolute top-0 left-0"></div>
                      {/* Center dot */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-soft-primary rounded-full animate-gentle-pulse"></div>
                    </div>
                    
                    <div className="text-center space-y-2">
                      <p className="text-text-primary text-base font-medium">Loading Character Data</p>
                      <p className="text-text-secondary text-sm">Initializing stats system...</p>
                      
                      {/* Animated dots */}
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <div className="w-2 h-2 bg-soft-primary rounded-full animate-gentle-pulse"></div>
                        <div className="w-2 h-2 bg-soft-primary rounded-full animate-gentle-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-soft-primary rounded-full animate-gentle-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-40 h-1 bg-border/20 rounded-full overflow-hidden mt-4">
                        <div className="h-full bg-gradient-to-r from-soft-primary to-soft-secondary rounded-full animate-gentle-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
    </Card>
  )
}

export default StatsCard
