"use client"

import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle } from "lucide-react"

type StatusBadgeProps = {
  status: "completed" | "processing" | "critical"
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "completed":
      return <Badge className="bg-primary/10 text-primary border-primary/50">Completed</Badge>
    case "processing":
      return (
        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/50 flex items-center">
          <Loader2 size={10} className="mr-1 animate-spin" /> Processing
        </Badge>
      )
    case "critical":
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/50 flex items-center">
          <AlertTriangle size={10} className="mr-1" /> Critical
        </Badge>
      )
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}
