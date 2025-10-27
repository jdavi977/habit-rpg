/**
 * @fileoverview Background effects component for landing page
 * @module components/start/BackgroundEffects
 * 
 * Provides subtle animated background elements for the landing page:
 * - Grid pattern overlay
 * - Animated scanning lines
 * 
 * Creates depth and visual interest without overwhelming content.
 */

/**
 * Background effects for landing page
 * 
 * Renders subtle animated grid pattern and scanlines to create
 * a cyber-themed atmosphere without distracting from content.
 * 
 * @returns {JSX.Element} Background effects container
 */
const BackgroundEffects = () => {
  return (
    <>
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(24,206,242,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(24,206,242,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50"></div>
      
      {/* Animated Scan Lines */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-blue/5 to-transparent animate-scanline"></div>
    </>
  );
};

export default BackgroundEffects;
