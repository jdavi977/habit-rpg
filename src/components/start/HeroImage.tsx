const HeroImage = () => {
  return (
    <div className="lg:col-span-5 relative">
      {/* ENHANCED CORNER PIECES */}
      <div className="absolute -inset-6 pointer-events-none">
        <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-cyber-blue-bright/60"/>
        <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-cyber-blue-bright/60"/>
        <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-cyber-blue-bright/60"/>
        <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-cyber-blue-bright/60"/>
        
        {/* Animated corner dots */}
        <div className="absolute top-2 left-2 w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse"/>
        <div className="absolute top-2 right-2 w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse" style={{animationDelay: '0.5s'}}/>
        <div className="absolute bottom-2 left-2 w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse" style={{animationDelay: '1s'}}/>
        <div className="absolute bottom-2 right-2 w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse" style={{animationDelay: '1.5s'}}/>
      </div>

      {/* IMAGE CONTAINER */}
      <div className="relative aspect-square max-w-lg mx-auto">
        <div className="relative overflow-hidden rounded-lg bg-cyber-black border-2 border-cyber-line-color shadow-lg shadow-cyber-glow-primary/20">
          <img
            src="/codehealth.png"
            alt="HabitRPG Character"
            className="size-full object-cover object-center"                  
          />

          {/* ENHANCED SCAN ANIMATION */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,transparent_calc(50%-1px),var(--cyber-glow-primary)_50%,transparent_calc(50%+1px),transparent_100%)] bg-[length:100%_8px] animate-scanline pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,transparent_calc(50%-1px),var(--cyber-glow-primary)_50%,transparent_calc(50%+1px),transparent_100%)] bg-[length:8px_100%] animate-scanline pointer-events-none" style={{animationDelay: '2s'}}/>

          {/* ENHANCED DECORATIONS */}
          <div className="absolute inset-0 pointer-events-none">
            {/* TARGETING CROSSHAIR */}
            <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 border-2 border-cyber-blue-bright/60 rounded-full animate-pulse"/>
            
            {/* TARGETING LINES */}
            <div className="absolute top-1/2 left-0 w-1/4 h-px bg-gradient-to-r from-transparent to-cyber-blue-bright/60"/>
            <div className="absolute top-1/2 right-0 w-1/4 h-px bg-gradient-to-l from-transparent to-cyber-blue-bright/60"/>
            <div className="absolute top-0 left-1/2 h-1/4 w-px bg-gradient-to-b from-transparent to-cyber-blue-bright/60"/>
            <div className="absolute bottom-0 left-1/2 h-1/4 w-px bg-gradient-to-t from-transparent to-cyber-blue-bright/60"/>
            
            {/* Status indicators */}
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}/>
              <div className="w-2 h-2 bg-cyber-blue-bright rounded-full animate-pulse" style={{animationDelay: '0.6s'}}/>
            </div>
          </div>

          {/* ENHANCED GRADIENT FADE */}
          <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark via-cyber-dark/40 to-transparent"/>
        </div>
      </div>
    </div>
  );
};

export default HeroImage;
