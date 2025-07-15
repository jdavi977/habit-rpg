import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronRight,
  Dumbbell,
  Sparkles,
  Users,
  Clock,
  AppleIcon,
  ShieldIcon,
  Swords,
} from "lucide-react";

const HabitContent = () => {
  return (
    <div className="w-full pb-24 pt-35 relative">
      <div className="container mx-auto max-w-6xl px-4">
        {/* HEADER- PROGRAM GALLERY */}
        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg overflow-hidden mb-16">
          {/* HEADER BAR */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-background/70">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
              <span className="text-sm text-primary font-medium">HabitRPG - Ascend</span>
            </div>

          </div>

          {/* HEADER CONTENT */}
          <div className="p-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-foreground">Gamify Your </span>
              <span className="text-primary">Life</span>
            </h2>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              A friendly habit‑tracker that turns your daily tasks into fun “quests.” 
              Complete chores, workouts, or study goals to earn XP, level up your avatar, and track your progress—all in a game‑style interface.
            </p>
          </div>
        </div>

        {/* BUTTON SECTION */}
        <div className="mt-16 text-center">
          <Link href="/profile">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg"
            >
              Start Questing Now
              <Swords className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-muted-foreground mt-4">
            Level up your Life Today
          </p>
        </div>
      </div>
    </div>
  );
};

export default HabitContent;