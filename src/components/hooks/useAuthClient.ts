/**
 * @fileoverview Authentication and database client hook
 * @module components/hooks/useAuthClient
 * 
 * Provides authenticated Supabase client and user ID to components.
 * Combines Clerk user data with Supabase client for easy database access.
 * Used throughout the application for authenticated database operations.
 */

import { useClerkSupabaseClient } from '@/lib/supabaseClient';
import { useUser } from '@clerk/nextjs';

/**
 * Custom hook that provides authentication context and database client
 * 
 * Wraps Clerk authentication with Supabase client access. Returns the
 * authenticated Supabase client and current user ID for database operations.
 * 
 * @returns {Object} Object containing:
 *   - userId: Current user's unique identifier (empty string if not signed in)
 *   - client: Authenticated Supabase client instance
 * 
 * @example
 * const { userId, client } = useAuthClient();
 * const { data } = await client.from('tasks').select('*').eq('user_id', userId);
 */
const useAuthClient = () => {
    const { user } = useUser();
    const client = useClerkSupabaseClient();

  return { userId: user?.id ?? "", client}
}

export default useAuthClient;
