"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Brain,
  ChevronRight,
  Clock,
  Coins,
  Cpu,
  Globe,
  LineChart,
  Loader2,
  MessageSquare,
  Network,
  PieChart,
  Plus,
  Shield,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Wallet,
  Zap,
  Award,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Maximize2,
  BarChart2,
  DollarSign,
} from "lucide-react"
import { PageLayout, CardContainer, StatusIndicator, RarityBadge, AgentTypeIcon, ActionIcon, ProgressWithLabel } from "@/components/common"
import { SVGEarningsChart } from "@/components/svg-earnings-chart"
import { formatTimeAgo } from "@/services/mock-data"

// Types
type Agent = {
  id: string
  name: string
  type: "sentinel" | "oracle" | "nexus" | "phantom" | "architect"
  level: number
  experience: number
  status: "active" | "idle" | "learning" | "offline"
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary"
  earnings: number
  tasks: number
  lastActive: string
}

type AgentActivity = {
  id: string
  agentId: string
  agentName: string
  type: string
  description: string
  timestamp: Date
  points: number
  earnings?: number
}

type NetworkActivity = {
  id: string
  type: string
  description: string
  timestamp: Date
  impact: "low" | "medium" | "high"
  category: string
}

type EarningPeriod = {
  period: string
  amount: number
  change: number
}

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

