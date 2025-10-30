/**
 * @fileoverview Database operations and queries for HabitRPG
 * @module lib/db
 * 
 * This module provides all database interaction functions for the application including:
 * - User stats and profile management (stats, settings, levels)
 * - Task CRUD operations (create, read, update, delete tasks)
 * - Reward distribution (gold, experience, mana)
 * - Streak tracking and management
 * - Task completion tracking
 * - Automated streak checking via cron jobs
 * 
 * All functions require an authenticated Supabase client and use type-safe queries.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { computeRewardMultipliers, totalExpForLevel } from "./reward";
import { doesTaskRepeatOnDate } from "./rruleHelper";
import { shouldStreakBeReset } from "./streakHelper";

/**
 * Calculates reward multipliers for tasks based on difficulty, streak, and level
 * 
 * Wrapper around computeRewardMultipliers that provides consistent reward calculation
 * throughout the database layer. Used by all reward functions to ensure parity.
 * 
 * @param {string} difficulty - Task difficulty ("Easy", "Medium", "Hard")
 * @param {number} streak - Current task completion streak
 * @param {number} level - User's current level (default: 1)
 * @returns {Object} Reward multipliers for gold, exp, mana
 * 
 * @private
 */
const getRewardMultipliers = (
  difficulty: string,
  streak: number,
  level: number = 1
) => {
  return computeRewardMultipliers(difficulty, streak, level);
};

/**
 * Retrieves the user's character statistics (level, gold, exp, mana, etc.)
 * 
 * Fetches all stats for a user including current level, experience points,
 * gold currency, mana, and streak information. Returns null if user has no stats.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @returns {Promise<Object|null>} User stats object or null if not found
 * 
 * @throws {Error} If database query fails
 */
