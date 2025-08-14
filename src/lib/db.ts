import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Provides all the tasks of the user.
 * @param client An authenticated Supabase client instance.
 * @returns A Promise to the data of all the user's tasks.
 */
export async function getTasks(client: SupabaseClient) {
  const { data, error } = await client.from("tasks").select();
  if (error) throw error;
  return data ?? [];
}

/**
 * Provides the stats of the user.
 * @param client An authenticated Supabase client instance.
 * @param userId The unique identifier of the user.
 * @returns A Promise to the data of the user's stats.
 */
export async function getUserStats(client: SupabaseClient, userId: string) {
  console.log("🔍 getUserStats called for userId:", userId);
  
  // First try to get existing stats
  const { data, error } = await client
    .from("user_stats")
    .select("gold, mana, level, exp")
    .eq("user_id", userId)
    .maybeSingle();
  
  console.log("📊 Database query result - data:", data, "error:", error);
  
  if (error) {
    console.error("❌ Database error in getUserStats:", error);
    throw error;
  }
  
  // If stats don't exist, create default stats
  if (!data) {
    console.log("📝 No stats found, creating default stats for user:", userId);
    const defaultStats = {
      user_id: userId,
      gold: 0,
      mana: 0,
      level: 1,
      exp: 0,
    };
    
    const { data: newStats, error: createError } = await client
      .from("user_stats")
      .insert(defaultStats)
      .select("gold, mana, level, exp")
      .single();
    
    if (createError) {
      console.error("❌ Failed to create default user stats:", createError.message);
      // Return default values if creation fails
      return { gold: 0, mana: 0, level: 1, exp: 0 };
    }
    
    console.log("✅ Default stats created successfully:", newStats);
    return newStats;
  }
  
  console.log("✅ Returning existing stats:", data);
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
    .from("tasks")
    .select("difficulty, streak")
    .eq("id", taskId)
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
    return client.from("tasks").delete().eq('id', taskId)
}

/**
 * Gives a gold reward to the user which scales based on difficulty of the task and the current streak.
 * @param client An authenticated Supabase client instance.
 * @param userId The unique identifier of the user.
 * @param diffMultiplier The difficulty multiplier.
 * @param streakMultiplier The streak multiplier.
 * @param gold The amount of gold the user currently has.
 * @returns A Promise to the result of the update operation.
 */
export async function goldReward(client: SupabaseClient, userId: string, diffMultiplier: number, streakMultiplier: number, gold: number) {
    return client.from('user_stats')
      .update({ gold: (gold ?? 0) + Math.round((diffMultiplier) * streakMultiplier)})
      .eq('user_id', userId)
      .select()
      .single()
}

/**
 * This function is to check if the task is already in the daily completed task table.
 * @param client An authenticated Supabase client instance.
 * @param userId The unique identifer of the user.
 * @param taskId The unique identifer of the task.
 * @param date The date to check for completion.
 * @returns A Promise that resolves to true or false if the task is present in the table.
 */
export async function dailyTaskCheck(client: SupabaseClient, userId: string, taskId: number, date: string) {
    const {count} = 
        await client.from("task_completions")
        .select('*', {count: 'exact', head: true})
        .eq('user_id', userId)
        .eq('task_id', taskId)
        .eq('date', date)

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
export async function dailyCompletion(client: SupabaseClient, userId: string, taskId: number, date: string) {
  return client.from("task_completions").upsert(
    [{ user_id: userId, task_id: taskId, date }],
    { onConflict: "user_id, task_id, date", ignoreDuplicates: true }
  );
}
