import { HabitContent, HeroImage, HeroSection } from "@/components/start";

export default function Start() {
  return (
    <div className="min-h-screen text-text-primary overflow-hidden relative">
      {/* Hero Section with vertical flow */}
      <section className="relative z-10 py-16 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col gap-8 lg:gap-12 xl:gap-16 items-center relative">
            <HeroSection />
            <HeroImage />
          </div>
        </div>
      </section>
      
      {/* Content Section with better spacing */}
      <section className="relative z-10">
        <HabitContent />
      </section>
    </div>
  );
}
