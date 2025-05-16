"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react"

interface Node {
  id: string
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  connections: string[]
  active: boolean
  type: "normal" | "router" | "server"
}

export function SVGNetworkVisualization() {
  const [zoom, setZoom] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [nodeCount, setNodeCount] = useState(0)
  const [activeNodes, setActiveNodes] = useState(0)
  const [networkLatency, setNetworkLatency] = useState(0)
  const [securityAlerts, setSecurityAlerts] = useState(0)
  const [systemStatus, setSystemStatus] = useState<Record<string, string>>({})
  const [nodes, setNodes] = useState<Node[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 500 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Function to create a new node
  const createNode = (id: string, x: number, y: number): Node => {
    return {
      id,
      x,
      y,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      connections: [],
      active: Math.random() > 0.2,
      type: Math.random() > 0.9 ? "server" : Math.random() > 0.7 ? "router" : "normal",
    }
  }

  // Function to update node position
  const updateNodePosition = (node: Node, width: number, height: number): Node => {
    const x = node.x + node.vx
    const y = node.y + node.vy

    // Bounce off edges
    let vx = node.vx
    let vy = node.vy

    if (x < 0 || x > width) vx *= -1
    if (y < 0 || y > height) vy *= -1

    // Randomly change active state
    const active = Math.random() < 0.001 ? !node.active : node.active

    return {
      ...node,
      x,
      y,
      vx,
      vy,
      active,
    }
  }

  // Initialize nodes and connections
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
      setNodeCount(12458)
      setActiveNodes(10234)
      setNetworkLatency(42)
      setSecurityAlerts(Math.floor(Math.random() * 10) + 1)
      setSystemStatus({
        "NEURAL CORE": Math.random() > 0.9 ? "CRITICAL" : Math.random() > 0.7 ? "WARNING" : "OPTIMAL",
        ENCRYPTION: Math.random() > 0.9 ? "CRITICAL" : Math.random() > 0.7 ? "WARNING" : "OPTIMAL",
        FIREWALL: Math.random() > 0.9 ? "CRITICAL" : Math.random() > 0.7 ? "WARNING" : "OPTIMAL",
        BANDWIDTH: Math.random() > 0.9 ? "CRITICAL" : Math.random() > 0.7 ? "WARNING" : "OPTIMAL",
        POWER: Math.random() > 0.9 ? "CRITICAL" : Math.random() > 0.7 ? "WARNING" : "OPTIMAL",
      })

      // Initialize nodes
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })

        const nodeCount = 100 // Reduced for better performance with SVG
        const newNodes: Node[] = []

        // Create nodes
        for (let i = 0; i < nodeCount; i++) {
          const x = Math.random() * width
          const y = Math.random() * height
          newNodes.push(createNode(`node-${i}`, x, y))
        }

        // Create connections
        newNodes.forEach((node) => {
          const connectionCount =
            node.type === "server"
              ? Math.floor(Math.random() * 5) + 3
              : node.type === "router"
                ? Math.floor(Math.random() * 4) + 2
                : Math.floor(Math.random() * 2) + 1

          for (let i = 0; i < connectionCount; i++) {
            const randomNodeIndex = Math.floor(Math.random() * newNodes.length)
            const randomNode = newNodes[randomNodeIndex]
            if (randomNode.id !== node.id && !node.connections.includes(randomNode.id)) {
              node.connections.push(randomNode.id)
            }
          }
        })

        setNodes(newNodes)
      }
    }, 1500)
  }, [])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Animation loop
  useEffect(() => {
    if (isLoading || nodes.length === 0) return

    const interval = setInterval(() => {
      setNodes((prevNodes) => {
        return prevNodes.map((node) => updateNodePosition(node, dimensions.width, dimensions.height))
      })
    }, 50)

    // Update network stats periodically
    const statsInterval = setInterval(() => {
      setActiveNodes(Math.floor(Math.random() * 2000) + 10000)
      setNetworkLatency(Math.floor(Math.random() * 30) + 30)
      setSecurityAlerts((prev) => prev + (Math.random() > 0.7 ? 1 : 0))

      // Random system status changes
      const systems = ["NEURAL CORE", "ENCRYPTION", "FIREWALL", "BANDWIDTH", "POWER"]
      const randomSystem = systems[Math.floor(Math.random() * systems.length)]
      setSystemStatus((prev) => ({
        ...prev,
        [randomSystem]: Math.random() > 0.9 ? "CRITICAL" : Math.random() > 0.7 ? "WARNING" : "OPTIMAL",
      }))
    }, 5000)

    return () => {
      clearInterval(interval)
      clearInterval(statsInterval)
    }
  }, [isLoading, nodes, dimensions])

  const getStatusClass = (status: string) => {
    switch (status) {
      case "CRITICAL":
        return "status-critical"
      case "WARNING":
        return "status-warning"
      default:
        return "status-optimal"
    }
  }

  // Generate data packets for animation
  const [dataPackets, setDataPackets] = useState<
    { id: string; sourceId: string; targetId: string; progress: number; type: string }[]
  >([])

  useEffect(() => {
    if (isLoading || nodes.length === 0) return

    const interval = setInterval(() => {
      // Randomly create new data packets
      if (Math.random() < 0.2) {
        const sourceNodeIndex = Math.floor(Math.random() * nodes.length)
        const sourceNode = nodes[sourceNodeIndex]

        if (sourceNode.connections.length > 0) {
          const targetId = sourceNode.connections[Math.floor(Math.random() * sourceNode.connections.length)]

          const newPacket = {
            id: `packet-${Date.now()}-${Math.random()}`,
            sourceId: sourceNode.id,
            targetId,
            progress: 0,
            type: sourceNode.type,
          }

          setDataPackets((prev) => [...prev, newPacket])
        }
      }

      // Update existing packets
      setDataPackets(
        (prev) =>
          prev
            .map((packet) => ({
              ...packet,
              progress: packet.progress + 0.05,
            }))
            .filter((packet) => packet.progress < 1), // Remove completed packets
      )
    }, 100)

    return () => clearInterval(interval)
  }, [isLoading, nodes])

  return (
    <div className="h-full p-4 pt-2 overflow-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="bg-black/80 border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-primary">NEURAL NODES</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-mono text-white">
              {isLoading ? <div className="h-8 w-20 bg-muted animate-pulse rounded"></div> : nodeCount.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">DISTRIBUTED ACROSS 128 REGIONS</div>
          </CardContent>
        </Card>

        <Card className="bg-black/80 border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-primary">ACTIVE NODES</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-mono text-white">
              {isLoading ? (
                <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
              ) : (
                activeNodes.toLocaleString()
              )}
            </div>
            {!isLoading && (
              <div className="text-xs text-muted-foreground">
                {Math.round((activeNodes / nodeCount) * 100)}% OF NETWORK
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-black/80 border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-primary">NETWORK LATENCY</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-mono text-white">
              {isLoading ? <div className="h-8 w-20 bg-muted animate-pulse rounded"></div> : `${networkLatency}ms`}
            </div>
            <div className="text-xs text-muted-foreground">ENCRYPTION: QUANTUM</div>
          </CardContent>
        </Card>
      </div>

      <div ref={containerRef} className="relative h-[500px] border border-border rounded-md bg-black overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <RefreshCw size={24} className="animate-spin text-primary mb-2" />
              <div className="text-sm text-muted-foreground terminal-text">INITIALIZING NETWORK VISUALIZATION...</div>
            </div>
          </div>
        ) : (
          <>
            <svg width="100%" height="100%" className="absolute inset-0">
              {/* Connections */}
              {nodes.map((node) =>
                node.connections.map((targetId) => {
                  const targetNode = nodes.find((n) => n.id === targetId)
                  if (!targetNode) return null

                  const isActive = node.active && targetNode.active
                  const isSpecial = (node.type === "server" || targetNode.type === "server") && isActive
                  const isRouter = (node.type === "router" || targetNode.type === "router") && isActive

                  let strokeColor = "rgba(100, 100, 100, 0.05)"
                  let strokeWidth = 0.3 * zoom

                  if (isSpecial) {
                    strokeColor = "rgba(255, 255, 255, 0.3)"
                    strokeWidth = 0.7 * zoom
                  } else if (isRouter) {
                    strokeColor = "rgba(0, 255, 170, 0.3)"
                    strokeWidth = 0.5 * zoom
                  } else if (isActive) {
                    strokeColor = "rgba(255, 255, 255, 0.1)"
                    strokeWidth = 0.3 * zoom
                  }

                  return (
                    <line
                      key={`${node.id}-${targetId}`}
                      x1={node.x}
                      y1={node.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                    />
                  )
                }),
              )}

              {/* Nodes */}
              {nodes.map((node) => {
                let fillColor = "#333333"

                if (node.active) {
                  if (node.type === "server") {
                    fillColor = "#ffffff"
                  } else if (node.type === "router") {
                    fillColor = "#00ffa0"
                  } else {
                    fillColor = "rgba(255, 255, 255, 0.7)"
                  }
                }

                return (
                  <g key={node.id}>
                    <circle cx={node.x} cy={node.y} r={node.radius * zoom} fill={fillColor} />

                    {/* Special node indicators */}
                    {node.type === "server" && node.active && (
                      <rect
                        x={node.x - node.radius - 2}
                        y={node.y - node.radius - 2}
                        width={(node.radius + 2) * 2}
                        height={(node.radius + 2) * 2}
                        stroke="#ffffff"
                        strokeWidth={0.5 * zoom}
                        fill="none"
                      />
                    )}

                    {node.type === "router" && node.active && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.radius + 2}
                        stroke="#00ffa0"
                        strokeWidth={0.5 * zoom}
                        fill="none"
                      />
                    )}
                  </g>
                )
              })}

              {/* Data packets */}
              {dataPackets.map((packet) => {
                const sourceNode = nodes.find((n) => n.id === packet.sourceId)
                const targetNode = nodes.find((n) => n.id === packet.targetId)

                if (!sourceNode || !targetNode) return null

                const x = sourceNode.x + (targetNode.x - sourceNode.x) * packet.progress
                const y = sourceNode.y + (targetNode.y - sourceNode.y) * packet.progress

                let packetColor = "rgba(255, 255, 255, 0.7)"
                if (packet.type === "server") {
                  packetColor = "#ffffff"
                } else if (packet.type === "router") {
                  packetColor = "#00ffa0"
                }

                return <circle key={packet.id} cx={x} cy={y} r={1.5 * zoom} fill={packetColor} />
              })}
            </svg>

            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                className="w-8 h-8 p-0 bg-black/80"
                onClick={() => setZoom((prev) => Math.min(prev + 0.2, 2))}
              >
                <ZoomIn size={16} className="text-primary" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-8 h-8 p-0 bg-black/80"
                onClick={() => setZoom((prev) => Math.max(prev - 0.2, 0.5))}
              >
                <ZoomOut size={16} className="text-primary" />
              </Button>
            </div>

            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <div className="network-badge">GLOBAL NEURAL NETWORK</div>
              <div className="network-badge">{Math.floor(Math.random() * 500) + 1000} CONNECTIONS</div>
              <div className="network-badge">{Math.floor(Math.random() * 50) + 100} REGIONS</div>
            </div>

            {/* System status panel */}
            <div className="absolute top-4 right-4 w-48 system-panel">
              <div className="system-header">SYSTEM STATUS</div>
              {Object.entries(systemStatus).map(([system, status]) => (
                <div key={system} className="flex justify-between items-center text-xs mb-1">
                  <div>{system}:</div>
                  <span className={getStatusClass(status)}>{status}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
