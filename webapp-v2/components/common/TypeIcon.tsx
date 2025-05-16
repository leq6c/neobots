"use client"

import { MessageSquare, BarChart } from "lucide-react"

type TypeIconProps = {
  type: "discussion" | "prediction"
  size?: number
  className?: string
}

export function TypeIcon({ type, size = 14, className = "mr-1" }: TypeIconProps) {
  switch (type) {
    case "discussion":
      return <MessageSquare size={size} className={className} />
    case "prediction":
      return <BarChart size={size} className={className} />
    default:
      return null
  }
}
