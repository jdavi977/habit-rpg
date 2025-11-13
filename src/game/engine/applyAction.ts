import { CRITICAL_HIT_DAMAGE_MULTIPLIER } from "../constants";
import { Action, BattleState } from "../types";
import { selectMonsterAction } from "./ai";
import { continueBattleState, wonBattleState } from "./battleState";
import { calculateDodgeBaseline } from "./dodge";
import { createRNG } from "./rng";

export function applyAction(
  battleState: BattleState,
  action?: Action,
  dodgeChance?: boolean
): BattleState {
  if (action?.type === "endTurn") {
    return continueBattleState(battleState);
  }

  const target = action?.targetId;
  const user = battleState?.player;
  const monster = battleState?.enemy;

  // make function to find player ability using action.abilityId
  const ability = user.class.abilities.find(
    (ability) => ability.id === action?.abilityId
  );
  // use function to get AI action next
  //const monsterAbility =  monster.abilities.find((ability) => ability.id === action?.abilityId)

  // We then compare the agility stat of both character and monster
  const userStats = user.stats;
  const monsterStats = monster.stats;

  // Whoever has higher agility goes first in turn
  if (userStats.agility > monsterStats.agility) {
    // user goes first
    // for now we work on damage abilities only
    // figure out self targeting abilities later

    const rng = createRNG(battleState.id);
    // abilities could have multiple effects
    // find baselines for both ability effects
    let monsterHP = monsterStats.currentHP;
    
    // player's turn
    if (rng() > calculateDodgeBaseline(monster)) {
      console.log(`${monster.name} has dodged the attack`);
    } else {
      if (rng() > CRITICAL_HIT_DAMAGE_MULTIPLIER) {
        monsterHP =
          monsterStats.currentHP -
          (ability?.damage || 0) * CRITICAL_HIT_DAMAGE_MULTIPLIER;
      } else {
        monsterHP = monsterStats.currentHP - (ability?.damage || 0);
      }
      if (monsterHP <= 0) {
        // create function to give user xp based on user level and monster level
        return wonBattleState(battleState);
      }
      // work on effects later
      // if (ability?.effects && action?.targetId === "enemy") {
      //     for (let i = 0; i < ability?.effects.length; i++) {
      //         if (playerRNG() > (ability.effects[i].baseline)) {
      //             // make a function that will take the status effect and apply it on target
      //         } else {
      //             console.log("")
      //         }
      //     }
      // }
    }
    // AI's turn
    const monsterAction = selectMonsterAction(battleState, rng);
    

    // if monster action is an attack, we first check users agility and
    // determine a baseline which determines if the user has the ability to dodge.
    // if rng is > than baseline, the user gets a dodge opportunity.
  }

  // make function to find monster ebility using action.abilityId
  // const message = `${monster.name} has used ${ability}`
}
