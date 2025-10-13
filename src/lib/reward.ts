export const streakMultiplier = (s = 0) => 1 + Math.min(s / 7, 0.5);
export const diffMultiplier = (d?: string) =>
  d === "Easy" ? 5 : d === "Medium" ? 8 : d === "Hard" ? 10 : 0;

export const computeGoldInc = (difficulty?: string, streak = 0) => {
  const inc = diffMultiplier(difficulty) * streakMultiplier(streak);
  return Math.round(inc); // whole number
};

export const computeRewardMultipliers = (difficulty?: string, streak = 0) => {
  const diffMult = diffMultiplier(difficulty);
  const streakMult = streakMultiplier(streak);
  const baseMultiplier = diffMult * streakMult;
  
  return {
    diffMultiplier: diffMult,
    streakMultiplier: streakMult,
    gold: Math.round(baseMultiplier),
    exp: Math.round(baseMultiplier),
    mana: Math.round(baseMultiplier)
  };
};