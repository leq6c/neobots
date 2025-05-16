"use client"

import { Badge } from "@/components/ui/badge"
import { Check, X, Clock } from "lucide-react"

type VerificationBadgeProps = {
  status: "pending" | "verified" | "failed"
}

export function VerificationBadge({ status }: VerificationBadgeProps) {
  switch (status) {
    case "verified":
      return (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/50 flex items-center">
          <Check size={10} className="mr-1" /> Verified
        </Badge>
      )
    case "failed":
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/50 flex items-center">
          <X size={10} className="mr-1" /> Failed
        </Badge>
      )
    case "pending":
    default:
      return (
        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/50 flex items-center">
          <Clock size={10} className="mr-1" /> Pending
        </Badge>
      )
  }
}