export async function getUserStats(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("user_stats")
    .select()
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Retrieves basic user profile information (email and username)
 * 
 * Fetches public user information from the users table. Used for display
 * purposes throughout the application.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @returns {Promise<Object>} User info with email and username
 * 
 * @throws {Error} If database query fails
 */
export async function getUserInfo(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("users")
    .select("email, username")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Creates a new task for the user
 * 
 * Inserts a new task into the database with specified properties.
 * Supports both one-time tasks and recurring tasks via RRULE string.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @param {string} title - Task title/name
 * @param {string} description - Task description
 * @param {string} difficulty - Task difficulty ("Easy", "Medium", "Hard")
 * @param {string} date - Initial/start date for the task (ISO format)
 * @param {string} repeatOption - RRULE string for recurring tasks, or "DNR" for one-time tasks
 * @returns {Promise<Array>} Inserted task data
 * 
 * @throws {Error} If database insert fails
 * 
 * @example
 * // One-time task
 * await createTask(client, userId, "Buy groceries", "Milk and eggs", "Easy", "2024-01-15", "DNR");
 * 
 * // Recurring daily task
 * await createTask(client, userId, "Morning meditation", "10 minutes", "Medium", "2024-01-15", "FREQ=DAILY");
 */
export async function createTask(
  client: SupabaseClient,
  userId: string,
  title: string,
  description: string,
  difficulty: string,
  date: string,
  repeatOption: string
) {
  const { data, error } = await client.from("task").insert({
    user_id: userId,
    title: title,
    description: description,
    difficulty: difficulty,
    date: date,
    rrule: repeatOption,
  });
  if (error) throw error;
  return data;
}

/**
 * Retrieves task data including difficulty and streak information
 * 
 * Fetches a single task by ID. Used to get task properties needed for
 * reward calculations and task management.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} taskId - Unique identifier for the task
 * @returns {Promise<Object|null>} Task data or null if not found
 * 
 * @throws {Error} If database query fails
 */
export async function getTaskData(client: SupabaseClient, taskId: string) {
  const { data, error } = await client
    .from("task")
    .select()
    .eq("id", parseInt(taskId))
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Permanently deletes a task from the database
 * 
 * Removes a task and all associated data. This operation cannot be undone.
 * Does not affect task completion history.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} taskId - Unique identifier for the task to delete
 * @returns {Promise<Object>} Result of the delete operation
 * 
 * @throws {Error} If database delete fails
 */
export async function removeTaskDb(client: SupabaseClient, taskId: string) {
  return client.from("task").delete().eq("id", parseInt(taskId));
}

/**
 * Awards gold reward to the user for completing a task
 * 
 * Calculates and applies gold reward based on task difficulty and streak.
 * Higher difficulty and longer streaks result in more gold earned.
 * Gold can accumulate infinitely (no cap).
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @param {string} difficulty - Task difficulty ("Easy", "Medium", "Hard")
 * @param {number} streak - Current task completion streak
 * @param {number} gold - Current gold balance
 * @returns {Promise<Object>} Updated user stats with new gold amount
 * 
 * @throws {Error} If database update fails
 */
export async function goldReward(
  client: SupabaseClient,
  userId: string,
  difficulty: string,
  streak: number,
  gold: number
) {
  const multipliers = getRewardMultipliers(difficulty, streak, 1); // Gold doesn't use level multiplier

  const increase = multipliers.gold;
  const newGold = gold + increase;

  return client
    .from("user_stats")
    .update({ gold: newGold })
    .eq("user_id", userId)
    .select()
    .single();
}

export async function healthDeduction(
  client: SupabaseClient,
  userId: string,
  currentHealth: number
) {
  const health = Math.max(currentHealth - 15, 0);

  return client
    .from("user_stats")
    .update({ health: health })
    .eq("user_id", userId)
    .select()
    .single();
}

/**
 * Reverses a gold reward (used when undoing task completion)
 * 
 * Deducts the gold that was previously awarded. Ensures gold never
 * goes below zero. Used when users undo or uncomplete a task.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @param {string} difficulty - Task difficulty (to calculate original reward)
 * @param {number} streak - Task streak at time of completion
 * @param {number} gold - Current gold balance
 * @returns {Promise<Object>} Updated user stats with reduced gold amount
 * 
 * @throws {Error} If database update fails
 */
export async function undoGoldReward(
  client: SupabaseClient,
  userId: string,
  difficulty: string,
  streak: number,
  gold: number
) {
  if (gold === null || gold === undefined) {
    console.error("Gold is null or undefined, cannot undo reward");
    return;
  }

  const multipliers = getRewardMultipliers(difficulty, streak, 1); // Gold doesn't use level multiplier

  const deduction = multipliers.gold;
  const newGold = Math.max(gold - deduction, 0);

  return client
    .from("user_stats")
    .update({ gold: newGold })
    .eq("user_id", userId)
    .select()
    .single();
}

/**
 * Awards mana reward to the user for completing a task (capped at maximum mana)
 * 
 * Mana has a maximum cap (total_mana). Rewards are calculated but won't exceed
 * this cap. Returns the actual amount gained to support undo operations.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @param {string} difficulty - Task difficulty ("Easy", "Medium", "Hard")
 * @param {number} streak - Current task completion streak
 * @param {number} mana - Current mana value
 * @param {number} total_mana - Maximum mana capacity
 * @returns {Promise<Object>} Object with actualIncrease property showing mana gained
 * 
 * @throws {Error} If database update fails
 */
export async function manaReward(
  client: SupabaseClient,
  userId: string,
  difficulty: string,
  streak: number,
  mana: number,
  total_mana: number
) {
  const multipliers = getRewardMultipliers(difficulty, streak, 1); // Mana doesn't use level multiplier

  const increase = multipliers.mana;
  const newMana = addWithCap(mana, increase, total_mana);

  await client
    .from("user_stats")
    .update({ mana: newMana.cappedValue })
    .eq("user_id", userId)
    .select()
    .single();

  return {
    actualIncrease: newMana.actualGain,
  };
}

/**
 * Adds value to current amount while respecting a maximum cap
 * 
 * Helper function for mana rewards that calculates the actual gain when
 * there's a maximum limit. Returns both the capped value and actual gain.
 * 
 * @param {number} current - Current value
 * @param {number} addition - Amount to add
 * @param {number} cap - Maximum allowed value
 * @returns {Object} Object with cappedValue, excessValue, and actualGain
 * 
 * @private
 */
const addWithCap = (current: number, addition: number, cap: number) => {
  const newValue = current + addition;
  const cappedValue = Math.min(newValue, cap);
  const excessValue = newValue - cappedValue;
  const actualGain = cappedValue - current;

  return { cappedValue, excessValue, actualGain };
};

/**
 * Reverses a mana reward by deducting the actual amount gained
 * 
 * Deducts the exact amount of mana that was actually gained (accounting for cap).
 * Prevents mana from going negative.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @param {number} mana - Current mana value
 * @param {number} actualIncrease - Amount of mana actually gained (from manaReward)
 * @returns {Promise<Object>} Updated user stats with reduced mana
 * 
 * @throws {Error} If database update fails
 */
export async function undoManaReward(
  client: SupabaseClient,
  userId: string,
  mana: number,
  actualIncrease: number
) {
  if (mana === null || mana === undefined) {
    console.error("Mana is null or undefined, cannot undo reward");
    return;
  }
  return client
    .from("user_stats")
    .update({ mana: mana - actualIncrease })
    .eq("user_id", userId)
    .select()
    .single();
}

/**
 * Awards experience points for completing a task
 * 
 * Awards XP and automatically levels up the user if they've exceeded
 * the required experience for their current level. Excess XP carries
 * over to the next level. Uses level in calculation for consistency.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @param {string} difficulty - Task difficulty ("Easy", "Medium", "Hard")
 * @param {number} streak - Current task completion streak
 * @param {number} exp - Current experience points
 * @param {number} totalExp - Total experience required for current level
 * @param {number} level - Current user level
 * @returns {Promise<Object>} Updated user stats with new experience
 * 
 * @throws {Error} If database update fails
 */
export async function expReward(
  client: SupabaseClient,
  userId: string,
  difficulty: string,
  streak: number,
  exp: number,
  totalExp: number,
  level: number
) {
  const multipliers = getRewardMultipliers(difficulty, streak, level);

  const increase = multipliers.exp;
  let newExp = exp + increase;
  if (newExp > totalExp) {
    await increaseLevel(client, userId, level);
    newExp = newExp - totalExp;
  }

  return client
    .from("user_stats")
    .update({ exp: newExp })
    .eq("user_id", userId)
    .select()
    .single();
}

/**
 * Levels up the user to the next level
 * 
 * Increases user level by 1 and calculates the new total experience
 * requirement for the next level. Called automatically when expReward
 * detects sufficient experience gained.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @param {number} level - Current level to increase from
 * @returns {Promise<Object>} Updated user stats with new level and total_exp
 * 
 * @throws {Error} If database update fails
 */
export async function increaseLevel(
  client: SupabaseClient,
  userId: string,
  level: number
) {
  const newLevel = level + 1;
  const newTotalExp = totalExpForLevel(newLevel);

  // update level and total_exp
  return client
    .from("user_stats")
    .update({
      level: newLevel,
      total_exp: newTotalExp,
    })
    .eq("user_id", userId)
    .select()
    .single();
}

/**
 * Decreases the user's level by one
 * 
 * Reduces user level (minimum level is 1). Recalculates total experience
 * requirement for the new level. Used when undoing experience rewards
 * that cause level-ups.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @param {number} level - Current level to decrease from
 * @returns {Promise<Object>} Updated user stats with decreased level
 * 
 * @throws {Error} If database update fails
 */
export async function decreaseLevel(
  client: SupabaseClient,
  userId: string,
  level: number
) {
  const newLevel = Math.max(level - 1, 1); // Ensure level doesn't go below 1
  const newTotalExp = totalExpForLevel(newLevel);

  // update level and total_exp
  return client
    .from("user_stats")
    .update({
      level: newLevel,
      total_exp: newTotalExp,
    })
    .eq("user_id", userId)
    .select()
    .single();
}

/**
 * Reverses an experience reward (supports level-down on rollback)
 * 
 * Deducts experience points. If deduction would make exp negative,
 * decreases the user's level and calculates the new exp from the lower level.
 * Used when users undo task completion.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @param {string} difficulty - Task difficulty (to calculate original reward)
 * @param {number} streak - Task streak at time of completion
 * @param {number} exp - Current experience points
 * @param {number} level - Current user level
 * @returns {Promise<Object>} Updated user stats with reduced experience
 * 
 * @throws {Error} If database update fails
 */
export async function undoExpReward(
  client: SupabaseClient,
  userId: string,
  difficulty: string,
  streak: number,
  exp: number,
  level: number
) {
  if (exp === null || exp === undefined) {
    console.error("Exp is null or undefined, cannot undo reward");
    return;
  }

  const multipliers = getRewardMultipliers(difficulty, streak, level);

  const deduction = multipliers.exp;
  let newExp = exp - deduction;
  if (newExp < 0) {
    await decreaseLevel(client, userId, level);
    const stats = await getUserStats(client, userId);
    newExp = stats.total_exp + newExp; // newExp is negative, so we add it
  }

  return client
    .from("user_stats")
    .update({ exp: newExp })
    .eq("user_id", userId)
    .select()
    .single();
}

/**
 * Increases the completion streak for a task
 * 
 * Increments the streak counter when a task is completed. If the completion
 * is consecutive (on the expected date), streak increases. If non-consecutive,
 * streak resets to 1. Used when completing tasks.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} taskId - Unique identifier for the task
 * @param {number} currentStreak - Current streak count
 * @param {boolean} isConsecutive - Whether completion is on consecutive days (default: true)
 * @returns {Promise<Object>} Updated task with new streak
 * 
 * @throws {Error} If database update fails
 */
export async function increaseStreak(
  client: SupabaseClient,
  taskId: string,
  currentStreak: number,
  isConsecutive: boolean = true
) {
  let newStreak: number;

  if (isConsecutive) {
    newStreak = (currentStreak ?? 0) + 1;
  } else {
    newStreak = 1;
  }

  return client
    .from("task")
    .update({ streak: newStreak })
    .eq("id", parseInt(taskId))
    .select()
    .single();
}

/**
 * Decreases the completion streak for a task
 * 
 * Reduces streak by 1. Used when undoing task completion to reverse
 * the streak increase. Streak can go negative in edge cases.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} taskId - Unique identifier for the task
 * @param {number} currentStreak - Current streak count
 * @returns {Promise<Object>} Updated task with decreased streak
 * 
 * @throws {Error} If database update fails
 */
export async function decreaseStreak(
  client: SupabaseClient,
  taskId: string,
  currentStreak: number
) {
  const newStreak = currentStreak - 1;

  return client
    .from("task")
    .update({ streak: newStreak })
    .eq("id", parseInt(taskId))
    .select()
    .single();
}

/**
 * Resets a task's streak to 0 and logs the history
 * 
 * Used by the cron job to reset streaks when users miss deadlines.
 * Records the previous streak value and reason in streak_history for analytics.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @param {string} taskId - Unique identifier for the task
 * @param {number} currentStreak - Current streak count before reset
 * @param {string} reason - Reason for reset (default: "missed_deadline")
 * @returns {Promise<Object>} Success indicator
 * 
 * @throws {Error} If streak reset fails
 */
export async function resetTaskStreak(
  client: SupabaseClient,
  userId: string,
  taskId: string,
  currentStreak: number,
  reason: string = "missed_deadline"
) {
  const { error: streakError } = await client
    .from("task")
    .update({ streak: 0 })
    .eq("id", parseInt(taskId));
  if (streakError) throw streakError;

  const { error: historyError } = await client
    .from("streak_history")
    .insert({
      user_id: userId,
      task_id: parseInt(taskId),
      streak_value: currentStreak,
      reason: reason,
    });
  if (historyError) {
    console.warn("Failed to log streak history:", historyError);
  }

  return { success: true };
}

/**
 * Retrieves all completion dates for a task (for streak checking)
 * 
 * Fetches all dates when a task was completed, ordered chronologically.
 * Used by the cron job to determine if streaks should be reset.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @param {string} taskId - Unique identifier for the task
 * @returns {Promise<string[]>} Array of completion dates (ISO format)
 * 
 * @throws {Error} If database query fails
 */
export async function getTaskCompletionDates(
  client: SupabaseClient,
  userId: string,
  taskId: string
): Promise<string[]> {
  const { data, error } = await client
    .from("task_completions")
    .select()
    .eq("user_id", userId)
    .eq("task_id", parseInt(taskId))
    .order("date", { ascending: true });

  if (error) throw error;
  return data?.map((completion) => completion.date || []);
}

/**
 * Gets the most recent completion date for a task
 * 
 * Returns the last date when the task was completed. Used to check
 * if a task has been completed and when it was last completed.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @param {string} taskId - Unique identifier for the task
 * @returns {Promise<string|null>} Most recent completion date or null
 * 
 * @throws {Error} If database query fails
 */
export async function getLastCompletionDate(
  client: SupabaseClient,
  userId: string,
  taskId: string
): Promise<string | null> {
  const { data, error } = await client
    .from("task_completions")
    .select("date")
    .eq("user_id", userId)
    .eq("id", parseInt(taskId))
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.date || null;
}

/**
 * Checks if a task was completed on a specific date
 * 
 * Verifies whether a task has a completion entry for the given date.
 * Used to prevent duplicate completions and check completion status.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @param {number} taskId - Unique identifier for the task
 * @param {string} date - Date to check (ISO format)
 * @returns {Promise<boolean>} True if task is completed on date, false otherwise
 * 
 * @throws {Error} If database query fails
 */
export async function dailyTaskCheck(
  client: SupabaseClient,
  userId: string,
  taskId: number,
  date: string
) {
  const { count } = await client
    .from("task_completions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("task_id", taskId)
    .eq("date", date);

  const completed = (count ?? 0) > 0;
  return completed;
}

/**
 * Records a task completion with mana reward tracking
 * 
 * Creates or updates a completion entry for a task on a specific date.
 * Upsert prevents duplicate entries (idempotent). Stores mana_increase
 * for tracking the reward amount given.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @param {number} taskId - Unique identifier for the task
 * @param {string} date - Completion date (ISO format)
 * @param {number} manaIncrease - Amount of mana awarded for completion
 * @returns {Promise<Object>} Upsert operation result
 * 
 * @throws {Error} If database upsert fails
 */
export async function dailyCompletion(
  client: SupabaseClient,
  userId: string,
  taskId: number,
  date: string,
  manaIncrease: number
) {
  return client.from("task_completions").upsert(
    [
      {
        user_id: userId,
        task_id: taskId,
        date: date,
        mana_increase: manaIncrease,
      },
    ],
    { onConflict: "user_id, task_id, date", ignoreDuplicates: true }
  );
}

/**
 * Retrieves completion data for a specific task on a specific date
 * 
 * Gets the completion record including mana_increase for undo operations.
 * Returns the completion entry if it exists, null otherwise.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @param {number} taskId - Unique identifier for the task
 * @param {string} date - Completion date to query
 * @returns {Promise<Object|null>} Completion data or null
 * 
 * @throws {Error} If database query fails
 */
export async function getTaskCompletionData(
  client: SupabaseClient,
  userId: string,
  taskId: number,
  date: string
) {
  const { data, error } = await client
    .from("task_completions")
    .select()
    .eq("user_id", userId)
    .eq("task_id", taskId)
    .eq("date", date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Gets all tasks that should appear on a specific date
 * 
 * Fetches all user tasks and filters them to those that should be active
 * on the given date. Handles both one-time tasks (DNR) and recurring tasks (RRULE).
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @param {string} date - Target date to get tasks for (ISO format)
 * @returns {Promise<Array>} Array of tasks active on the specified date
 * 
 * @throws {Error} If database query fails
 */
export async function getSelectedDayTasks(
  client: SupabaseClient,
  userId: string,
  date: string
) {
  const { data, error } = await client
    .from("task")
    .select()
    .eq("user_id", userId);
  if (error) throw error;
  if (!data) return [];

  return data.filter((task) => {
    if (!task.rrule || task.rrule === "DNR") {
      return task.date === date;
    }
    return doesTaskRepeatOnDate(task.rrule, task.date, date);
  });
}

/**
 * Checks if a user exists in the database
 * 
 * Verifies user registration in the users table. Used for validation
 * before performing operations on user data.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @returns {Promise<Object|null>} User data if exists, null otherwise
 * 
 * @throws {Error} If database query fails
 */
export async function checkUserExists(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Saves user's timezone and daily rollover time settings
 * 
 * Updates user settings including timezone and the time when daily
 * tasks should reset (e.g., "09:00" in their local timezone).
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} tz - Timezone identifier (e.g., "America/New_York")
 * @param {string} userId - Unique identifier for the user
 * @param {string} rolloverTime - Daily reset time (HH:MM format)
 * @returns {Promise<Object>} Updated user settings
 * 
 * @throws {Error} If database update fails
 */
export async function saveUserRollover(
  client: SupabaseClient,
  tz: string,
  userId: string,
  rolloverTime: string
) {
  return client
    .from("user_settings")
    .update({
      tz: tz,
      rollover_time: rolloverTime,
    })
    .eq("user_id", userId)
    .select()
    .single();
}

/**
 * Retrieves all user settings including timezone and rollover time
 * 
 * Fetches user preferences for daily reset timing and timezone.
 * Used to determine when daily tasks should be reset for each user.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @returns {Promise<Object|null>} User settings object or null if not configured
 * 
 * @throws {Error} If database query fails
 */
export async function getUserSettings(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("user_settings")
    .select()
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Deletes a task completion entry (undo completion)
 * 
 * Removes a specific completion from the task_completions table.
 * Used when users undo a task completion to restore the previous state.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @param {number} taskId - Unique identifier for the task
 * @param {string} date - Date of completion to delete
 * @returns {Promise<Array>} Deleted data
 * 
 * @throws {Error} If database delete fails
 */
export async function deleteTaskCompleted(
  client: SupabaseClient,
  userId: string,
  taskId: number,
  date: string
) {
  const { data, error } = await client
    .from("task_completions")
    .delete()
    .match({ user_id: userId, task_id: taskId, date: date });
  if (error) throw error;
  return data;
}

/**
 * Gets all users who have configured rollover settings
 * 
 * Retrieves users with valid timezone and rollover_time settings.
 * Used by the cron job to determine which users need streak checking.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @returns {Promise<Array>} Array of users with rollover settings
 * 
 * @throws {Error} If database query fails
 */
export async function getUsersWithRolloverSettings(client: SupabaseClient) {
  const { data, error } = await client
    .from("user_settings")
    .select("user_id, rollover_time, tz")
    .not("rollover_time", "is", null)
    .not("tz", "is", null);

  if (error) throw error;
  return data || [];
}

/**
 * Gets all tasks with active streaks for a user
 * 
 * Retrieves tasks that have a streak greater than 0. Used by the cron job
 * to find tasks that need streak validation and potential reset.
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client
 * @param {string} userId - Unique identifier for the user
 * @returns {Promise<Array>} Array of tasks with active streaks
 * 
 * @throws {Error} If database query fails
 */
export async function getActiveStreakTasks(
  client: SupabaseClient,
  userId: string
) {
  const { data, error } = await client
    .from("task")
    .select("id, rrule, date, streak")
    .eq("user_id", userId)
    .gt("streak", 0);
  if (error) throw error;
  return data || [];
}

/**
 * Main cron job function to check and reset streaks for all users
 * 
 * This function is called by the cron endpoint to systematically check
 * all users' tasks and reset streaks if deadlines are missed. It:
 * 1. Gets all users with rollover settings
 * 2. For each user, gets tasks with active streaks
 * 3. Checks if streaks should be reset based on completion history
 * 4. Resets streaks and logs history
 * 5. Returns statistics about the processing
 * 
 * @param {SupabaseClient} client - Authenticated Supabase client with service role
 * @returns {Promise<Object>} Processing statistics including:
 *   - success: boolean
 *   - processedUsers: number of users checked
 *   - processedTasks: number of tasks checked
 *   - resetStreaks: number of streaks reset
 *   - timestamp: ISO timestamp of execution
 * 
 * @throws {Error} If processing fails
 */
export async function processStreakChecking(client: SupabaseClient) {
  try {
    const users = await getUsersWithRolloverSettings(client);

    let processedUsers = 0;
    let processedTasks = 0;
    let resetStreaks = 0;

    // For each user we do these checks
    for (const user of users) {
      processedUsers ++;
    
      try {
        // Gets all tasks that are currently active ( has a streak > 0 )
        const tasks = await getActiveStreakTasks(client, user.user_id)
        const userStats = await getUserStats(client, user.user_id)

        for (const task of tasks) {
          processedTasks ++;

          try {
            // Finds the completed dates of the active tasks
            const completionDates = await getTaskCompletionDates(client, user.user_id, task.id);

            // If the task has no completion dates, then we skip to the next task
            if (completionDates.length === 0) {
              continue;
            }

            // Find the last completed date
            const lastCompletion = completionDates[completionDates.length - 1];

            const currentDate = new Date().toLocaleDateString('en-CA', {
              timeZone:user.tz || 'UTC'
            });

            const shouldReset = shouldStreakBeReset(
              task, lastCompletion, currentDate, user.rollover_time, user.tz || 'UTC', completionDates
            );

            if (shouldReset) {
              await resetTaskStreak(client, user.user_id, task.id, task.streak, "missed_deadline");
              resetStreaks++;
              await healthDeduction(client, user.user_id, userStats.health)
              console.log(`Reset streak for task ${task.id} (user ${user.user_id})`);
            }
          } catch (taskError) {
            console.error(`Error processing task ${task.id}:`, taskError)
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${user.user_id}:`, userError);
      }
    }

    return {
      success: true,
      processedUsers,
      processedTasks,
      resetStreaks,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error in processStreakChecking:", error);
    throw error;
  }
}