"use client"

import { Badge } from "@/components/ui/badge"

type RarityBadgeProps = {
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary"
  className?: string
}

export function RarityBadge({ rarity, className = "" }: RarityBadgeProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-slate-500"
      case "Uncommon":
        return "bg-green-500"
      case "Rare":
        return "bg-blue-500"
      case "Epic":
        return "bg-purple-500"
      case "Legendary":
        return "bg-amber-500"
      default:
        return "bg-slate-500"
    }
  }

  return (
    <Badge className={`${getRarityColor(rarity)} ${className}`}>
      {rarity}
    </Badge>
  )
}
