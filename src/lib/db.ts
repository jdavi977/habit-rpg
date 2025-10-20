import { SupabaseClient } from "@supabase/supabase-js";
import { computeRewardMultipliers, totalExpForLevel } from "./reward";
import { doesTaskRepeatOnDate } from "./rruleHelper";
import { shouldStreakBeReset } from "./streakHelper";

// Helper function to calculate reward multipliers
const getRewardMultipliers = (
  difficulty: string,
  streak: number,
  level: number = 1
) => {
  return computeRewardMultipliers(difficulty, streak, level);
};

/**
 * Provides the stats of the user.
 * @param client An authenticated Supabase client instance.
 * @param userId The unique identifier of the user.
 * @returns A Promise to the data of the user's stats.
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

export async function getUserInfo(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("users")
    .select("email, username")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

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
 * Provides difficulty and streak data from the tasks table.
 * @param client An authenticated Supabase client instance.
 * @param taskId The unique identifier of the task.
 * @returns A Promise to the task data.
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
 * Removes the task from the database
 * @param client An authenticated Supabase client instance.
 * @param taskId The unique identifier for the task.
 * @returns A Promise to the removal of the task through the delete operation.
 */
export async function removeTaskDb(client: SupabaseClient, taskId: string) {
  return client.from("task").delete().eq("id", parseInt(taskId));
}

/**
 * Gives a gold reward to the user which scales based on difficulty of the task and the current streak.
 * @param client An authenticated Supabase client instance.
 * @param userId The unique identifier of the user.
 * @param difficulty The difficulty level of the task.
 * @param streak The current streak of the task.
 * @param gold The amount of gold the user currently has.
 * @returns A Promise to the result of the update operation.
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

const addWithCap = (current: number, addition: number, cap: number) => {
  const newValue = current + addition;
  const cappedValue = Math.min(newValue, cap);
  const excessValue = newValue - cappedValue;
  const actualGain = cappedValue - current;

  return { cappedValue, excessValue, actualGain };
};

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

export async function getTaskCompletionDates(
  client: SupabaseClient,
  userId: string,
  taskId: string
): Promise<string[]> {
  const { data, error } = await client
    .from("task_completions")
    .select("date")
    .eq("user_id", userId)
    .eq("id", parseInt(taskId))
    .order("date", { ascending: true });

  if (error) throw error;
  return data?.map((completion) => completion.date || []);
}

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
 * This function is to check if the task is already in the daily completed task table.
 * @param client An authenticated Supabase client instance.
 * @param userId The unique identifer of the user.
 * @param taskId The unique identifer of the task.
 * @param date The date to check for completion.
 * @returns A Promise that resolves to true or false if the task is present in the table.
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
 * This function is to add a task into the daily completed task table in supabase.
 * @param client An authenticated Supabase client instance.
 * @param userId The unique identifier of the user.
 * @param taskId The unique identifer of the task.
 * @param date The completion date
 * @returns A Promise to the result of the Supabase upsert operation.
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

export async function checkUserExists(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveUserRollover(
  client: SupabaseClient,
  tz: string,
  userId: string,
  rolloverTime: string
  ///nextRollover: string
) {
  return client
    .from("user_settings")
    .update({
      tz: tz,
      rollover_time: rolloverTime,
      // next_rollover_utc: nextRollover,
    })
    .eq("user_id", userId)
    .select()
    .single();
}

export async function getUserSettings(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("user_settings")
    .select()
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
}

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

export async function getNextRolloverCheck(
  client: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await client
    .from("user_settings")
    .select("user_id")
    .eq("user_id", userId)
    .is("next_rollover_utc", null)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function getUsersWithRolloverSettings(client: SupabaseClient) {
  const { data, error } = await client
    .from("user_settings")
    .select("user_id, rollover_time, tz")
    .not("rollover_time", "is", null)
    .not("tz", "is", null);

  if (error) throw error;
  return data || [];
}

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

export async function  processStreakChecking(client: SupabaseClient) {
  try {
    const users = await getUsersWithRolloverSettings(client);

    let processedUsers = 0;
    let processedTasks = 0;
    let resetStreaks = 0;

    for (const user of users) {
      processedUsers ++;
    
      try {
        const tasks = await getActiveStreakTasks(client, user.user_id)

        for (const task of tasks) {
          processedTasks ++;

          try {
            const completionDates = await getTaskCompletionDates(client, user.user_id, task.id);

            if (completionDates.length === 0) {
              continue;
            }

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