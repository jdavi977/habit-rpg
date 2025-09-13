import { BackgroundEffects, HabitContent, HeroImage, HeroSection } from "@/components/start";

export default function Start() {
  return (
    <div className="flex flex-col min-h-screen text-cyber-text-bright overflow-hidden relative">
      <BackgroundEffects />
      
      <section className="relative z-10 py-24 flex-grow">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
            <HeroSection />
            <HeroImage />
          </div>
        </div>
      </section>
      <HabitContent />
    </div>
  );
}
