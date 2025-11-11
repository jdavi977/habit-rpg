import { Action, BattleState } from "../types";
import { selectMonsterAction } from "./ai";
import { continueBattleState, wonBattleState } from "./battleState";
import { createRNG } from "./rng";

export function applyAction(battleState: BattleState, action?: Action, dodgeChance?: boolean): BattleState {
    if (action?.type === "endTurn") {
        return continueBattleState(battleState)
    }

    const target = action?.targetId;
    const user = battleState?.player
    const monster = battleState?.enemy

    // make function to find player ability using action.abilityId
    const ability = user.class.abilities.find((ability) => ability.id === action?.abilityId)
    // use function to get AI action next
    //const monsterAbility =  monster.abilities.find((ability) => ability.id === action?.abilityId)

    // We then compare the agility stat of both character and monster
    const userStats = user.stats
    const monsterStats = monster.stats

    // Whoever has higher agility goes first in turn
    if (userStats.agility > monsterStats.agility) {
        // user goes first
        // for now we work on damage abilities only
        // figure out self targeting abilities later

        // add rng to this
        const playerRNG = createRNG(battleState.id)
        const newMonsterHP = monsterStats.currentHP - (ability?.damage || 0)

        if (newMonsterHP <= 0) {
            // create function to give user xp based on user level and monster level
            return wonBattleState(battleState)
        }
        const monsterRNG = createRNG(battleState.id)
        // get AI ability
        const monsterAction = selectMonsterAction(battleState, monsterRNG)


    }    
    // make function to find monster ebility using action.abilityId
    // const message = `${monster.name} has used ${ability}`
}