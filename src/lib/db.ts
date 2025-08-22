import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Provides the stats of the user.
 * @param client An authenticated Supabase client instance.
 * @param userId The unique identifier of the user.
 * @returns A Promise to the data of the user's stats.
 */
export async function getUserStats(client: SupabaseClient, userId: string) {  
  const { data, error } = await client
    .from("user_stats")
    .select("level, exp, gold, mana")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

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
 * Inserts a task with the following data into the database.
 * @param client An authenticated Supabase client instance.
 * @param userId The unique identifer of the user.
 * @param title The title of the task.
 * @param difficulty The difficulty of the task.
 * @param days The days the tasks will appear.
 * @returns The promise to the creation of the task.
 */
export async function createTask(client: SupabaseClient, userId: string, title: string, difficulty: string, days: string[]) {
  const { data, error} = await client.from("tasks")
    .insert({user_id: userId, title: title, difficulty: difficulty, days: days})
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

export async function undoGoldReward(client: SupabaseClient, userId: string, diffMultiplier: number, streakMultiplier: number, gold: number) {
  console.log("undo", gold)
  return client.from('user_stats')
    .update({ gold: (gold ?? 0) - Math.round((diffMultiplier) * streakMultiplier)})
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

export async function getSelectedDayTasks(client: SupabaseClient, days: string) {
  const { data, error } = await client.from('tasks').select().contains('days', [days])
  if (error) throw error;
  return data;
}

export async function checkUserExists(client: SupabaseClient, userId: string) {
  const { data, error } = await client.from('users').select('id').eq('id', userId).maybeSingle()
  if (error) throw error;
  return data;
}

export async function saveUserRollover(client: SupabaseClient, userId: string, rolloverTime: string) {
  console.log(rolloverTime)
  return client.from('user_settings')
    .update({rollover_time: rolloverTime})
    .eq('user_id', userId)
    .select()
    .single()
}

export async function getUserSettings(client: SupabaseClient, userId: string) {
  const {data, error} = await client.from('user_settings').select('rollover_time').eq("user_id", userId).single()
  if (error) throw error;
  return data;
}

export async function deleteTaskCompleted(client: SupabaseClient, userId: string, taskId: number, date: string) {
  const {data, error} = await client.from('task_completions').delete().match({"user_id": userId, "task_id": taskId, "date": date})
  if (error) throw error;
  return data;
}
