"use client"

import { Progress } from "@/components/ui/progress"

type ProgressWithLabelProps = {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function ProgressWithLabel({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = "md",
  className = "",
}: ProgressWithLabelProps) {
  const percentage = Math.round((value / max) * 100)
  
  const heightClass = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3"
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between text-xs">
          {label && <span>{label}</span>}
          {showPercentage && <span>{percentage}%</span>}
        </div>
      )}
      <Progress value={percentage} className={heightClass[size]} />
    </div>
  )
}
