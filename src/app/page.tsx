import Image from "next/image";
import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

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
              <div>
                <Button>
                  Get Started
                </Button>
              </div>
            </div>

            {/* RIGHT SIDE CONTENT */}
            <div>

            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
