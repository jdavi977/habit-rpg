import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Swords,
} from "lucide-react";
import { CARD_CONTENT } from "@/constants";


const HabitContent = () => {
  return (
    <div className="w-full pb-24 pt-35 relative">
      <div className="container mx-auto max-w-7xl px-4">

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

            <div className="flex items-center justify-center gap-16 m-10 mt-15 font-mono">
              <div className="flex flex-col items-center flex-1 basis-0">
                <img
                  src="/avatar1.png"
                  alt="AI Fitness Coach"
                  className="size-full object-cover object-center m-5"       
                />
                <p className="text-xl text-primary">Define Your Goals</p>
                <p className="text-sm text-muted-foreground  tracking-wide mt-1">
                  Input daily/weekly tasks and aspirations.
                </p>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div className="flex flex-col items-center flex-1 basis-0">
                <img
                  src="/avatar1.png"
                  alt="AI Fitness Coach"
                  className="size-full object-cover object-center m-5"       
                />
                <p className="text-xl text-primary">Train Like a Hero</p>
                <p className="text-sm text-muted-foreground tracking-wide mt-1">
                  Complete quests, build streaks, and grow your stats.
                </p>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div className="flex flex-col items-center flex-1 basis-0">
                <img
                  src="/avatar1.png"
                  alt="AI Fitness Coach"
                  className="size-full object-cover object-center m-5"       
                />
                <p className="text-xl text-primary">Conquer Bosses</p>
                <p className="text-sm text-muted-foreground tracking-wide mt-1">
                  Face monthly bosses, earn gear, and customize your character.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 text-center pt-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Key </span>
            <span className="text-primary">Features</span>
          </h2>
        </div>

        {/* CARD CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 gap-y-35 pt-5">
          {CARD_CONTENT.map((program) => (
            <Card
              key={program.id}
              className="bg-card/90 backdrop-blur-sm border border-border hover:border-primary/50 tranistion-colors overflow-hidden"
            >
              <CardHeader>
              <div className="flex flex-col items-center flex-1 basis-0">
                <img
                  src={program.img}
                  alt="AI Fitness Coach"
                  className="size-full object-cover object-center m-5"       
                />
              </div>
              </CardHeader>
              <CardContent
                className="text-center"
              >
                <p className="text-xl text-primary">{program.title}</p>
                <p className="text-sm text-muted-foreground  tracking-wide mt-1">
                  {program.desc}
                </p>
              </CardContent>
            </Card>
          ))}
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