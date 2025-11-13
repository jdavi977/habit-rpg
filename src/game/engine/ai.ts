import { FLOAT_TO_PERCENT } from "../constants";
import { Ability, Action, BattleState } from "../types";
import { RNG } from "./rng";

export function selectMonsterAction(
  battleState: BattleState,
  rng: RNG
): Action {
  const monster = battleState.enemy;

  const monsterCurrentMana = monster.stats.currentMana;

  const availableAbiltiies = monster.abilities.filter(
    (ability) =>
      ability.cooldown === 0 && ability.manaCost <= monsterCurrentMana
  );

  if (availableAbiltiies.length === 0) {
    return {
      type: "endTurn",
    };
  }

  const player = battleState.player;

  const playerHpPercent =
    (player.stats.currentHP / player.stats.maxHP) * FLOAT_TO_PERCENT;
  const monsterHpPercent =
    (monster.stats.currentHP / monster.stats.maxHP) * FLOAT_TO_PERCENT;

  const weightedAbilities = availableAbiltiies.map((ability) => ({
    ability,
    weight: 1.0,
  }));

  let totalAbilityWeight = 0.0;

  for (const item of weightedAbilities) {
    if (
      playerHpPercent < 30 &&
      item.ability.damage &&
      item.ability.damage > 15
    ) {
      item.weight *= 2.5;
    }

    if (
      monsterHpPercent < 30 &&
      item.ability.effects?.some((e) => e.type === "heal" || "shield")
    ) {
      item.weight *= 1.5;
    }

    if (item.ability.manaCost < 3) {
      item.weight *= 2.0;
    }

    if (item.ability.effects?.some((e) => e.type === "applyStatus")) {
      item.weight *= 2.0;
    }
  }

  for (let i = 0; i < weightedAbilities.length; i++) {
    totalAbilityWeight += weightedAbilities[i].weight
  }
  // add up total weight and use rng

  const rngChooser = rng() * totalAbilityWeight
  // find out which ability is chosen using this

  let weightChecker = 0.0;
  let chosenAbility: Ability | undefined;

  for (let i = 0; i < weightedAbilities.length; i++) {
    weightChecker += weightedAbilities[i].weight;
    
    if (weightChecker >= rngChooser) {
      chosenAbility = weightedAbilities[i].ability;
      break; 
    }
  }
  const finalAbility = chosenAbility ?? weightedAbilities[0].ability;
  let target = ""

  if (finalAbility.effects && finalAbility.effects?.some(e => e.status === "shield" || "regeneration")) {
    target = "monster"
  } else {
    target = "player"
  }

  return {
    type: "useAbility",
    abilityId: finalAbility.id,
    targetId: target
  }
}

