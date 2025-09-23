import { getTasks } from '@/lib/db'
import { SupabaseClient } from '@supabase/supabase-js'
import { useCallback, useEffect } from 'react'


const useTaskStreaks = (client: SupabaseClient, userId?: string) => {

    const streakChecker = useCallback(async (userId: string) => {
        const userTasks = await getTasks(client)
        console.log(userTasks)
        

    }, [client])

    useEffect(() => {
        if (userId) {
            streakChecker(userId)
        }
    }, [streakChecker, userId])
    

    return {streakChecker}
}

export default useTaskStreaks
