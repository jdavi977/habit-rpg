import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Swords } from "lucide-react";
import HabitContent from "@/components/start/HabitContent";

export default function Start() {
  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden">
      <section className="relative z-10 py-24 flex-grow">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
            {/* LEFT SIDE CONTENT */}
            <div className="lg:col-span-7 space-y-8 ml-10 relative">
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

              {/* SEPERATOR LINE */}
              <div className="h-px w-full bg-gradient-to-r from-primary via-secondary to-primary opacity-50"/>

              <div className="relative">
                <div>
                  <span className="text-xl text-muted-foreground w-2/3">
                    Level Up Your Life:
                  </span>
                </div>
                <div>
                  <span className="text-xl text-muted-foreground w-2/3">
                    Every Task into an Epic Quest!
                  </span>
                </div>
              </div>

              {/* STATS */}
              <div className="flex items-center gap-10 py-6 font-mono">
                <div className="flex flex-col">
                  <div className="text-2xl text-primary uppercase">Over 100k</div>
                  <div className="uppercase tracking-wider">active users</div>
                </div>
                <div className="flex flex-col">
                  <div className="text-2xl text-primary uppercase">10,000+ quests</div>
                  <div className="uppercase tracking-wider">Completed this month</div>
                </div>
                <div className="flex flex-col">
                  <div className="text-2xl text-primary uppercase">92% users</div>
                  <div className="uppercase tracking-wider">maintain a 7-day streak</div>
                </div>
              </div>

              <div>
                <Button
                  size="lg"
                  asChild
                  className="overflow-hidden bg-primary text-primary-foreground px-8 py-6 text-lg font-medium"
                >
                  <Link
                    href={"profile"}
                    className="flex items-center font-mono"
                  >
                    Start Your First Quest
                    <Swords className="ml-2 size-5"/>
                  </Link>
                </Button>
              </div>
            </div>

            {/* RIGHT SIDE CONTENT */}
            <div className="lg:col-span-5 relative">
              
              {/* CORNER PIECES */}
              <div className="absolute -inset-4 pointer-events-none">
                <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-border"/>
                <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-border"/>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-border"/>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-border"/>
              </div>

              {/* IMAGE CONTAINER */}
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="relative overflow-hidden rounded-lg bg-cyber-black">
                  <img
                    src="/codehealth.png"
                    alt="AI Fitness Coach"
                    className="size-full object-cover object-center"                  
                  />

                  {/* SCAN ANIMATION LINE */}
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,transparent_calc(50%-1px),var(--cyber-glow-primary)_50%,transparent_calc(50%+1px),transparent_100%)] bg-[length:100%_8px] animate-scanline pointer-events-none" />

                  {/* DECORATIONS ON IMAGE */}
                  <div className="absolute inset-0 pointer-events-none">

                    {/* HIT MARKER*/}
                    <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 border border-primary/40 rounded-full"/>

                    {/* TARGETING LINES */}
                    <div className="absolute top-1/2 left-0 w-1/4 h-px bg-primary/50"/>
                    <div className="absolute top-1/2 right-0 w-1/4 h-px bg-primary/50"/>
                    <div className="absolute top-0 left-1/2 h-1/4 w-px bg-primary/50"/>
                    <div className="absolute bottom-0 left-1/2 h-1/4 w-px bg-primary/50"/>
                  </div>

                  {/* GRADIENT FADE */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <HabitContent/>
    </div>
  );
}
