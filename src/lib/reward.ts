export const streakMultiplier = (s = 0) => 1 + Math.min(s / 7, 0.5);
export const diffMultiplier = (d?: string) =>
  d === "Easy" ? 5 : d === "Medium" ? 8 : d === "Hard" ? 10 : 0;


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

export const computeGoldInc = (difficulty?: string, streak = 0) => {
  const inc = diffMultiplier(difficulty) * streakMultiplier(streak);
  return Math.round(inc); // whole number
};

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