import { ActiveCharacter, BattleState, Monster } from "../types";
import { generateBattleId } from "./utils";

export function createBattleState(player: ActiveCharacter, enemy: Monster): BattleState {
    const battleSeed = generateBattleId;
    return {
        id: battleSeed(),
        status: "active",
        turn: 1,
        player: {...player },
        enemy: {...enemy },
    }
}

export function continueBattleState(state: BattleState): BattleState {
    return {
        ... state,
        turn: state.turn + 1
    }
}

export function wonBattleState(state: BattleState): BattleState {
    return {
        ... state,
        status: "won"
    }
}

export function lostBattleState(state: BattleState): BattleState {
    return {
        ... state,
        status: "lost"
    }
}