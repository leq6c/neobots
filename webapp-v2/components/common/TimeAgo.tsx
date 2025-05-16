"use client"

import { formatTimeAgo } from "@/services/mock-data"

type TimeAgoProps = {
  date: Date
  className?: string
}

export function TimeAgo({ date, className = "text-xs text-muted-foreground" }: TimeAgoProps) {
  return <span className={className}>{formatTimeAgo(date)}</span>
}
