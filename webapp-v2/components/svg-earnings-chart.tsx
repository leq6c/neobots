"use client"

import { useEffect, useRef, useState } from "react"

type EarningDataPoint = {
  time: Date
  value: number
}

type AgentAction = {
  id: string
  agentName: string
  type: string
  earnings: number
  timestamp: Date
}

export function SVGEarningsChart({
  data,
  recentActions,
  height = 200,
}: {
  data: EarningDataPoint[]
  recentActions: AgentAction[]
  height?: number
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height })

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const { width } = svgRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [height])

  // Calculate chart values
  const values = data.map((d) => d.value)
  const maxValue = Math.max(...values) * 1.2 // Add 20% padding
  const minValue = Math.min(...values) * 0.8 // Add 20% padding
  const valueRange = maxValue - minValue

  // Chart dimensions
  const padding = 20
  const chartWidth = dimensions.width - padding * 2
  const chartHeight = dimensions.height - padding * 2

  // Generate path for the line
  const generateLinePath = () => {
    if (!data.length || chartWidth <= 0) return ""

    return data
      .map((point, i) => {
        const x = padding + (i / (data.length - 1)) * chartWidth
        const normalizedValue = (point.value - minValue) / valueRange
        const y = dimensions.height - padding - normalizedValue * chartHeight

        return `${i === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")
  }

  // Generate path for the area under the line
  const generateAreaPath = () => {
    if (!data.length || chartWidth <= 0) return ""

    const linePath = data
      .map((point, i) => {
        const x = padding + (i / (data.length - 1)) * chartWidth
        const normalizedValue = (point.value - minValue) / valueRange
        const y = dimensions.height - padding - normalizedValue * chartHeight

        return `${i === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")

    // Add bottom line to close the path
    const bottomRight = `L ${dimensions.width - padding} ${dimensions.height - padding}`
    const bottomLeft = `L ${padding} ${dimensions.height - padding}`
    const closePath = "Z"

    return `${linePath} ${bottomRight} ${bottomLeft} ${closePath}`
  }

  // Format time for tooltip
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        width="100%"
        height={dimensions.height}
        className="overflow-visible"
        style={{ minHeight: height }}
      >
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`h-grid-${i}`}
            x1={padding}
            y1={padding + (chartHeight / 4) * i}
            x2={dimensions.width - padding}
            y2={padding + (chartHeight / 4) * i}
            stroke="rgba(0, 255, 160, 0.15)"
            strokeWidth="0.5"
          />
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line
            key={`v-grid-${i}`}
            x1={padding + (chartWidth / 6) * i}
            y1={padding}
            x2={padding + (chartWidth / 6) * i}
            y2={dimensions.height - padding}
            stroke="rgba(0, 255, 160, 0.15)"
            strokeWidth="0.5"
          />
        ))}

        {/* Area under the line */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0, 255, 160, 0.4)" />
            <stop offset="70%" stopColor="rgba(0, 255, 160, 0.1)" />
            <stop offset="100%" stopColor="rgba(0, 255, 160, 0)" />
          </linearGradient>
        </defs>
        <path d={generateAreaPath()} fill="url(#areaGradient)" />

        {/* Line */}
        <path
          d={generateLinePath()}
          fill="none"
          stroke="rgba(0, 255, 160, 0.9)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((point, i) => {
          const x = padding + (i / (data.length - 1)) * chartWidth
          const normalizedValue = (point.value - minValue) / valueRange
          const y = dimensions.height - padding - normalizedValue * chartHeight

          return (
            <g key={`point-${i}`}>
              {/* Glow effect */}
              <circle cx={x} cy={y} r="4" fill="rgba(0, 255, 160, 0.3)" />
              {/* Point */}
              <circle cx={x} cy={y} r="2" fill="rgba(0, 255, 160, 1)" />
            </g>
          )
        })}

        {/* Latest point with enhanced styling */}
        {data.length > 0 && (
          <g>
            {(() => {
              const latestPoint = data[data.length - 1]
              const x = dimensions.width - padding
              const normalizedValue = (latestPoint.value - minValue) / valueRange
              const y = dimensions.height - padding - normalizedValue * chartHeight

              return (
                <>
                  {/* Outer glow */}
                  <circle cx={x} cy={y} r="8" fill="rgba(0, 255, 160, 0.3)" />
                  {/* Outer ring */}
                  <circle cx={x} cy={y} r="5" fill="#000" />
                  {/* Inner point */}
                  <circle cx={x} cy={y} r="4" fill="rgba(0, 255, 160, 1)" />
                  {/* Value label */}
                  <text
                    x={x - 5}
                    y={y - 10}
                    fill="rgba(0, 255, 160, 1)"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {latestPoint.value.toFixed(2)} NEOBOTS
                  </text>
                </>
              )
            })()}
          </g>
        )}

        {/* Value labels */}
        <text x={padding} y={padding - 5} fill="rgba(255, 255, 255, 0.8)" fontSize="10" fontFamily="monospace">
          {maxValue.toFixed(2)} NEOBOTS
        </text>
        <text
          x={padding}
          y={dimensions.height - 5}
          fill="rgba(255, 255, 255, 0.8)"
          fontSize="10"
          fontFamily="monospace"
        >
          {minValue.toFixed(2)} NEOBOTS
        </text>
      </svg>

      {/* Recent actions overlay */}
      <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
        {recentActions.slice(0, 3).map((action, index) => {
          // Calculate position based on timestamp
          const now = new Date()
          const actionTime = action.timestamp
          const minutesAgo = (now.getTime() - actionTime.getTime()) / (60 * 1000)

          // Only show actions from the last 10 minutes
          if (minutesAgo > 10) return null

          // Position from right edge (newer = more to the right)
          const rightPosition = `${Math.max(0, Math.min(95, (10 - minutesAgo) * 10))}%`

          // Random vertical position
          const topPosition = `${20 + Math.random() * 60}%`

          return (
            <div
              key={action.id}
              className="absolute flex flex-col items-center"
              style={{
                right: rightPosition,
                top: topPosition,
                animation: "fadeInOut 3s forwards",
              }}
            >
              <div className="w-4 h-4 rounded-full bg-primary animate-ping absolute"></div>
              <div className="w-3 h-3 rounded-full bg-primary z-10"></div>
              <div className="mt-1 px-2 py-1 bg-black/80 border border-primary/30 rounded text-xs whitespace-nowrap">
                +{action.earnings.toFixed(3)} NEOBOTS
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
