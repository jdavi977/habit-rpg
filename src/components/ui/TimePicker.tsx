'use client'

type TimePickerProps = {
  label: string
  value: { hour: number; minute: number; period: 'AM' | 'PM' }
  onChange: (time: { hour: number; minute: number; period: 'AM' | 'PM' }) => void
  quickPresets?: Array<{ label: string; hour: number; minute: number; period: 'AM' | 'PM' }>
}

const TimePicker = ({ 
  label, 
  value, 
  onChange, 
}: TimePickerProps) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-cyber-text-bright">
        {label}
      </label>
      <div className="bg-gradient-to-r from-cyber-blue/10 to-cyber-blue/5 border border-cyber-line-color rounded-xl p-4">
        <div className="flex items-center justify-center space-x-4">
          {/* Hour Selection */}
          <div className="flex flex-col items-center space-y-2">
            <label className="text-xs text-cyber-text-muted font-medium">Hour</label>
            <div className="relative">
              <select
                value={value.hour}
                onChange={(e) => onChange({ ...value, hour: parseInt(e.target.value) })}
                className="bg-cyber-dark border border-cyber-line-color rounded-lg px-3 py-2 text-cyber-text-bright text-center appearance-none focus:border-cyber-blue-bright focus:ring-2 focus:ring-cyber-blue-bright/20 transition-all duration-200 w-16"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                  <option key={hour} value={hour} className="bg-cyber-dark text-cyber-text-bright">
                    {hour.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-cyber-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Colon Separator */}
          <div className="text-2xl font-bold text-cyber-text-bright mt-6">:</div>

          {/* Minute Selection */}
          <div className="flex flex-col items-center space-y-2">
            <label className="text-xs text-cyber-text-muted font-medium">Minute</label>
            <div className="relative">
              <select
                value={value.minute}
                onChange={(e) => onChange({ ...value, minute: parseInt(e.target.value) })}
                className="bg-cyber-dark border border-cyber-line-color rounded-lg px-3 py-2 text-cyber-text-bright text-center appearance-none focus:border-cyber-blue-bright focus:ring-2 focus:ring-cyber-blue-bright/20 transition-all duration-200 w-16"
              >
                <option value={0} className="bg-cyber-dark text-cyber-text-bright">00</option>
                <option value={30} className="bg-cyber-dark text-cyber-text-bright">30</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-cyber-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* AM/PM Selection */}
          <div className="flex flex-col items-center space-y-2">
            <label className="text-xs text-cyber-text-muted font-medium">Period</label>
            <div className="flex flex-col space-y-1">
              <button
                type="button"
                onClick={() => onChange({ ...value, period: 'AM' })}
                className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                  value.period === 'AM'
                    ? 'bg-cyber-blue-bright text-cyber-dark shadow-lg'
                    : 'bg-cyber-blue/10 text-cyber-text-muted hover:bg-cyber-blue/20'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...value, period: 'PM' })}
                className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                  value.period === 'PM'
                    ? 'bg-cyber-blue-bright text-cyber-dark shadow-lg'
                    : 'bg-cyber-blue/10 text-cyber-text-muted hover:bg-cyber-blue/20'
                }`}
              >
                PM
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimePicker
