export interface Ability {
  id: string; // Unique Identifier
  name: string; // Display name
  description: string; // What the ability does
  manaCost: number; // Mana required
  cooldown: number; // Turns before the ability can be used again
  damage?: number; // Optional: fixed amount of damage
  damageFormula?: string; // Optiona;:  formula like "10 + ATK * 1.5"
  effects?: AbilityEffect[]; // Optiona;: Array of effects this ability can apply
}

export interface AbilityEffect {
  type: "damage" | "heal" | "applyStatus" | "buff";
  amount?: number; // damage/heal
  status?: StatusEffectType; // applyStatus
  duration?: number; // how long the status lasts
  baseline: number; // if rng > baseline, effect is allowed (baseline should be in [0, 1])
}

export type StatusEffectType =
  | "burn"
  | "poison"
  | "shield"
  | "stun"
  | "regeneration"; // Placeholders

// What's stored in DB
export interface PersistentStats {
  health: number;
  total_health: number;
  mana: number;
  total_mana: number;
  level: number;
  exp: number;
  total_exp: number;
  gold: number;
}

// What's stored in the database
export interface Character {
  id: string;
  player_id: string;
  name: string;
  class_id: string;
  // Store persistent stats reference
  stats_id?: string;
}

export interface StatusEffect {
  type: StatusEffectType;
  duration: number; // Always needed - when it expires
  stacks?: number; // Optional - for stackable effects
  perTurnAmount?: number; // Optional - damage/heal per turn
  sourceAbilityId?: string; // Optional - for tracking/logging
}

export interface DodgeOpportunity {
  isAvailable: boolean;
  timingWindow: number;
  rngValue: number;
}

export interface Monster {
  id: string;
  name: string;
  entityType: string;
  stats: CombatStats;
  abilities: Ability[];
}

// What you use during gameplay (combines Character + Class + Stats)
export interface ActiveCharacter {
  id: string;
  name: string;
  entityType: string;
  class: Class; // Full class object loaded
  stats: CombatStats; // Current combat stats
  // Status effects currently active
  statusEffects?: StatusEffect[];
}

// What's used in combat (includes temporary state)
export interface CombatStats {
  currentHP: number;
  maxHP: number;
  currentMana: number;
  maxMana: number;
  attack: number;
  defense: number;
  agility: number;
  // Temporary modifiers from status effects
  attackModifier?: number;
  defenseModifier?: number;
}

export interface Class {
  id: string; // Unique identifier (e.g., "boxer", "runner")
  name: string; // Display name (e.g., "Boxer", "Marathon Runner")
  description: string; // Class description/flavor text
  abilities: Ability[]; // The 4 abilities this class provides
  // Optional: base stat modifiers if classes have different starting stats
  baseAttack?: number;
  baseDefense?: number;
}

export interface BattleState {
  id: string;
  status: "active" | "won" | "lost";
  player: ActiveCharacter; // Current player stats
  enemy: Monster; // Current enemy stats
  turn: number;
}

export interface Action {
  type: "useAbility" | "endTurn";
  abilityId?: string; // Required if type is "useAbiity"
  targetId?: string; // Who the action targets
}