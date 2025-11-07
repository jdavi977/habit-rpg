import { join } from "path";
import { Ability, CombatStats, Monster } from "../types";
import { readFileSync } from "fs";

// Directory path for monster JSON files
// Monsters are loaded on-demand and cached in memory
const monstersDir = join(process.cwd(), 'src/game/content/monsters')

// Stores loaded monsters in memory to prevent re-reading files
const monsterCache = new Map<string, Monster>();

/**
 * Validates the monsters json data
 * @param data 
 * @returns The validated monster's fields
 */
function validateMonster(data: any): Monster {
    // 1. Check top-level required fields
    if (!data.id || typeof data.id !== 'string') {
        throw new Error(`Invalid monster: missing or invalid 'id' field`);
    }
    
    if (!data.name || typeof data.name !== 'string') {
        throw new Error(`Invalid monster ${data.id}: missing or invalid 'name' field`);
    }
    
    // 2. Validate stats object
    if (!data.stats || typeof data.stats !== 'object') {
        throw new Error(`Invalid monster ${data.id}: missing or invalid 'stats' field`);
    }
    
    const stats = data.stats;
    const requiredStats: (keyof CombatStats)[] = [
        'currentHP', 'maxHP', 'currentEnergy', 'maxEnergy', 'attack', 'defense'
    ];
    
    for (const stat of requiredStats) {
        if (typeof stats[stat] !== 'number') {
            throw new Error(`Invalid monster ${data.id}: missing or invalid stat '${stat}'`);
        }
    }
    
    // Validate HP values make sense
    if (stats.currentHP > stats.maxHP) {
        throw new Error(`Invalid monster ${data.id}: currentHP cannot exceed maxHP`);
    }
    
    // 3. Validate abilities array
    if (!Array.isArray(data.abilities)) {
        throw new Error(`Invalid monster ${data.id}: 'abilities' must be an array`);
    }
    
    if (data.abilities.length !== 4) {
        throw new Error(`Invalid monster ${data.id}: must have exactly 4 abilities, found ${data.abilities.length}`);
    }
    
    // 4. Validate each ability
    data.abilities.forEach((ability: any, index: number) => {
        if (!ability.id || typeof ability.id !== 'string') {
            throw new Error(`Invalid monster ${data.id}: ability ${index} missing 'id'`);
        }
        
        if (!ability.name || typeof ability.name !== 'string') {
            throw new Error(`Invalid monster ${data.id}: ability ${index} missing 'name'`);
        }
        
        if (!ability.description || typeof ability.description !== 'string') {
            throw new Error(`Invalid monster ${data.id}: ability ${index} missing 'description'`);
        }
        
        if (typeof ability.manaCost !== 'number' || ability.manaCost < 0) {
            throw new Error(`Invalid monster ${data.id}: ability ${index} invalid 'manaCost'`);
        }
        
        if (typeof ability.cooldown !== 'number' || ability.cooldown < 0) {
            throw new Error(`Invalid monster ${data.id}: ability ${index} invalid 'cooldown'`);
        }
    });

    return {
        id: data.id,
        name: data.name,
        stats: data.stats as CombatStats,
        abilities: data.abilities as Ability[],
    };
}

/**
 * Returns monster IDs based on the level
 * @param level the player's current level
 * @returns an array of monster IDs
 */
function getMonsterIdsForLevel(level: number): string[] {
    if (level <= 5) {
        return ['goblin', 'skeleton']
    }

    if (level <= 10) {
        return ['orc', 'skeleton']
    }

    if (level <= 15) {
        return ['dragon', 'orc']
    }

    return ['boss_skeleton_king', 'dragon']
}

/**
 * Returns a monster based on the id
 * @param id the id of the monster
 * @returns the data of a monster
 */
export function getMonster(id: string): Monster | null {
    if (monsterCache.has(id)) {
        return monsterCache.get(id)!;
    }

    try {
        const filePath = join(monstersDir, `${id}.json`);
        const data = JSON.parse(readFileSync(filePath, 'utf-8'));
        const monster = validateMonster(data);
        monsterCache.set(id, monster);
        return monster;
    } catch (error) {
        console.error(`Failed to load monster ${id}:`, error);
        return null
    }
}

/**
 * Returns a random monster based on the level
 * @param level the player's current level
 * @returns a random monster object
 */
export function getRandomMonsterForLevel(level: number): Monster | null {
    const monsterIds = getMonsterIdsForLevel(level);
    if (monsterIds.length === 0) {
        return null;
    }
    const randomId = monsterIds[Math.floor(Math.random() * monsterIds.length)];
    return getMonster(randomId)
}
