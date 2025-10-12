import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, Sparkles, Star } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="lg:col-span-7 space-y-8 ml-10 relative pr-8">
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
        <div>
          <span className="text-text-primary">Build Better</span>
        </div>
        <div>
          <span className="text-soft-primary">Habits</span>
        </div>
        <div className="pt-2">
          <span className="text-text-primary">One Task at a</span>
        </div>
        <div className="pt-2">
          <span className="text-soft-secondary">Time</span>
        </div>
      </h1>

      {/* Soft separator line */}
      <div className="relative">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent"></div>
      </div>

      <div className="relative bg-card-bg-secondary border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-soft-primary rounded-full animate-gentle-pulse"></div>
          <span className="text-sm text-soft-primary font-medium">Welcome</span>
        </div>
        <div>
          <span className="text-xl text-text-primary font-semibold">
            Transform Your Daily Routine:
          </span>
        </div>
        <div>
          <span className="text-xl text-text-primary font-semibold">
            Every Task into Progress!
          </span>
        </div>
        <div className="mt-2 text-lg text-text-secondary">
          Turn your daily habits into an engaging journey of self-improvement. Complete tasks, earn rewards, and watch yourself grow.
        </div>
      </div>

      {/* Soft stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
        <div className="bg-gradient-to-br from-soft-primary/10 to-soft-primary/5 border border-border rounded-2xl p-4 text-center hover:border-soft-primary/50 transition-all duration-300 hover:shadow-md group">
          <div className="text-3xl font-bold text-soft-primary mb-2 group-hover:scale-105 transition-transform duration-300">100k+</div>
          <div className="text-sm text-text-secondary font-medium">Active Users</div>
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-soft-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2"></div>
        </div>
        <div className="bg-gradient-to-br from-soft-accent/10 to-soft-accent/5 border border-border rounded-2xl p-4 text-center hover:border-soft-accent/50 transition-all duration-300 hover:shadow-md group">
          <div className="text-3xl font-bold text-soft-accent mb-2 group-hover:scale-105 transition-transform duration-300">10k+</div>
          <div className="text-sm text-text-secondary font-medium">Tasks Completed</div>
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-soft-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2"></div>
        </div>
        <div className="bg-gradient-to-br from-soft-secondary/10 to-soft-secondary/5 border border-border rounded-2xl p-4 text-center hover:border-soft-secondary/50 transition-all duration-300 hover:shadow-md group">
          <div className="text-3xl font-bold text-soft-secondary mb-2 group-hover:scale-105 transition-transform duration-300">92%</div>
          <div className="text-sm text-text-secondary font-medium">Success Rate</div>
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-soft-secondary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2"></div>
        </div>
      </div>

      <div>
        <Button
          size="lg"
          asChild
          className="relative overflow-hidden bg-gradient-to-r from-soft-primary to-soft-secondary text-text-primary px-8 py-6 text-lg font-medium hover:from-soft-primary/90 hover:to-soft-secondary/90 transition-all duration-300 hover:shadow-lg hover:scale-105"
        >
          <Link
            href={"/home"}
            className="flex items-center gap-3"
          >
            <Heart className="size-5" />
            Start Your Journey
            <Sparkles className="size-5"/>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default HeroSection;
