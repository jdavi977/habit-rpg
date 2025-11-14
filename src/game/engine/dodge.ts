import { 
    BASE_DODGE_BASELINE, 
    AGILITY_DODGE_SCALING, 
    MIN_DODGE_BASELINE, 
    MAX_DODGE_BASELINE 
} from "../constants";
import { ActiveCharacter, Monster } from "../types";

/**
 * Calculates the dodge baseline based on agility stat.
 * Higher agility = lower baseline = better dodge chance.
 * 
 * Formula: baseline = BASE_DODGE_BASELINE - (agility / AGILITY_DODGE_SCALING)
 * Clamped between MIN_DODGE_BASELINE and MAX_DODGE_BASELINE
 * 
 * @param monster - Optional monster to get agility from
 * @param player - Optional player/character to get agility from
 * @returns The dodge baseline (if RNG > this value, dodge opportunity occurs)
 * 
 * @example
 * // 0 agility: baseline = 0.85 (15% dodge chance)
 * // 10 agility: baseline = 0.65 (35% dodge chance)
 * // 20 agility: baseline = 0.45 (55% dodge chance)
 * // 30 agility: baseline = 0.25 (75% dodge chance)
 */
export function calculateDodgeBaseline(entity: Monster | ActiveCharacter): number {
    const agilityStat = entity?.stats.agility
    
    // Calculate baseline: higher agility reduces baseline (improves dodge chance)
    const baseline = BASE_DODGE_BASELINE - (agilityStat / AGILITY_DODGE_SCALING);
    
    // Clamp between min and max to prevent extreme values
    return Math.max(MIN_DODGE_BASELINE, Math.min(MAX_DODGE_BASELINE, baseline));
}