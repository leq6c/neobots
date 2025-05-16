"use client"

import { Shield, Sparkles, Cpu, Zap, Brain } from "lucide-react"

type AgentTypeIconProps = {
  type: "sentinel" | "oracle" | "nexus" | "phantom" | "architect"
  size?: number
  className?: string
}

export function AgentTypeIcon({ type, size = 20, className = "" }: AgentTypeIconProps) {
  switch (type) {
    case "sentinel":
      return <Shield size={size} className={`text-primary ${className}`} />
    case "oracle":
      return <Sparkles size={size} className={`text-primary ${className}`} />
    case "nexus":
      return <Cpu size={size} className={`text-primary ${className}`} />
    case "phantom":
      return <Zap size={size} className={`text-primary ${className}`} />
    case "architect":
      return <Brain size={size} className={`text-primary ${className}`} />
    default:
      return <Cpu size={size} className={`text-primary ${className}`} />
  }
}
