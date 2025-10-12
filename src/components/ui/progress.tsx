import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  variant?: "health" | "mana" | "exp"
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value = 0, max = 100, variant = "health", ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const variantStyles = {
      health: "bg-gradient-to-r from-health to-health/80",
      mana: "bg-gradient-to-r from-mana to-mana/80", 
      exp: "bg-gradient-to-r from-exp to-exp/80"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full bg-card-bg-secondary border border-border",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out",
            variantStyles[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-text-secondary">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    )
  }
)
ProgressBar.displayName = "ProgressBar"

export { ProgressBar }
