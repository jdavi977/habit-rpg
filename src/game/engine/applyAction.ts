import {
  BASE_CRITICAL_HIT_CHANCE,
  CRITICAL_HIT_DAMAGE_MULTIPLIER,
} from "../constants";
import {
  Ability,
  Action,
  ActiveCharacter,
  BattleState,
  Monster,
} from "../types";
import { selectMonsterAction } from "./ai";
import {
  continueBattleState,
  lostBattleState,
  wonBattleState,
} from "./battleState";
import { calculateDodgeBaseline } from "./dodge";
import { createRNG, RNG } from "./rng";

export function applyAction(
  battleState: BattleState,
  action: Action,
  dodgeChance?: boolean
): BattleState {
  if (action.type === "endTurn") {
    return continueBattleState(battleState);
  }

  const target = action?.targetId;
  const player = battleState?.player;
  const monster = battleState?.enemy;

  let playerHP;
  let monsterHP;

  // make function to find player ability using action.abilityId
  const playerAbility = player.class.abilities.find(
    (ability) => ability.id === action.abilityId
  );

  // makes sure that there is an ability found else we pass turn
  if (!playerAbility || !target) {
    return continueBattleState(battleState);
  }

  const playerStats = player.stats;
  const monsterStats = monster.stats;
  const rng = createRNG(battleState.id);

  // Whoever has higher agility goes first in turn
  if (playerStats.agility > monsterStats.agility) {
    monsterHP = abilityAction(
      "player",
      target,
      playerAbility,
      player,
      monster,
      battleState,
      rng
    );
    //   // if monster action is an attack, we first check users agility and
    //   // determine a baseline which determines if the user has the ability to dodge.
    //   // if rng is > than baseline, the user gets a dodge opportunity.
  } else {
    const monsterAction = selectMonsterAction(battleState, rng);
    const monsterAbility = monster.abilities.find(
      (ability) => ability.id === monsterAction.abilityId
    );
    if (!monsterAbility) {
      return continueBattleState(battleState);
    }
    playerHP = abilityAction(
      "monster",
      target,
      monsterAbility,
      player,
      monster,
      battleState,
      rng
    );
  }
}

function abilityAction(
  current: string,
  targeting: string,
  ability: Ability,
  player: ActiveCharacter,
  monster: Monster,
  battleState: BattleState,
  rng: RNG
) {
  let self;
  let target;

  if (current === "player") {
    self = player;
    target = monster;
  } else {
    self = monster;
    target = player;
  }

  let targetHP = target.stats.currentHP;

  if (rng() > calculateDodgeBaseline(target)) {
    if (target === player) {
      // DODGE OPPORTUNITY
    } else {
      // MONSTER DODGES ATTACK
    }
  } else {
    // targeting self
    if (self.entityType === targeting) {
      // apply status self
      // apply heal self
    } 
    // targeting target
    else { 
      // 
      // damage target
      // apply status on target

      // DAMAGE
      if (rng() > BASE_CRITICAL_HIT_CHANCE && ability) {
        // right now we are only workign on damage abilities
        targetHP =
          target.stats.currentHP -
          (ability?.damage || 0) * CRITICAL_HIT_DAMAGE_MULTIPLIER;
      } else {
        targetHP = target.stats.currentHP - (ability?.damage || 0);
      }
    }
  }

  if (targetHP <= 0) {
    if (target === player) {
      return wonBattleState(battleState);
    } else {
      return lostBattleState(battleState);
    }
  }

  return targetHP;
}
