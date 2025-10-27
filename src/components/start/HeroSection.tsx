/**
 * @fileoverview Landing page hero section component
 * @module components/start/HeroSection
 * 
 * Main hero section for the landing page featuring:
 * - Animated headline text
 * - Welcome card with description
 * - Statistics grid (users, tasks, success rate)
 * 
 * Uses staggered animations for visual appeal.
 */

/**
 * Hero section component for landing page
 * 
 * Displays the main headline, welcome message, and key statistics.
 * Uses animated text reveals and gradient styling for visual impact.
 * 
 * @returns {JSX.Element} Hero section with headline and stats
 */
const HeroSection = () => {
  return (
    <div className="w-full max-w-4xl space-y-6 md:space-y-8 lg:space-y-10 relative flex flex-col justify-center">
      {/* Main Heading with improved typography */}
      <div className="space-y-2 md:space-y-3 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
          <div className="animate-gentle-fade-in">
            <span className="text-text-primary">Build Better</span>
          </div>
          <div className="animate-gentle-fade-in" style={{animationDelay: '0.1s'}}>
            <span className="text-soft-primary">Habits</span>
          </div>
          <div className="animate-gentle-fade-in" style={{animationDelay: '0.2s'}}>
            <span className="text-text-primary">One Task at a</span>
          </div>
          <div className="animate-gentle-fade-in" style={{animationDelay: '0.3s'}}>
            <span className="text-soft-secondary">Time</span>
          </div>
        </h1>
      </div>

      {/* Enhanced separator line */}
      <div className="relative py-2">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent"></div>
        <div className="absolute inset-0 h-px w-full bg-gradient-to-r from-transparent via-soft-primary/30 to-transparent animate-gentle-pulse"></div>
      </div>

      {/* Welcome Card with improved styling */}
      <div className="relative bg-card-bg-secondary border border-border rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 group text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-2 h-2 bg-soft-primary rounded-full animate-gentle-pulse"></div>
          <span className="text-sm text-soft-primary font-medium">Welcome</span>
        </div>
        <div className="space-y-2">
          <div>
            <span className="text-xl md:text-2xl text-text-primary font-semibold">
              Transform Your Daily Routine:
            </span>
          </div>
          <div>
            <span className="text-xl md:text-2xl text-text-primary font-semibold">
              Every Task into Progress!
            </span>
          </div>
        </div>
        <div className="mt-4 text-base md:text-lg text-text-secondary leading-relaxed">
          Turn your daily habits into an engaging journey of self-improvement. Complete tasks, earn rewards, and watch yourself grow.
        </div>
        
        {/* Subtle hover effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-soft-primary/5 to-soft-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>

      {/* Enhanced stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 py-4 md:py-6">
        <div className="bg-gradient-to-br from-soft-primary/10 to-soft-primary/5 border border-border rounded-2xl p-4 md:p-6 text-center hover:border-soft-primary/50 transition-all duration-300 hover:shadow-md group cursor-pointer">
          <div className="text-2xl md:text-3xl font-bold text-soft-primary mb-2 group-hover:scale-105 transition-transform duration-300">100k+</div>
          <div className="text-sm text-text-secondary font-medium">Active Users</div>
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-soft-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2"></div>
        </div>
        <div className="bg-gradient-to-br from-soft-accent/10 to-soft-accent/5 border border-border rounded-2xl p-4 md:p-6 text-center hover:border-soft-accent/50 transition-all duration-300 hover:shadow-md group cursor-pointer">
          <div className="text-2xl md:text-3xl font-bold text-soft-accent mb-2 group-hover:scale-105 transition-transform duration-300">10k+</div>
          <div className="text-sm text-text-secondary font-medium">Tasks Completed</div>
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-soft-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2"></div>
        </div>
        <div className="bg-gradient-to-br from-soft-secondary/10 to-soft-secondary/5 border border-border rounded-2xl p-4 md:p-6 text-center hover:border-soft-secondary/50 transition-all duration-300 hover:shadow-md group cursor-pointer">
          <div className="text-2xl md:text-3xl font-bold text-soft-secondary mb-2 group-hover:scale-105 transition-transform duration-300">92%</div>
          <div className="text-sm text-text-secondary font-medium">Success Rate</div>
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-soft-secondary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
