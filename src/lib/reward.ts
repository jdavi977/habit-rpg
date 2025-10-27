/**
 * @fileoverview Reward calculation system for the HabitRPG game
 * @module lib/reward
 * 
 * This module handles all reward calculations including:
 * - Streak bonuses that increase rewards based on consecutive task completions
 * - Difficulty multipliers that scale rewards by task difficulty
 * - Experience point requirements for leveling up
 * - Gold, experience, and mana reward calculations
 */

/**
 * Calculates the streak multiplier for rewards based on current streak count
 * 
 * The multiplier increases linearly up to a maximum bonus of 50% at 7 days.
 * After 7 days of streaks, the multiplier caps at 1.5x (50% bonus).
 * This incentivizes daily consistency while preventing runaway rewards.
 * 
 * @param {number} s - Current streak count (default: 0)
 * @returns {number} Multiplier between 1.0 and 1.5 (inclusive)
 * 
 * @example
 * streakMultiplier(0)   // 1.0  (no bonus)
 * streakMultiplier(7)   // 1.5  (50% bonus, capped)
 * streakMultiplier(14)  // 1.5  (still capped at 50%)
 */
export const streakMultiplier = (s = 0) => 1 + Math.min(s / 7, 0.5);

/**
 * Determines the base difficulty multiplier for task rewards
 * 
 * Harder tasks reward more resources to reflect increased effort.
 * Returns 0 if difficulty is undefined or invalid.
 * 
 * @param {string} d - Task difficulty ("Easy", "Medium", or "Hard")
 * @returns {number} Multiplier value (5, 8, 10, or 0)
 * 
 * @example
 * diffMultiplier("Easy")    // 5
 * diffMultiplier("Medium")  // 8
 * diffMultiplier("Hard")    // 10
 * diffMultiplier("Unknown") // 0
 */
export const diffMultiplier = (d?: string) =>
  d === "Easy" ? 5 : d === "Medium" ? 8 : d === "Hard" ? 10 : 0;

/**
 * Calculates the total experience points required to reach a specific level
 * 
 * Uses a progressive scaling system to prevent leveling from becoming too easy or too hard:
 * - Levels 1-10: Linear growth for predictable early progression
 * - Levels 11-25: Quadratic growth for steady mid-game challenge
 * - Levels 26+: Exponential growth with diminishing returns
 * 
 * @param {number} level - Target level (default: 1)
 * @returns {number} Total experience points required for the level
 * 
 * @example
 * totalExpForLevel(1)   // 100
 * totalExpForLevel(10)  // 1000
 * totalExpForLevel(25)  // 4000
 * totalExpForLevel(30)  // ~8000
 */
export const totalExpForLevel = (level = 1): number => {
  // Base experience required for each level
  // Examples: Level 1: 100, Level 5: 500, Level 10: 1000, Level 15: 1750, Level 25: 4000, Level 30: ~8000
  // Higher levels require exponentially more exp to prevent easy leveling
  const baseExp = 100;
  
  if (level <= 10) {
    // Levels 1-10: Linear growth (100, 200, 300, ..., 1000)
    return baseExp * level;
  } else if (level <= 25) {
    // Levels 11-25: Quadratic growth (1100, 1300, 1600, ..., 4000)
    const level10Exp = baseExp * 10; // 1000
    const extraLevels = level - 10;
    return level10Exp + (extraLevels * (extraLevels + 1) / 2) * 50;
  } else {
    // Levels 26+: Exponential growth with diminishing returns
    const level25Exp: number = totalExpForLevel(25); // Get exp for level 25
    const extraLevels = level - 25;
    return Math.round(level25Exp * Math.pow(1.15, extraLevels));
  }
};

/**
 * Calculates gold reward for completing a task
 * 
 * Combines difficulty and streak multipliers to determine gold earned.
 * Higher difficulty and longer streaks result in more gold.
 * 
 * @param {string} difficulty - Task difficulty (default: undefined)
 * @param {number} streak - Current streak count (default: 0)
 * @returns {number} Gold reward (rounded to whole number)
 * 
 * @example
 * computeGoldInc("Easy", 0)    // 5
 * computeGoldInc("Medium", 7)  // 12 (8 * 1.5)
 * computeGoldInc("Hard", 3)    // 10 (10 * 1.0)
 */
export const computeGoldInc = (difficulty?: string, streak = 0) => {
  const inc = diffMultiplier(difficulty) * streakMultiplier(streak);
  return Math.round(inc); // whole number
};

/**
 * Computes all reward multipliers and returns a complete reward breakdown
 * 
 * This is the main function for calculating rewards when completing a task.
 * It calculates gold, experience, and mana rewards based on difficulty,
 * streak count, and current level. Used by the database layer when completing tasks.
 * 
 * @param {string} difficulty - Task difficulty level
 * @param {number} streak - Current task completion streak
 * @param {number} level - Current user level (used for exp calculations)
 * @returns {Object} Complete reward breakdown containing:
 *   - diffMultiplier: Base difficulty multiplier
 *   - streakMultiplier: Streak bonus multiplier
 *   - totalExp: Total exp required for current level
 *   - gold: Gold reward amount
 *   - exp: Experience reward amount
 *   - mana: Mana reward amount
 * 
 * @example
 * computeRewardMultipliers("Hard", 7, 10)
 * // Returns: { diffMultiplier: 10, streakMultiplier: 1.5, totalExp: 1000, gold: 15, exp: 15, mana: 15 }
 */
export const computeRewardMultipliers = (difficulty?: string, streak = 0, level = 1) => {
  const diffMult = diffMultiplier(difficulty);
  const streakMult = streakMultiplier(streak);
  const baseMultiplier = diffMult * streakMult;
  const totalExp = totalExpForLevel(level);
  
  return {
    diffMultiplier: diffMult,
    streakMultiplier: streakMult,
    totalExp: totalExp,
    gold: Math.round(baseMultiplier),
    exp: Math.round(baseMultiplier),
    mana: Math.round(baseMultiplier)
  };
};