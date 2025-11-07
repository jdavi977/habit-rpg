<!-- a0b83c6d-5de4-45b8-bece-02b85e8cb3fd c0196071-e032-4d46-8417-95ce8b6cd4ac -->
# RPG Conversion Plan (Pokemon-Style Combat + AI Class/Ability Generation)

## Phase 0 — Foundations (domain, engine, data)

- Create domain types and schemas
  - Files: `src/game/types.ts`, `src/game/constants.ts`
  - Entities: Character, Class, StatBlock, StatusEffect, Ability, Monster, Encounter, Battle, Turn, Action
  - Ability schema: `{ id, name, description, cost: energy, cooldown, damage, effects: StatusEffect[] }`
- Pokemon-style deterministic combat engine
  - Files: `src/game/engine/battleState.ts`, `src/game/engine/applyAction.ts`, `src/game/engine/ai.ts`, `src/game/engine/rng.ts`
  - Turn-based: player picks 1 of 4 abilities per turn, monster uses AI-selected action
  - Energy system: abilities cost energy (e.g., 0-3), regen per turn
  - Cooldowns: track per-ability turn counters, show UI indicators
  - Status effects: buffs/debuffs (Burn, Poison, Shield, etc.) with duration/stacks
- Content pipeline (AI-generated + JSON fallbacks)
  - Files: `src/game/content/monsters/*.json`, `src/game/content/baseClasses.json` (template for AI)
  - Loader: `src/game/content/index.ts` (validate with zod)
  - AI-generated classes stored in DB, not static files
- Persistence models and migrations
  - Tables: `characters`, `classes` (AI-generated), `abilities` (4 per class), `battles`, `battle_logs`
  - Integrate with existing `src/lib/db.ts` accessors
  - Link characters to task logs for stats/progression

## Phase 1 — Task-Driven Character Creation & Single-Player Combat

- Task Aggregation Service
  - Files: `src/lib/game/taskAggregator.ts`
  - Query recent task logs from `task` and `task_completions` tables
  - Extract: categories (from task titles/descriptions), streaks, completion rates, difficulty distribution
  - Output structured data for AI recommender
- AI Class Recommender Service
  - Files: `src/app/api/game/ai/recommend-class/route.ts`, `src/lib/game/aiClassRecommender.ts`
  - Input: aggregated task logs (categories, streaks, completion rates, difficulty patterns)
  - Output: 3 class recommendations, each with: name, description, 4 abilities (name, description, cost, cooldown, damage formula, status effects)
  - Model: LLM API (OpenAI/Anthropic) with structured prompt + zod output validation
  - Fallback: rule-based class mapping if AI fails
- Task → Stats Mapping System
  - Files: `src/lib/game/taskToStats.ts`
  - Consistency (streaks) → Stamina/HP max
  - Intensity/difficulty → Attack power
  - Duration → Defense/Resilience
  - Category mix → Elemental affinities/resistances
  - Update stats on task completion via hooks
- Character creation and class selection UI
  - Files: `src/app/game/character/page.tsx`, `src/components/game/CharacterCreate.tsx`, `src/components/game/ClassSelector.tsx`
  - Show 3 AI-recommended classes with preview of 4 abilities each
  - Allow selection, then persist character with chosen class + abilities
- Pokemon-style battle screen
  - Files: `src/app/game/battle/[battleId]/page.tsx`, `src/components/game/BattleView.tsx`
  - UI: Player stats (HP/Energy), 4 ability buttons with costs/cooldowns, enemy stats/intent, status effect icons
  - Engine adapter: `src/game/engine/adapters/singleplayer.ts`
- Simple monster AI + encounters
  - Files: `src/game/encounters/generateEncounter.ts`, extend `ai.ts`
  - Monster picks action based on state (low HP = heal, high HP = attack)
- Save/load battles and progression
  - API routes: `src/app/api/game/battles/*`, `src/app/api/game/characters/*`
  - Record action log for replay: `[turn, actorId, abilityId, targetId, stateHashBefore]`

