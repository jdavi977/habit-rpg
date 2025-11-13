// Energy System
export const DEFAULT_MAX_ENERGY = 20;
export const ENERGY_REGEN_PER_TURN = 3;

// Default Stats
export const DEFAULT_STARTING_HP = 100;
export const DEFAULT_STARTING_ATTACK = 10;
export const DEFAULT_STARTING_DEFENSE = 5;

// Combat Constants
export const MAX_STATUS_EFFECT_STACKS = 10;
export const DEFAULT_ABILITY_COOLDOWN = 0; // No cooldown unless specified
export const BASE_CRITICAL_HIT_CHANCE = 0.9; // Baseline: if RNG > 0.9, critical hit occurs (10% chance)
export const CRITICAL_HIT_DAMAGE_MULTIPLIER = 1.5; // Critical hits deal 1.5x damage

// Dodge Constants
export const BASE_DODGE_BASELINE = 0.85; // Base baseline: if RNG > 0.85, dodge opportunity occurs (15% base chance)
export const AGILITY_DODGE_SCALING = 50; // How much agility reduces the baseline (higher = less impact per point)
export const MIN_DODGE_BASELINE = 0.1; // Minimum baseline (maximum 90% dodge chance)
export const MAX_DODGE_BASELINE = 0.95; // Maximum baseline (minimum 5% dodge chance)

// Percentage Constants
export const FLOAT_TO_PERCENT = 100;

// Ability Constants
export const BASELINE_WEIGHT = 1.0;