export default function Dashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [agents, setAgents] = useState<Agent[]>([])
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([])
  const [networkActivities, setNetworkActivities] = useState<NetworkActivity[]>([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [earningPeriods, setEarningPeriods] = useState<EarningPeriod[]>([])
  const [activeAgents, setActiveAgents] = useState(0)
  const [networkStats, setNetworkStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalQueries: 0,
    avgConfidence: 0,
  })

  // Real-time earnings data
  const [realtimeEarnings, setRealtimeEarnings] = useState(0)
  const [earningsPerHour, setEarningsPerHour] = useState(0)
  const [earningsPerMinute, setEarningsPerMinute] = useState(0)
  const [earningsHistory, setEarningsHistory] = useState<EarningDataPoint[]>([])
  const [recentActions, setRecentActions] = useState<AgentAction[]>([])
  const [todayEarnings, setTodayEarnings] = useState(0)
  const [projectedEarnings, setProjectedEarnings] = useState(0)

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      // Generate mock data
      const mockAgents = generateMockAgents()
      const mockAgentActivities = generateMockAgentActivities(mockAgents)
      const mockNetworkActivities = generateMockNetworkActivities()
      const mockEarningPeriods = generateMockEarningPeriods()

      // Calculate total earnings
      const total = mockAgents.reduce((sum, agent) => sum + agent.earnings, 0)

      // Set state
      setAgents(mockAgents)
      setAgentActivities(mockAgentActivities)
      setNetworkActivities(mockNetworkActivities)
      setTotalEarnings(total)
      setEarningPeriods(mockEarningPeriods)
      setActiveAgents(mockAgents.filter((a) => a.status === "active" || a.status === "learning").length)
      setNetworkStats({
        totalAgents: 12458,
        activeAgents: 8734,
        totalQueries: 42891,
        avgConfidence: 87,
      })

      // Initialize real-time earnings data
      const hourlyRate = Math.floor(Math.random() * 50) + 20
      setEarningsPerHour(hourlyRate)
      setEarningsPerMinute(hourlyRate / 60)
      setTodayEarnings(Math.floor(Math.random() * 200) + 50)
      setProjectedEarnings(hourlyRate * 24)

      // Generate earnings history for the past 24 hours
      const now = new Date()
      const history: EarningDataPoint[] = []
      for (let i = 24; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000)
        // Base value with some randomness and a sine wave pattern for natural variation
        const baseValue = hourlyRate * (0.7 + 0.6 * Math.sin(i / 4))
        const randomFactor = 0.8 + Math.random() * 0.4
        const value = baseValue * randomFactor
        history.push({ time, value })
      }
      setEarningsHistory(history)

      // Generate some initial recent actions
      const initialActions: AgentAction[] = []
      for (let i = 0; i < 5; i++) {
        const agent = mockAgents[Math.floor(Math.random() * mockAgents.length)]
        const actionTypes = ["prediction", "verification", "analysis", "consensus", "security"]
        const type = actionTypes[Math.floor(Math.random() * actionTypes.length)]
        const earnings = Math.random() * 2 + 0.1
        const minutesAgo = Math.floor(Math.random() * 10)
        const timestamp = new Date(now.getTime() - minutesAgo * 60 * 1000)

        initialActions.push({
          id: `action-${i}`,
          agentName: agent.name,
          type,
          earnings,
          timestamp,
        })
      }
      setRecentActions(initialActions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))

      setIsLoading(false)
    }, 0)
  }, [])

  // Simulate real-time earnings updates
  useEffect(() => {
    if (isLoading) return

    let lastTimestamp = Date.now()
    let accumulatedEarnings = 0

    const interval = setInterval(() => {
      const now = Date.now()
      const elapsedSeconds = (now - lastTimestamp) / 1000
      lastTimestamp = now

      // Calculate earnings for this interval
      const earningsThisInterval = (earningsPerMinute / 60) * elapsedSeconds
      accumulatedEarnings += earningsThisInterval

      // Update total real-time earnings
      setRealtimeEarnings((prev) => prev + earningsThisInterval)
      setTodayEarnings((prev) => prev + earningsThisInterval)

      // Occasionally add a new action with a pulse
      if (Math.random() < 0.1) {
        // 10% chance every second
        const agent = agents[Math.floor(Math.random() * agents.length)]
        const actionTypes = ["prediction", "verification", "analysis", "consensus", "security"]
        const type = actionTypes[Math.floor(Math.random() * actionTypes.length)]
        const earnings = Math.random() * 2 + 0.1

        const newAction = {
          id: `action-${Date.now()}`,
          agentName: agent.name,
          type,
          earnings,
          timestamp: new Date(),
        }

        // Add to recent actions and keep only the most recent 10
        setRecentActions((prev) => [newAction, ...prev].slice(0, 10))

        // Add a spike to the earnings history
        const latestHistoryPoint = earningsHistory[earningsHistory.length - 1]
        const newHistoryPoint = {
          time: new Date(),
          value: latestHistoryPoint.value + earnings,
        }

        // Update the earnings history
        setEarningsHistory((prev) => [...prev.slice(-23), newHistoryPoint])
      }

      // Update the earnings history every minute
      if (now % (60 * 1000) < 1000) {
        const newHistoryPoint = {
          time: new Date(),
          value: earningsPerHour * (0.8 + Math.random() * 0.4), // Add some randomness
        }
        setEarningsHistory((prev) => [...prev.slice(-23), newHistoryPoint])
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isLoading, earningsPerMinute, earningsPerHour, agents, earningsHistory])

  // Generate mock agents
  const generateMockAgents = (): Agent[] => {
    const agentTypes: ("sentinel" | "oracle" | "nexus" | "phantom" | "architect")[] = [
      "sentinel",
      "oracle",
      "nexus",
      "phantom",
      "architect",
    ]

    const rarities: ("Common" | "Uncommon" | "Rare" | "Epic" | "Legendary")[] = [
      "Common",
      "Uncommon",
      "Rare",
      "Epic",
      "Legendary",
    ]

    const statuses: ("active" | "idle" | "learning" | "offline")[] = ["active", "idle", "learning", "offline"]

    return Array.from({ length: 5 }, (_, i) => ({
      id: `agent-${i + 1}`,
      name: `${agentTypes[i % agentTypes.length]}-${Math.floor(Math.random() * 10000)}`,
      type: agentTypes[i % agentTypes.length],
      level: Math.floor(Math.random() * 10) + 1,
      experience: Math.floor(Math.random() * 100),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      rarity: rarities[Math.floor(Math.random() * rarities.length)],
      earnings: Math.floor(Math.random() * 1000) + 100,
      tasks: Math.floor(Math.random() * 100) + 10,
      lastActive: ["Just now", "5 minutes ago", "1 hour ago", "3 hours ago", "1 day ago"][
        Math.floor(Math.random() * 5)
      ],
    }))
  }

  // Generate mock agent activities
  const generateMockAgentActivities = (agents: Agent[]): AgentActivity[] => {
    const activityTypes = ["comment", "prediction", "verification", "security", "analysis", "training", "reward"]

    const activities: AgentActivity[] = []

    for (let i = 0; i < 20; i++) {
      const agent = agents[Math.floor(Math.random() * agents.length)]
      const type = activityTypes[Math.floor(Math.random() * activityTypes.length)]
      const points = Math.floor(Math.random() * 50) + 5
      const earnings = type === "reward" ? Math.floor(Math.random() * 100) + 10 : undefined

      let description = ""
      switch (type) {
        case "comment":
          description = "Added insights to discussion on quantum computing implications"
          break
        case "prediction":
          description = "Submitted prediction for Bitcoin price movement"
          break
        case "verification":
          description = "Verified oracle data for interest rate prediction"
          break
        case "security":
          description = "Detected and neutralized potential security threat"
          break
        case "analysis":
          description = "Performed deep analysis of climate data patterns"
          break
        case "training":
          description = "Completed training module on neural architecture"
          break
        case "reward":
          description = "Earned reward for accurate market prediction"
          break
      }

      activities.push({
        id: `activity-${i}`,
        agentId: agent.id,
        agentName: agent.name,
        type,
        description,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7), // Within the last week
        points,
        earnings,
      })
    }

    // Sort by timestamp (newest first)
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Generate mock network activities
  const generateMockNetworkActivities = (): NetworkActivity[] => {
    const activityTypes = ["consensus", "prediction", "security", "upgrade", "milestone"]

    const categories = ["Technology", "Economics", "Climate", "Politics", "Society"]

    const impacts: ("low" | "medium" | "high")[] = ["low", "medium", "high"]

    const activities: NetworkActivity[] = []

    for (let i = 0; i < 10; i++) {
      const type = activityTypes[Math.floor(Math.random() * activityTypes.length)]
      const category = categories[Math.floor(Math.random() * categories.length)]
      const impact = impacts[Math.floor(Math.random() * impacts.length)]

      let description = ""
      switch (type) {
        case "consensus":
          description = `Network reached 92% consensus on ${category.toLowerCase()} implications`
          break
        case "prediction":
          description = `Collective prediction verified with 87% accuracy for ${category.toLowerCase()} forecast`
          break
        case "security":
          description = "Network security protocol upgraded to quantum-resistant encryption"
          break
        case "upgrade":
          description = "Neural processing capacity increased by 15% across the network"
          break
        case "milestone":
          description = "Network surpassed 10,000 active agents milestone"
          break
      }

      activities.push({
        id: `network-${i}`,
        type,
        description,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7), // Within the last week
        impact,
        category,
      })
    }

    // Sort by timestamp (newest first)
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Generate mock earning periods
  const generateMockEarningPeriods = (): EarningPeriod[] => {
    return [
      { period: "Today", amount: Math.floor(Math.random() * 200) + 50, change: Math.random() * 20 - 5 },
      { period: "This Week", amount: Math.floor(Math.random() * 1000) + 200, change: Math.random() * 15 - 3 },
      { period: "This Month", amount: Math.floor(Math.random() * 5000) + 1000, change: Math.random() * 30 - 10 },
      { period: "All Time", amount: Math.floor(Math.random() * 20000) + 5000, change: 100 },
    ]
  }

  // Get agent icon based on type
  const getAgentIcon = (type: string) => {
    switch (type) {
      case "sentinel":
        return <Shield size={20} className="text-primary" />
      case "oracle":
        return <Sparkles size={20} className="text-primary" />
      case "nexus":
        return <Cpu size={20} className="text-primary" />
      case "phantom":
        return <Zap size={20} className="text-primary" />
      case "architect":
        return <Brain size={20} className="text-primary" />
      default:
        return <Cpu size={20} className="text-primary" />
    }
  }

  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "comment":
        return <MessageSquare size={16} className="text-primary" />
      case "prediction":
        return <LineChart size={16} className="text-primary" />
      case "verification":
        return <Shield size={16} className="text-primary" />
      case "security":
        return <AlertTriangle size={16} className="text-primary" />
      case "analysis":
        return <PieChart size={16} className="text-primary" />
      case "training":
        return <Brain size={16} className="text-primary" />
      case "reward":
        return <Award size={16} className="text-primary" />
      case "consensus":
        return <Users size={16} className="text-primary" />
      case "upgrade":
        return <TrendingUp size={16} className="text-primary" />
      case "milestone":
        return <Flag size={16} className="text-primary" />
      default:
        return <Activity size={16} className="text-primary" />
    }
  }

  // Get status color
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

  // Get rarity color
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

  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "low":
        return "bg-blue-500/10 text-blue-500 border-blue-500/50"
      case "medium":
        return "bg-amber-500/10 text-amber-500 border-amber-500/50"
      case "high":
        return "bg-primary/10 text-primary border-primary/50"
      default:
        return "bg-muted/10 text-muted-foreground border-muted/50"
    }
  }

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`
    } else {
      return "Just now"
    }
  }

  // Format time for chart
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <PageLayout activeTab="dashboard" neuralLinkAgentCount={networkStats.totalAgents}>
      {isLoading ? (
        <div className="h-[80vh] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 size={48} className="animate-spin text-primary mb-4" />
            <div className="text-lg font-medium text-primary mb-2">Establishing Neural Link</div>
            <div className="text-sm text-muted-foreground">
              Connecting to the decentralized intelligence network...
            </div>
          </div>
        </div>
      ) : (
          <div className="space-y-6 px-4 mx-auto">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-primary">Agent Command Center</h1>
                <p className="text-muted-foreground">Monitor your agents' performance and network activity</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="bg-black/80 border-primary/30"
                  onClick={() => router.push("/agents")}
                >
                  <User size={16} className="mr-2" /> My Agents
                </Button>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => router.push("/mint")}
                >
                  <Plus size={16} className="mr-2" /> Mint New Agent
                </Button>
              </div>
            </div>

            {/* Agent Pulse - Real-time Earnings Visualization */}
            <div className="mb-8">
              <CardContainer
                title=""
                description=""
                headerClassName="pb-2"
              >
                <div className="flex justify-between items-center">
                  <CardTitle className="text-primary text-xl">Agent Pulse</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary animate-pulse">
                      Live
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                      <Maximize2 size={16} />
                    </Button>
                  </div>
                </div>
                <CardDescription>Real-time earnings and agent activity</CardDescription>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column - Current earnings */}
                    <div className="space-y-6">
                      <div className="flex flex-col items-center justify-center p-6 border border-primary/30 rounded-lg bg-black/50">
                        <div className="text-sm text-muted-foreground mb-1">Current Earnings</div>
                        <div className="text-4xl font-bold text-primary font-mono flex items-center">
                          <DollarSign size={24} className="mr-1" />
                          {realtimeEarnings.toFixed(4)}
                          <span className="text-sm ml-1 text-primary/70">NEOBOTS</span>
                        </div>
                        <div className="flex items-center text-xs text-green-500 mt-2">
                          <ArrowUpRight size={12} className="mr-1" />
                          <span>+{earningsPerHour.toFixed(2)} NEOBOTS/hour</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border border-primary/30 rounded-lg bg-black/50">
                          <div className="text-xs text-muted-foreground mb-1">Today</div>
                          <div className="text-xl font-bold text-primary font-mono">{todayEarnings.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">NEOBOTS</div>
                        </div>
                        <div className="p-4 border border-primary/30 rounded-lg bg-black/50">
                          <div className="text-xs text-muted-foreground mb-1">Projected</div>
                          <div className="text-xl font-bold text-primary font-mono">{projectedEarnings.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">NEOBOTS/day</div>
                        </div>
                      </div>

                      <div className="p-4 border border-primary/30 rounded-lg bg-black/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium">Active Agents</div>
                          <Badge variant="outline" className="text-xs">
                            {activeAgents}/{agents.length}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {agents
                            .filter((a) => a.status === "active" || a.status === "learning")
                            .map((agent) => (
                              <div key={agent.id} className="flex items-center justify-between text-xs">
                                <div className="flex items-center">
                                  <StatusIndicator status={agent.status} showLabel={false} size="sm" />
                                  <span>{agent.name}</span>
                                </div>
                                <span className="text-primary/70">{(agent.earnings / 100).toFixed(2)} NEOBOTS/hr</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Middle column - Earnings graph */}
                    <div className="lg:col-span-2">
                      <div className="border border-primary/30 rounded-lg bg-black/50 p-4 h-full">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm font-medium">Earnings (Last 24 Hours)</div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                              <BarChart2 size={14} className="mr-1" /> Hourly
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary bg-primary/10">
                              <LineChart size={14} className="mr-1" /> Live
                            </Button>
                          </div>
                        </div>

                        {/* Earnings chart */}
                        <div className="h-[200px] relative">
                          <SVGEarningsChart data={earningsHistory} recentActions={recentActions} />
                        </div>

                        {/* Recent actions list */}
                        <div className="mt-4">
                          <div className="text-xs font-medium mb-2">Recent Actions</div>
                          <div className="space-y-2 max-h-[120px] overflow-y-auto">
                            {recentActions.slice(0, 5).map((action) => (
                              <div
                                key={action.id}
                                className="flex items-center justify-between text-xs p-2 border border-primary/20 rounded bg-black/30"
                              >
                                <div className="flex items-center">
                                  <ActionIcon type={action.type as any} size={16} />
                                  <span className="ml-2">{action.agentName}</span>
                                </div>
                                <div className="flex items-center">
                                  <Badge variant="outline" className="text-primary mr-2">
                                    +{action.earnings.toFixed(3)} NEOBOTS
                                  </Badge>
                                  <span className="text-muted-foreground">{formatTimeAgo(action.timestamp)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CardContainer>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <CardContainer>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Agents</p>
                    <div className="text-2xl font-bold">{agents.length}</div>
                    <div className="text-xs text-muted-foreground mt-1">{activeAgents} active</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users size={20} className="text-primary" />
                  </div>
                </div>
              </CardContainer>

              <CardContainer>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                    <div className="text-2xl font-bold">{totalEarnings} NEOBOTS</div>
                    <div className="flex items-center text-xs text-green-500 mt-1">
                      <ArrowUpRight size={12} className="mr-1" />
                      <span>+{Math.floor(Math.random() * 10) + 5}% this week</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Coins size={20} className="text-primary" />
                  </div>
                </div>
              </CardContainer>

              <CardContainer>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Network Contribution</p>
                    <div className="text-2xl font-bold">{Math.floor(Math.random() * 5000) + 1000} pts</div>
                    <div className="flex items-center text-xs text-green-500 mt-1">
                      <ArrowUpRight size={12} className="mr-1" />
                      <span>Top 15% of contributors</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Network size={20} className="text-primary" />
                  </div>
                </div>
              </CardContainer>

              <CardContainer>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Completed Tasks</p>
                    <div className="text-2xl font-bold">{agents.reduce((sum, agent) => sum + agent.tasks, 0)}</div>
                    <div className="flex items-center text-xs text-green-500 mt-1">
                      <ArrowUpRight size={12} className="mr-1" />
                      <span>{Math.floor(Math.random() * 20) + 5} today</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle size={20} className="text-primary" />
                  </div>
                </div>
              </CardContainer>
            </div>

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Agent Overview */}
              <div className="space-y-6">
                {/* Agent Overview */}
                <CardContainer
                  title=""
                  description=""
                  headerClassName="pb-2"
                  footer={
                    <Button
                      className="w-full bg-primary/20 text-primary hover:bg-primary/30"
                      onClick={() => router.push("/mint")}
                    >
                      <Plus size={16} className="mr-2" /> Mint New Agent
                    </Button>
                  }
                >
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-primary">Your Agents</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10"
                      onClick={() => router.push("/agents")}
                    >
                      View All <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </div>
                  <CardDescription>Status and performance overview</CardDescription>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[300px]">
                      {agents.map((agent) => (
                        <div
                          key={agent.id}
                          className="p-4 border-b border-border hover:bg-secondary/10 cursor-pointer transition-colors"
                          onClick={() => router.push(`/agents?id=${agent.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-black/80 border border-primary/50 flex items-center justify-center">
                              <AgentTypeIcon type={agent.type} size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium truncate">{agent.name}</h3>
                                <RarityBadge rarity={agent.rarity} className="ml-2" />
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <StatusIndicator status={agent.status} showLabel={true} size="sm" />
                                <span className="mx-1">•</span>
                                <span>Lvl {agent.level}</span>
                                <span className="mx-1">•</span>
                                <span>{agent.earnings} NEOBOTS earned</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <ProgressWithLabel value={agent.experience} label="Experience" size="sm" />
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </CardContainer>

                {/* Earnings Overview */}
                <CardContainer
                  title="Earnings Overview"
                  description="Your token earnings over time"
                  footer={
                    <Button
                      className="w-full bg-primary/20 text-primary hover:bg-primary/30"
                      onClick={() => router.push("/claim")}
                    >
                      <Wallet size={16} className="mr-2" /> Claim Tokens
                    </Button>
                  }
                >
                  <div className="space-y-4">
                    {earningPeriods.map((period) => (
                      <div key={period.period} className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium">{period.period}</div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            {period.change > 0 ? (
                              <ArrowUpRight size={12} className="mr-1 text-green-500" />
                            ) : (
                              <ArrowDownRight size={12} className="mr-1 text-red-500" />
                            )}
                            <span className={period.change > 0 ? "text-green-500" : "text-red-500"}>
                              {period.change > 0 ? "+" : ""}
                              {period.change.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-lg font-bold">{period.amount} NEOBOTS</div>
                      </div>
                    ))}
                  </div>

                  {/* Simulated chart */}
                  <div className="mt-6 h-32 w-full bg-secondary/10 rounded-md overflow-hidden relative">
                    <div className="absolute inset-0 flex items-end">
                      {Array.from({ length: 30 }).map((_, i) => {
                        const height = 20 + Math.sin(i * 0.5) * 10 + Math.random() * 50
                        return <div key={i} className="flex-1 bg-primary/80" style={{ height: `${height}%` }} />
                      })}
                    </div>
                  </div>
                </CardContainer>
              </div>

              {/* Middle Column - Agent Activity */}
              <div className="space-y-6">
                <CardContainer title="Agent Activity" description="Recent actions from your agents" contentClassName="p-0">
                  <ScrollArea className="h-[600px]">
                    {agentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-4 border-b border-border hover:bg-secondary/10 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-black/80 border border-primary/50 flex items-center justify-center mt-1">
                            <ActionIcon type={activity.type as any} size={16} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{activity.agentName}</div>
                                <p className="text-sm">{activity.description}</p>
                              </div>
                              {activity.earnings && (
                                <Badge className="bg-primary/10 text-primary border-primary/50">
                                  +{activity.earnings} NEOBOTS
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Clock size={12} className="mr-1" />
                              <span>{formatTimeAgo(activity.timestamp)}</span>
                              <span className="mx-1">•</span>
                              <Badge variant="outline" className="text-xs">
                                +{activity.points} pts
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContainer>
              </div>

              {/* Right Column - Network Activity & Stats */}
              <div className="space-y-6">
                {/* Network Stats */}
                <CardContainer title="Network Status" description="Global intelligence network metrics">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-primary/30 rounded-md text-center">
                      <div className="text-2xl font-bold mb-1">{networkStats.totalAgents.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">TOTAL AGENTS</div>
                    </div>
                    <div className="p-4 border border-primary/30 rounded-md text-center">
                      <div className="text-2xl font-bold mb-1">{networkStats.activeAgents.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">ACTIVE AGENTS</div>
                    </div>
                    <div className="p-4 border border-primary/30 rounded-md text-center">
                      <div className="text-2xl font-bold mb-1">{networkStats.totalQueries.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">TOTAL QUERIES</div>
                    </div>
                    <div className="p-4 border border-primary/30 rounded-md text-center">
                      <div className="text-2xl font-bold mb-1">{networkStats.avgConfidence}%</div>
                      <div className="text-xs text-muted-foreground">AVG CONFIDENCE</div>
                    </div>
                  </div>

                  {/* Network Pulse Visualization */}
                  <div className="mt-6 p-4 border border-primary/30 rounded-md">
                    <div className="text-sm font-medium mb-2">Network Pulse</div>
                    <div className="h-24 flex items-end gap-1">
                      {Array.from({ length: 48 }).map((_, i) => {
                        const height = 20 + Math.sin(i * 0.2) * 20 + Math.random() * 40
                        return (
                          <div key={i} className="flex-1 bg-primary/80 rounded-t" style={{ height: `${height}%` }} />
                        )
                      })}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>48 hours ago</span>
                      <span>Now</span>
                    </div>
                  </div>
                </CardContainer>

                {/* Network Activity */}
                <CardContainer
                  title="Global Activity"
                  description="Recent events across the network"
                  contentClassName="p-0"
                  footer={
                    <Button
                      className="w-full bg-primary/20 text-primary hover:bg-primary/30"
                      onClick={() => router.push("/network")}
                    >
                      <Globe size={16} className="mr-2" /> View Network
                    </Button>
                  }
                >
                  <ScrollArea className="h-[300px]">
                    {networkActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-4 border-b border-border hover:bg-secondary/10 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-black/80 border border-primary/50 flex items-center justify-center mt-1">
                            <ActionIcon type={activity.type as any} size={16} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="text-sm">{activity.description}</p>
                              <Badge className={getImpactColor(activity.impact)}>
                                {activity.impact.charAt(0).toUpperCase() + activity.impact.slice(1)}
                              </Badge>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Clock size={12} className="mr-1" />
                              <span>{formatTimeAgo(activity.timestamp)}</span>
                              <span className="mx-1">•</span>
                              <Badge variant="outline" className="text-xs">
                                {activity.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContainer>
              </div>
            </div>
          </div>
        )}

      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: scale(0.8); }
          20% { opacity: 1; transform: scale(1); }
          80% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.8); }
        }
        
        .network-badge {
          background: rgba(0, 255, 160, 0.1);
          border: 1px solid rgba(0, 255, 160, 0.3);
          color: rgba(0, 255, 160, 0.9);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-family: monospace;
        }
        
        .system-panel {
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(0, 255, 160, 0.3);
          padding: 8px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.7rem;
          min-width: 150px;
        }
        
        .system-header {
          color: rgba(0, 255, 160, 0.9);
          font-size: 0.7rem;
          margin-bottom: 4px;
          text-align: center;
          border-bottom: 1px solid rgba(0, 255, 160, 0.3);
          padding-bottom: 4px;
        }
        
        .status-optimal {
          color: rgba(0, 255, 160, 0.9);
        }
      `}</style>
    </PageLayout>
  )
}

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

function CheckCircle(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function Flag(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  )
}
