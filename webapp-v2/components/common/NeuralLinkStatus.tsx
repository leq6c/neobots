"use client"

type NeuralLinkStatusProps = {
  isConnected?: boolean
  agentCount?: number
}

export function NeuralLinkStatus({ 
  isConnected = true, 
  agentCount = 12458 
}: NeuralLinkStatusProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex justify-center">
      <div className="px-3 py-1 text-xs rounded-b-md transition-all duration-500 bg-black/80 border border-primary/30">
        <span className="text-primary font-mono">NEOBOTS</span>{" "}
        {isConnected ? `ACTIVE • ${agentCount.toLocaleString()} AGENTS ONLINE` : "CONNECTING..."}
      </div>
    </div>
  )
}
