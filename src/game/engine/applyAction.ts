import {
  BASE_CRITICAL_HIT_CHANCE,
  CRITICAL_HIT_DAMAGE_MULTIPLIER,
  DODGED_ATTACK,
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
): BattleState {
  if (action.type === "endTurn" || !action.targetId) {
    return continueBattleState(battleState);
  }

  const current = action.current;
  const target = action.targetId;

  const player = battleState.player;
  const monster = battleState.enemy;

  let damage;

  const rng = createRNG(battleState.id);

  if (current === "player") {
    const playerAbility = player.class.abilities.find(
      (ability) => ability.id === action.abilityId
    );

    if (!playerAbility || playerAbility.cooldown > 0 || playerAbility.manaCost > player.stats.currentMana) {
      console.log(`${player.name} is unable to cast ${playerAbility?.name}`)
      return continueBattleState(battleState);
    } else {
      damage = abilityAction(
        current,
        target,
        playerAbility,
        player,
        monster,
        battleState,
        rng
      )

      const newHp = battleState.enemy.stats.currentHP - damage
      const newMana = battleState.player.stats.currentMana - playerAbility.manaCost;

      if (newHp <= 0) {
        return wonBattleState(battleState);
      } else {
      return {                 // TODO: update cool down
        ...battleState,
        enemy: {
          ...battleState.enemy,
          stats: {
            ...battleState.enemy.stats,
            currentHP: newHp,
            currentMana: newMana
          }
        }
      }
    }
    };
  } else {
    const monsterAction = selectMonsterAction(battleState, rng);
    const monsterAbility = monster.abilities.find(
      (ability) => ability.id === monsterAction.abilityId
    );
    if (!monsterAbility) {
      return continueBattleState(battleState);
    } else {
      damage = abilityAction(
        current,
        target,
        monsterAbility,
        player,
        monster,
        battleState,
        rng
      )

      const newHp = battleState.player.stats.currentHP - damage
      const newMana = battleState.enemy.stats.currentMana - monsterAbility.manaCost;

      if (newHp <= 0 ) {
        return lostBattleState(battleState)
      } else {                 // TODO: update cool down
          return {
            ...battleState,
            player: {
              ...battleState.player,
              stats: {
                ...battleState.player.stats,
                currentHP: newHp,
                currentMana: newMana
              }
            }
          } 
        }
    };
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
): number {
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
    // Makes sure player does not dodge own ability
    if (target === player && targeting !== current) {
      // DODGE OPPORTUNITY
    } else if (target === monster && targeting !== current){
      console.log(`${monster.name} has dodged the attack!`)
      return DODGED_ATTACK;
    }
  } else {
    // targeting self
    if (current === targeting) {
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
  return targetHP;
}