## Phase 2 — Progression and Content

- XP, levels, and stat growth (driven by task completion)
  - Files: `src/game/progression/leveling.ts`, `src/game/progression/taskToXP.ts`
  - On task completion: grant XP, update stats based on task type
  - Level milestones: unlock new monsters, areas, or ability upgrades
- Ability upgrades and progression
  - Files: `src/game/progression/abilityUpgrades.ts`
  - Level thresholds: unlock ability variants or stat boosts
  - AI can suggest upgrades based on playstyle (optional)
- Monster/boss content and encounter variety
  - Files: `src/game/content/monsters/*.json`
  - Expand with elites, bosses, status-heavy encounters
- Optional: shops/items (consumables, stat boosters)
  - Files: `src/game/economy/*`, `src/components/game/ShopView.tsx`
  - Currency earned from battles, spent on potions/gear

## Phase 3 — Small-Party Co-op (Lightweight Relay)

- Networking model: room-based relay over WebSockets
  - Server: `src/app/api/realtime/route.ts` (WS), `src/server/rooms/RoomManager.ts`
  - Protocol: actions only (useAbility, endTurn), server rebroadcasts; clients simulate
- Lockstep determinism
  - Shared seed, per-turn action ordering (player → monster → player → monster)
  - Reconciliation on desync; ability to resync from authoritative action log
- Party management & matchmaking (2-3 players vs AI monsters)
  - Files: `src/app/game/party/page.tsx`, `src/app/api/game/party/*`
  - Turn order: all players act, then all monsters
- Minimal anti-cheat
  - Server validates action legality (ability exists, cooldown OK, energy sufficient)
  - Periodic state hash checksums in protocol

## Phase 4 — Polish and Integrations

- Onboarding/tutorial, SFX/animations, mobile/responsive
- Link tasks → in-game rewards (existing task completion already gives gold/exp/mana)
  - Bridge battle rewards to task motivation system
- Telemetry and balancing dashboards

## Key Implementation Notes

- Engine purity: no IO in `src/game/engine/*`; all IO in adapters/APIs
- Seeded RNG: `rng(seed)` generates reproducible combat; store `battle.seed`
- Ability schema (AI-generated, stored in DB):
```typescript
{
  id: string;
  name: string;
  description: string;
  energyCost: number; // 0-3
  cooldown: number; // turns before reuse
  damage: number | { formula: string }; // e.g., "baseDamage + ATK * 1.2"
  effects: Array<{
    type: "damage" | "heal" | "applyStatus" | "buff";
    status?: "burn" | "poison" | "shield" | etc.;
    stacks?: number;
    duration?: number;
  }>;
}
```

- Action log: `[turn, actorId, abilityId, targetId, stateHashBefore]` persisted for replay
- Task aggregation for AI: query recent N tasks, compute streaks, category distribution, completion rate, average difficulty
- Level milestone trigger: when user reaches level X (e.g., 5 or 10), trigger class recommendation flow

## Milestones

1. AI class recommender + character creation → 1 Pokemon-style battle (2-3 weeks)
2. Task→stats mapping + progression system (1-2 weeks)
3. Co-op battle with 2 players vs AI, stable lockstep (2-3 weeks)
4. Polish, content expansion, and optional features (ongoing)

### To-dos

- [ ] Define game types and build deterministic engine core
- [ ] Implement content loader/validation and seed initial cards/monsters
- [ ] Create character, deck, and battle UIs for single-player
- [ ] Add API routes and persistence for runs, battles, and logs
- [ ] Implement XP, unlocks, loot and shops
- [ ] Add WebSocket relay rooms and protocol for co-op lockstep
- [ ] Validate actions on server with state hashes
- [ ] Implement party creation/join and matchmaking UI
- [ ] Add tutorial, animations, and optional tasks→rewards bridge