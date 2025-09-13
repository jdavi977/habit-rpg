import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Swords, Shield } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="lg:col-span-7 space-y-8 ml-10 relative pr-8">
      <h1 className="text-5xl md:text-6xl lg:text-7x1 font-bold tracking-tight">
        <div>
          <span className="text-foreground">Rise to the</span>
        </div>
        <div>
          <span className="text-primary">Challenge</span>
        </div>
        <div className="pt-2">
          <span className="text-foreground">Adventure Awaits</span>
        </div>
        <div className="pt-2">
          <span className="text-primary">In Every Task</span>
        </div>
      </h1>

      {/* ENHANCED SEPARATOR LINE */}
      <div className="relative">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyber-blue-bright to-transparent"></div>
        <div className="absolute inset-0 h-px w-full bg-gradient-to-r from-transparent via-cyber-blue-glow to-transparent opacity-50 animate-pulse"></div>
      </div>

      <div className="relative bg-cyber-terminal-bg/30 border border-cyber-line-color rounded-lg p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"></div>
          <span className="text-sm text-cyber-blue-bright font-mono uppercase tracking-wider">Mission Brief</span>
        </div>
        <div>
          <span className="text-xl text-cyber-text-bright font-semibold">
            Level Up Your Life:
          </span>
        </div>
        <div>
          <span className="text-xl text-cyber-text-bright font-semibold">
            Every Task into an Epic Quest!
          </span>
        </div>
        <div className="mt-2 text-xl text-cyber-text-muted">
          Transform mundane daily routines into exciting adventures. Complete quests, earn XP, and become the hero of your own story.
        </div>
      </div>

      {/* ENHANCED STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
        <div className="bg-gradient-to-br from-cyber-blue/10 to-cyber-blue/5 border border-cyber-line-color rounded-lg p-4 text-center hover:border-cyber-blue-bright/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyber-glow-primary/20 group">
          <div className="text-3xl font-bold text-cyber-blue-bright mb-2 group-hover:scale-110 transition-transform duration-300">100k+</div>
          <div className="text-sm text-cyber-text-muted uppercase tracking-wider font-mono">Active Heroes</div>
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-blue-bright to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2"></div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 text-center hover:border-yellow-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 group">
          <div className="text-3xl font-bold text-yellow-400 mb-2 group-hover:scale-110 transition-transform duration-300">10k+</div>
          <div className="text-sm text-cyber-text-muted uppercase tracking-wider font-mono">Quests Completed</div>
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2"></div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg p-4 text-center hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 group">
          <div className="text-3xl font-bold text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300">92%</div>
          <div className="text-sm text-cyber-text-muted uppercase tracking-wider font-mono">7-Day Streaks</div>
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2"></div>
        </div>
      </div>

      <div>
        <Button
          size="lg"
          asChild
          className="relative overflow-hidden bg-primary text-primary-foreground px-8 py-6 text-lg font-medium hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:scale-105"
        >
          <Link
            href={"profile"}
            className="flex items-center gap-3"
          >
            <Shield className="size-5" />
            Start Your First Quest
            <Swords className="size-5"/>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default HeroSection;
