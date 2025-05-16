"use client"

type StatusIndicatorProps = {
  status: "active" | "idle" | "learning" | "offline"
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
}

export function StatusIndicator({ 
  status, 
  showLabel = true,
  size = "sm" 
}: StatusIndicatorProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary"
      case "learning":
        return "bg-amber-500"
      case "idle":
        return "bg-blue-500"
      case "offline":
        return "bg-muted"
      default:
        return "bg-muted"
    }
  }

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  }

  return (
    <div className="flex items-center">
      <span className={`${sizeClasses[size]} rounded-full ${getStatusColor(status)} mr-1`}></span>
      {showLabel && <span className="capitalize text-xs text-muted-foreground">{status}</span>}
    </div>
  )
}
