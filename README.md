**Project Overview**

HabitRPG is a gamified self-improvement platform designed to help users build and track habits, complete tasks, and grow through an RPG-style system. The project blends task management, reward systems, and RPG progression to motivate consistent personal growth.

🔗 **Live Demo**: https://habit-rpg.vercel.app/

**Core Features (Implemented)**

- **Task Management**: Create daily, weekly, and custom recurring tasks with RRULE support. Full calendar integration for scheduling and date navigation.
- **Rollover System**: Timezone-aware daily reset at user-defined times. Automated streak checking via cron jobs.
- **Streaks & Rewards**: Completing tasks increases streaks, which multiply rewards. Streak bonuses cap at 50% (7+ day streaks).
- **Leveling System**: Progressive XP scaling system - linear growth for early levels (1-10), quadratic for mid levels (11-25), and exponential for high levels (26+).
- **Stats & Inventory**: Track RPG stats including gold, mana, health, level, and XP. Visual progress bars with 8bit retro aesthetic.
- **Reward System**: Difficulty-based multipliers (Easy: 5x, Medium: 8x, Hard: 10x) combined with streak multipliers for gold, XP, and mana rewards.
- **Battle System Foundation**: Turn-based combat engine with:
  - Ability system with mana costs, cooldowns, and damage formulas
  - Status effects (burn, poison, shield, stun, regeneration)
  - Critical hit mechanics (10% base chance, 1.5x damage)
  - Dodge system with agility-based scaling
  - Monster AI for enemy actions
  - Multiple monsters defined (goblin, orc, skeleton, dragon, boss_skeleton_king)
- **User Settings**: Configure rollover times, timezone preferences, and personal preferences.
- **Automated Systems**: Cron job endpoint for automated streak checking and reset when deadlines are missed.

**Planned Features**

- **AI-Driven Classes & Skills System**: Users unlock skills and classes based on habits, powered by AI recommendations. Foundation types and engine exist.
- **User Collaboration**: Users can form parties and join guilds to track progress together, encourage accountability, and complete group challenges.
- **Boss Battles**: Parties can challenge powerful "bosses" where each member's skills and passives contribute to the fight. Success requires teamwork and consistent habit completion, and victory unlocks unique rewards.

**Technical Stack**

- **Frontend**: Next.js 15.3.5 (React 19), TailwindCSS 4, ShadCN/UI components
- **Backend**: Supabase (PostgreSQL database, real-time subscriptions)
- **Auth**: Clerk for authentication and user management
- **Timezone Handling**: Luxon for safe timezone conversions
- **Calendar**: FullCalendar for task scheduling and date navigation
- **Icons**: Lucide React
- **Date Utilities**: date-fns, rrule for recurring task patterns
- **Deployment**: Vercel (frontend), Docker for dev environment

**Architecture Highlights**

- **Custom Hooks Pattern**: Encapsulated data fetching, state management, and error handling with race condition prevention
- **Timezone-Aware Operations**: All date/time operations respect user's local timezone
- **Deterministic Battle Engine**: Seeded RNG for reproducible combat, pure engine functions with IO in adapters
- **Progressive Reward Scaling**: Balanced progression system that maintains engagement across all levels
- **Component Architecture**: Modular design with reusable UI components, custom 8bit theme components, and clear separation of concerns

**Real-World Problem Solved**

This project addresses the problem of **habit consistency and personal growth**. Many people struggle with motivation to maintain daily habits. By turning habit-building into a role-playing game, the app makes personal development engaging, rewarding, and trackable. The gamification elements (streaks, levels, rewards, and upcoming battle system) provide extrinsic motivation while building intrinsic habit formation.

<img width="997" height="1084" alt="image" src="https://github.com/user-attachments/assets/cf173e52-d79d-4db5-88b1-0aa33dbe7a72" />

