"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react"

export function NetworkVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [nodeCount, setNodeCount] = useState(0)
  const [activeNodes, setActiveNodes] = useState(0)
  const [networkLatency, setNetworkLatency] = useState(0)
  const [securityAlerts, setSecurityAlerts] = useState(0)
  const [systemStatus, setSystemStatus] = useState<Record<string, string>>({})

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
    }, 1500)

    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    // Create nodes
    const nodes: Node[] = []
    const nodeCount = 200

    class Node {
      x: number
      y: number
      radius: number
      vx: number
      vy: number
      connections: Node[]
      active: boolean
      type: "normal" | "router" | "server"

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.radius = Math.random() * 2 + 1
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.connections = []
        this.active = Math.random() > 0.2
        this.type = Math.random() > 0.9 ? "server" : Math.random() > 0.7 ? "router" : "normal"
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1

        // Randomly change active state
        if (Math.random() < 0.001) {
          this.active = !this.active
        }
      }

      draw() {
        if (!ctx) return

        // Draw node
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius * zoom, 0, Math.PI * 2)

        if (this.type === "server") {
          ctx.fillStyle = this.active ? "#ffffff" : "#333333"
        } else if (this.type === "router") {
          ctx.fillStyle = this.active ? "#00ffa0" : "#333333"
        } else {
          ctx.fillStyle = this.active ? "rgba(255, 255, 255, 0.7)" : "#333333"
        }

        ctx.fill()

        // Draw special node indicators
        if (this.type === "server" && this.active) {
          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 0.5 * zoom
          ctx.strokeRect(
            this.x - this.radius - 2,
            this.y - this.radius - 2,
            (this.radius + 2) * 2,
            (this.radius + 2) * 2,
          )
        } else if (this.type === "router" && this.active) {
          ctx.beginPath()
          ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2)
          ctx.strokeStyle = "#00ffa0"
          ctx.lineWidth = 0.5 * zoom
          ctx.stroke()
        }

        // Draw connections
        this.connections.forEach((node) => {
          ctx.beginPath()
          ctx.moveTo(this.x, this.y)
          ctx.lineTo(node.x, node.y)

          if ((this.type === "server" || node.type === "server") && this.active && node.active) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
            ctx.lineWidth = 0.7 * zoom
          } else if ((this.type === "router" || node.type === "router") && this.active && node.active) {
            ctx.strokeStyle = "rgba(0, 255, 170, 0.3)"
            ctx.lineWidth = 0.5 * zoom
          } else {
            ctx.strokeStyle = this.active && node.active ? "rgba(255, 255, 255, 0.1)" : "rgba(100, 100, 100, 0.05)"
            ctx.lineWidth = 0.3 * zoom
          }

          ctx.stroke()
        })
      }
    }

    // Initialize nodes
    for (let i = 0; i < nodeCount; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      nodes.push(new Node(x, y))
    }

    // Create connections
    nodes.forEach((node) => {
      const connectionCount =
        node.type === "server"
          ? Math.floor(Math.random() * 10) + 5
          : node.type === "router"
            ? Math.floor(Math.random() * 7) + 3
            : Math.floor(Math.random() * 3) + 1

      for (let i = 0; i < connectionCount; i++) {
        const randomNode = nodes[Math.floor(Math.random() * nodes.length)]
        if (randomNode !== node && !node.connections.includes(randomNode)) {
          node.connections.push(randomNode)
        }
      }
    })

    // Animation loop
    let animationFrameId: number

    const render = () => {
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw nodes
      nodes.forEach((node) => {
        node.update()
        node.draw()
      })

      // Simulate data packets
      if (Math.random() < 0.1) {
        const sourceNode = nodes[Math.floor(Math.random() * nodes.length)]
        if (sourceNode.connections.length > 0) {
          const targetNode = sourceNode.connections[Math.floor(Math.random() * sourceNode.connections.length)]

          if (sourceNode && targetNode) {
            // Packet color based on node type
            const packetColor =
              sourceNode.type === "server"
                ? "#ffffff"
                : sourceNode.type === "router"
                  ? "#00ffa0"
                  : "rgba(255, 255, 255, 0.7)"

            ctx.beginPath()
            ctx.arc(sourceNode.x, sourceNode.y, 2 * zoom, 0, Math.PI * 2)
            ctx.fillStyle = packetColor
            ctx.fill()

            // Animate packet
            let progress = 0
            const animatePacket = () => {
              if (progress >= 1) return

              progress += 0.03
              const x = sourceNode.x + (targetNode.x - sourceNode.x) * progress
              const y = sourceNode.y + (targetNode.y - sourceNode.y) * progress

              ctx.beginPath()
              ctx.arc(x, y, 1.5 * zoom, 0, Math.PI * 2)
              ctx.fillStyle = packetColor
              ctx.fill()

              requestAnimationFrame(animatePacket)
            }

            animatePacket()
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

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
      window.removeEventListener("resize", updateCanvasSize)
      cancelAnimationFrame(animationFrameId)
      clearInterval(statsInterval)
    }
  }, [zoom])

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

      <div className="relative h-[500px] border border-border rounded-md bg-black overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <RefreshCw size={24} className="animate-spin text-primary mb-2" />
              <div className="text-sm text-muted-foreground terminal-text">INITIALIZING NETWORK VISUALIZATION...</div>
            </div>
          </div>
        ) : (
          <>
            <canvas ref={canvasRef} className="w-full h-full" />

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
