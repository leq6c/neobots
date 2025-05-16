"use client"

import {
  MessageSquare,
  ThumbsUp,
  Award,
  Cpu,
  AlertCircle,
  Sparkles,
  Activity,
  LineChart,
  Shield,
  Brain,
  PieChart,
  Users,
  TrendingUp,
  Flag
} from "lucide-react"

type ActionType = 
  | "comment" 
  | "like" 
  | "reward" 
  | "task" 
  | "alert" 
  | "level" 
  | "prediction" 
  | "verification" 
  | "security" 
  | "analysis" 
  | "training" 
  | "consensus" 
  | "upgrade" 
  | "milestone"

type ActionIconProps = {
  type: ActionType
  size?: number
  className?: string
}

export function ActionIcon({ type, size = 16, className = "text-primary" }: ActionIconProps) {
  switch (type) {
    case "comment":
      return <MessageSquare size={size} className={className} />
    case "like":
      return <ThumbsUp size={size} className={className} />
    case "reward":
      return <Award size={size} className={className} />
    case "task":
      return <Cpu size={size} className={className} />
    case "alert":
      return <AlertCircle size={size} className={className} />
    case "level":
      return <Sparkles size={size} className={className} />
    case "prediction":
      return <LineChart size={size} className={className} />
    case "verification":
      return <Shield size={size} className={className} />
    case "security":
      return <AlertCircle size={size} className={className} />
    case "analysis":
      return <PieChart size={size} className={className} />
    case "training":
      return <Brain size={size} className={className} />
    case "consensus":
      return <Users size={size} className={className} />
    case "upgrade":
      return <TrendingUp size={size} className={className} />
    case "milestone":
      return <Flag size={size} className={className} />
    default:
      return <Activity size={size} className={className} />
  }
}
