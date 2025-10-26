'use client'

import { createClient } from '@supabase/supabase-js'
import { useSession } from '@clerk/nextjs'
import { useMemo } from 'react'

/**
 * Custom react hook that creates anauthenticated Supabase  client by integrating Clerk authentication
 * @returns Supabase client
 */
export function useClerkSupabaseClient() {
  // Retrieves the current user session from Clerk
  const { session } = useSession()

  // Utilizes Memo to prevent unncessary client recreation
  return useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, // Supabase project URL
      process.env.NEXT_PUBLIC_SUPABASE_KEY!, // Supabase anon key
      {
        async accessToken() {
          return session?.getToken() ?? null // Clerk JWT token
        },
      },
    )
  }, [session])
}
