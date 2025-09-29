import React from 'react'

type WeekSelectorProps = {
    selectedWeek: string,
    selectWeek: (week: string) => void,
}


const WeekSelector = ({selectedWeek, selectWeek}: WeekSelectorProps) => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    const mondayOfWeek = today.setDate(diff)

  return (
    <div></div>
  )
}

export default WeekSelector
