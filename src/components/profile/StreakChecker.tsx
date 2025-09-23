'use client'

import useAuthClient  from '../hooks/useAuthClient'
import useTaskStreaks from '../hooks/useTaskStreaks'

const StreakChecker = () => {
  const { userId, client } = useAuthClient()
  
  // This hook will automatically run streak checking when userId is available
  useTaskStreaks(client, userId)
  
  // This component doesn't render anything, it just runs the streak logic
  return null
}

export default StreakChecker
