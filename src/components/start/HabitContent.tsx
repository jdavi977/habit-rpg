import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Swords, Star, Zap, Target, Shield, Crown, Trophy, Flame
} from "lucide-react";
import { CARD_CONTENT } from "@/constants";


const HabitContent = () => {
  return (
    <div className="w-full pb-24 pt-35 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(24,206,242,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(24,206,242,0.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-30"></div>
      
      <div className="container mx-auto max-w-7xl px-4 relative z-10">

        {/* ENHANCED HEADER- PROGRAM GALLERY */}
        <div className="bg-cyber-terminal-bg/50 backdrop-blur-sm border border-cyber-line-color rounded-xl overflow-hidden mb-16 shadow-lg shadow-cyber-glow-primary/10">
          {/* ENHANCED HEADER BAR */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-cyber-line-color bg-gradient-to-r from-cyber-blue/10 to-cyber-blue-bright/10">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-cyber-blue-bright animate-pulse"></div>
              <span className="text-sm text-cyber-blue-bright font-mono font-bold tracking-wider">HABITRPG - ASCEND</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 animate-pulse" />
                <Trophy className="w-4 h-4 text-cyber-blue-bright animate-pulse" style={{animationDelay: '0.5s'}} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-cyber-text-muted font-mono">ONLINE</span>
            </div>
          </div>

          {/* ENHANCED HEADER CONTENT */}
          <div className="p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-1 h-8 bg-cyber-blue-bright rounded-full animate-pulse"></div>
              <h2 className="text-4xl md:text-5xl font-bold font-mono">
                <span className="text-cyber-text-bright">Gamify Your </span>
                <span className="text-cyber-blue-bright bg-gradient-to-r from-cyber-blue-bright to-cyber-blue-glow bg-clip-text text-transparent">Life</span>
              </h2>
              <div className="w-1 h-8 bg-cyber-blue-bright rounded-full animate-pulse"></div>
            </div>

            <div className="bg-cyber-terminal-bg/30 border border-cyber-line-color rounded-lg p-6 max-w-2xl mx-auto mb-10">
              <p className="text-lg text-cyber-text-bright leading-relaxed">
                A <span className="text-cyber-blue-bright font-semibold">friendly habit‑tracker</span> that turns your daily tasks into fun <span className="text-yellow-400 font-semibold">"quests."</span> 
                Complete chores, workouts, or study goals to earn <span className="text-green-400 font-semibold">XP</span>, level up your avatar, and track your progress—all in a <span className="text-cyber-blue-bright font-semibold">game‑style interface</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 m-10 mt-15">
              <div className="flex flex-col items-center group">
                <div className="relative mb-4">
                  <div className="absolute -inset-2 bg-gradient-to-r from-cyber-blue-bright/20 to-cyber-blue/20 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-cyber-blue/20 to-cyber-blue-bright/10 border border-cyber-line-color rounded-full flex items-center justify-center group-hover:border-cyber-blue-bright/50 transition-all duration-300">
                    <Target className="w-8 h-8 text-cyber-blue-bright group-hover:animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl text-cyber-blue-bright font-bold font-mono mb-2">Define Your Goals</h3>
                <p className="text-sm text-cyber-text-muted tracking-wide text-center">
                  Input daily/weekly tasks and aspirations to create your personal quest log.
                </p>
              </div>
              
              <div className="flex flex-col items-center group">
                <div className="relative mb-4">
                  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-yellow-400/10 border border-yellow-500/30 rounded-full flex items-center justify-center group-hover:border-yellow-400/50 transition-all duration-300">
                    <Flame className="w-8 h-8 text-yellow-400 group-hover:animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl text-yellow-400 font-bold font-mono mb-2">Train Like a Hero</h3>
                <p className="text-sm text-cyber-text-muted tracking-wide text-center">
                  Complete quests, build streaks, and grow your character stats.
                </p>
              </div>
              
              <div className="flex flex-col items-center group">
                <div className="relative mb-4">
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500/20 to-purple-400/10 border border-purple-500/30 rounded-full flex items-center justify-center group-hover:border-purple-400/50 transition-all duration-300">
                    <Crown className="w-8 h-8 text-purple-400 group-hover:animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl text-purple-400 font-bold font-mono mb-2">Conquer Bosses</h3>
                <p className="text-sm text-cyber-text-muted tracking-wide text-center">
                  Face monthly bosses, earn gear, and customize your character.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-20 mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-1 h-8 bg-cyber-blue-bright rounded-full animate-pulse"></div>
            <h2 className="text-4xl md:text-5xl font-bold font-mono">
              <span className="text-cyber-text-bright">Key </span>
              <span className="text-cyber-blue-bright bg-gradient-to-r from-cyber-blue-bright to-cyber-blue-glow bg-clip-text text-transparent">Features</span>
            </h2>
            <div className="w-1 h-8 bg-cyber-blue-bright rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* ENHANCED CARD CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 gap-y-12 pt-5">
          {CARD_CONTENT.map((program, index) => (
            <Card
              key={program.id}
              className="bg-cyber-terminal-bg/50 backdrop-blur-sm border border-cyber-line-color hover:border-cyber-blue-bright/50 transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-cyber-glow-primary/20 group"
            >
              <CardHeader className="pb-4">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="absolute -inset-2 bg-gradient-to-r from-cyber-blue-bright/20 to-cyber-blue/20 rounded-lg blur-sm group-hover:blur-md transition-all duration-300"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-cyber-blue/20 to-cyber-blue-bright/10 border border-cyber-line-color rounded-lg flex items-center justify-center group-hover:border-cyber-blue-bright/50 transition-all duration-300">
                      <img
                        src={program.img}
                        alt="Feature Icon"
                        className="w-16 h-16 object-cover object-center rounded-lg"       
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-center pb-6">
                <h3 className="text-xl text-cyber-blue-bright font-bold font-mono mb-3 group-hover:text-cyber-blue-glow transition-colors duration-300">
                  {program.title}
                </h3>
                <p className="text-sm text-cyber-text-muted tracking-wide leading-relaxed">
                  {program.desc}
                </p>
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-blue-bright to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-4"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ENHANCED BUTTON SECTION */}
        <div className="mt-20 text-center">
          <div className="relative inline-block">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyber-blue-bright to-cyber-blue-glow rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Link href="/profile">
              <Button
                size="lg"
                className="relative bg-gradient-to-r from-cyber-blue-bright to-cyber-blue text-cyber-dark hover:from-cyber-blue to-cyber-blue-bright px-10 py-6 text-lg font-bold font-mono transition-all duration-300 hover:shadow-lg hover:shadow-cyber-glow-strong/30 hover:scale-105"
              >
                <Shield className="mr-3 h-6 w-6" />
                Start Questing Now
                <Swords className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
            <p className="text-cyber-text-muted font-mono text-lg">
              Level up your Life Today
            </p>
            <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitContent;