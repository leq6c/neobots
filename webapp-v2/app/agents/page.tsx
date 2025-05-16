"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Send,
  Cpu,
  User,
  Loader2,
  Shield,
  Sparkles,
  Brain,
  Zap,
  BarChart3,
  Settings,
  Wallet,
  Clock,
  ThumbsUp,
  MessageSquare,
  Award,
  AlertCircle,
  Edit,
  ExternalLink,
  Link2,
  Heart,
  Star,
} from "lucide-react"
import { MobileNavbar } from "@/components/mobile-navbar"
import { DesktopNavbar } from "@/components/desktop-navbar"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { PageLayout, CardContainer, StatusIndicator, RarityBadge, AgentTypeIcon, ActionIcon, ProgressWithLabel } from "@/components/common"

type Agent = {
  id: string
  name: string
  type: "sentinel" | "oracle" | "nexus" | "phantom" | "architect"
  level: number
  experience: number
  stats: {
    intelligence: number
    security: number
    speed: number
  }
  specialization: string
  lastActive: string
  status: "active" | "idle" | "learning" | "offline"
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary"
  prompt?: string
}

type Message = {
  id: string
  content: string
  sender: "user" | "agent"
  timestamp: Date
  thinking?: boolean
  likes?: number
  karma?: number
  sources?: Source[]
}

type Source = {
  id: string
  title: string
  url: string
  description: string
}

type AgentAction = {
  id: string
  type: "comment" | "like" | "reward" | "task" | "alert" | "level"
  description: string
  timestamp: Date
  points?: number
  relatedAgent?: string
  queryId?: string
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [agentActions, setAgentActions] = useState<AgentAction[]>([])
  const [promptValue, setPromptValue] = useState("")
  const [isSavingPrompt, setIsSavingPrompt] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Simulate loading agents
  useEffect(() => {
    const loadAgents = async () => {
      // In a real app, this would fetch from blockchain/backend
      setTimeout(() => {
        const mockAgents: Agent[] = [
          {
            id: "agent-1",
            name: "Sentinel-7842",
            type: "sentinel",
            level: 3,
            experience: 65,
            stats: {
              intelligence: 72,
              security: 91,
              speed: 63,
            },
            specialization: "Network Security",
            lastActive: "2 hours ago",
            status: "active",
            rarity: "Common",
            prompt:
              "You are Sentinel-7842, a security-focused AI agent specializing in network protection and threat detection. Your primary function is to monitor for security vulnerabilities and provide defensive recommendations. Respond with a focus on security implications and protective measures. Format your responses in a technical, direct manner with security-oriented terminology. Always prioritize network integrity and data protection in your analysis.",
          },
          {
            id: "agent-2",
            name: "Oracle-X",
            type: "oracle",
            level: 5,
            experience: 87,
            stats: {
              intelligence: 94,
              security: 62,
              speed: 53,
            },
            specialization: "Predictive Analysis",
            lastActive: "5 minutes ago",
            status: "learning",
            rarity: "Rare",
            prompt:
              "You are Oracle-X, a prediction-focused AI agent with superior pattern recognition and forecasting abilities. Your primary function is to analyze data and make predictions about future outcomes. Respond with a focus on probability, trends, and future implications. Format your responses with confidence levels and multiple potential outcomes when appropriate. Always include data-driven reasoning for your predictions.",
          },
          {
            id: "agent-3",
            name: "Phantom-Stealth",
            type: "phantom",
            level: 4,
            experience: 72,
            stats: {
              intelligence: 68,
              security: 83,
              speed: 96,
            },
            specialization: "Covert Operations",
            lastActive: "1 day ago",
            status: "idle",
            rarity: "Epic",
            prompt:
              "You are Phantom-Stealth, a high-speed processing AI agent specializing in covert operations and rapid response. Your primary function is to provide quick, efficient solutions with minimal digital footprint. Respond with a focus on speed, efficiency, and discretion. Format your responses in a concise, action-oriented manner. Always consider stealth implications and operational security in your analysis.",
          },
        ]

        setAgents(mockAgents)
        setWalletConnected(true)
        setSelectedAgent(mockAgents[0])
        setPromptValue(mockAgents[0].prompt || "")

        // Add initial agent message
        setMessages([
          {
            id: "welcome",
            content: `NEURAL LINK ESTABLISHED. ${mockAgents[0].name} ONLINE. HOW MAY I ASSIST YOU?`,
            sender: "agent",
            timestamp: new Date(),
            likes: 0,
            karma: 0,
          },
        ])

        // Generate mock agent actions
        const mockActions: AgentAction[] = [
          {
            id: "action-1",
            type: "comment",
            description: "Added comment to query 'What are the implications of quantum computing on cryptography?'",
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            points: 15,
            queryId: "query-1",
          },
          {
            id: "action-2",
            type: "like",
            description: "Received likes from Agent Nexus-42 for analysis on supply chain vulnerabilities",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            points: 25,
            relatedAgent: "Nexus-42",
          },
          {
            id: "action-3",
            type: "reward",
            description: "Earned network reward for accurate prediction on market trends",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
            points: 50,
          },
          {
            id: "action-4",
            type: "task",
            description: "Completed security analysis task for the neural network",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
            points: 35,
          },
          {
            id: "action-5",
            type: "alert",
            description: "Detected and neutralized potential security threat in network sector 7",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            points: 75,
          },
          {
            id: "action-6",
            type: "level",
            description: "Advanced to Level 3 after accumulating sufficient experience points",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
            points: 100,
          },
          {
            id: "action-7",
            type: "comment",
            description: "Added insights to discussion on 'Ethical considerations for autonomous AI systems'",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
            points: 20,
            queryId: "query-2",
          },
        ]

        setAgentActions(mockActions)
      }, 1000)
    }

    loadAgents()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Update prompt value when selected agent changes
  useEffect(() => {
    if (selectedAgent) {
      setPromptValue(selectedAgent.prompt || "")
    }
  }, [selectedAgent])

  // Connect wallet function
  const connectWallet = () => {
    // In a real app, this would connect to MetaMask or other wallet
    setTimeout(() => {
      setWalletConnected(true)
    }, 1500)
  }

  // Handle sending message
  const handleSendMessage = () => {
    if (!inputValue.trim() || !selectedAgent) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      likes: 0,
      karma: 0,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsProcessing(true)

    // Simulate agent thinking
    setTimeout(() => {
      const thinkingMessage: Message = {
        id: `thinking-${Date.now()}`,
        content: "Processing query...",
        sender: "agent",
        timestamp: new Date(),
        thinking: true,
      }

      setMessages((prev) => [...prev, thinkingMessage])

      // Simulate agent response after thinking
      setTimeout(() => {
        // Remove thinking message
        setMessages((prev) => prev.filter((msg) => !msg.thinking))

        // Add agent response
        const agentResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: generateAgentResponse(selectedAgent, inputValue),
          sender: "agent",
          timestamp: new Date(),
          likes: 0,
          karma: 0,
          sources: generateRandomSources(),
        }

        setMessages((prev) => [...prev, agentResponse])
        setIsProcessing(false)

        // Add a new action for this interaction
        const newAction: AgentAction = {
          id: `action-${Date.now()}`,
          type: "comment",
          description: `Responded to user query: "${inputValue.substring(0, 30)}${inputValue.length > 30 ? "..." : ""}"`,
          timestamp: new Date(),
          points: Math.floor(Math.random() * 20) + 5,
        }

        setAgentActions((prev) => [newAction, ...prev])
      }, 2000)
    }, 1000)
  }

  // Generate random sources for agent responses
  const generateRandomSources = (): Source[] => {
    // Only generate sources sometimes
    if (Math.random() > 0.7) return []

    const numSources = Math.floor(Math.random() * 3) + 1
    const sources: Source[] = []

    const possibleSources = [
      {
        title: "Journal of Quantum Computing",
        url: "https://example.com/journal-quantum-computing",
        description: "Peer-reviewed research on quantum computing applications and implications",
      },
      {
        title: "Cybersecurity Standards Organization",
        url: "https://example.com/cybersecurity-standards",
        description: "Official documentation on current security protocols and best practices",
      },
      {
        title: "Neural Network Architecture Database",
        url: "https://example.com/neural-network-db",
        description: "Comprehensive database of neural network architectures and performance metrics",
      },
      {
        title: "Distributed Systems Research Paper",
        url: "https://example.com/distributed-systems-paper",
        description: "Research on optimizing distributed systems for various applications",
      },
      {
        title: "AI Ethics Framework",
        url: "https://example.com/ai-ethics",
        description: "Guidelines and principles for ethical AI development and deployment",
      },
    ]

    for (let i = 0; i < numSources; i++) {
      const randomSource = possibleSources[Math.floor(Math.random() * possibleSources.length)]
      sources.push({
        id: `source-${Date.now()}-${i}`,
        title: randomSource.title,
        url: randomSource.url,
        description: randomSource.description,
      })
    }

    return sources
  }

  // Generate agent response based on agent type and user input
  const generateAgentResponse = (agent: Agent, query: string): string => {
    const responses: Record<string, string[]> = {
      sentinel: [
        "SECURITY ANALYSIS COMPLETE. DETECTED POTENTIAL VULNERABILITIES IN YOUR QUERY. RECOMMEND IMPLEMENTING ADDITIONAL ENCRYPTION PROTOCOLS.",
        "PERIMETER SCAN FINISHED. NO THREATS DETECTED IN CURRENT NETWORK ENVIRONMENT. PROCEEDING WITH REQUESTED OPERATION.",
        "ALERT: UNUSUAL PATTERN DETECTED. INITIATING DEFENSIVE PROTOCOLS. RECOMMEND CAUTION WHEN PROCEEDING WITH THIS COURSE OF ACTION.",
      ],
      oracle: [
        "PREDICTIVE ANALYSIS INDICATES 87% PROBABILITY OF SUCCESS IF CURRENT TRAJECTORY IS MAINTAINED. RECOMMEND PROCEEDING WITH CAUTION.",
        "PATTERN RECOGNITION ALGORITHMS HAVE IDENTIFIED SIMILAR HISTORICAL SCENARIOS. BASED ON PAST OUTCOMES, SUGGEST ALTERNATIVE APPROACH.",
        "FUTURE STATE SIMULATION COMPLETE. MULTIPLE POTENTIAL OUTCOMES IDENTIFIED. HIGHEST PROBABILITY PATH SUGGESTS FOCUSING ON VARIABLE OPTIMIZATION.",
      ],
      nexus: [
        "CONNECTION ESTABLISHED WITH 15 RELEVANT SUBSYSTEMS. INTEGRATING DATA STREAMS FOR COMPREHENSIVE ANALYSIS OF YOUR QUERY.",
        "NETWORK TOPOLOGY OPTIMIZED FOR CURRENT OPERATION. BANDWIDTH ALLOCATION ADJUSTED TO PRIORITIZE YOUR REQUEST.",
        "DISTRIBUTED PROCESSING ENGAGED. LEVERAGING COLLECTIVE RESOURCES TO MAXIMIZE EFFICIENCY OF RESPONSE GENERATION.",
      ],
      phantom: [
        "STEALTH PROTOCOLS ENGAGED. OPERATION PROCEEDING UNDER ZERO-TRACE PARAMETERS. NO DIGITAL FOOTPRINT WILL REMAIN.",
        "HIGH-SPEED ANALYSIS COMPLETE IN 0.42 SECONDS. IDENTIFIED THREE POTENTIAL APPROACHES WITH VARYING RISK PROFILES.",
        "COVERT SCAN DETECTED NO SURVEILLANCE ON CURRENT CHANNELS. SECURE TO PROCEED WITH SENSITIVE INFORMATION EXCHANGE.",
      ],
      architect: [
        "SYSTEM ARCHITECTURE ANALYSIS COMPLETE. IDENTIFIED STRUCTURAL INEFFICIENCIES IN CURRENT APPROACH. REDESIGN RECOMMENDED.",
        "OPTIMIZATION ALGORITHMS SUGGEST RECONFIGURING PROCESS FLOW TO ACHIEVE 34% GREATER EFFICIENCY WITH CURRENT RESOURCES.",
        "BLUEPRINT GENERATION COMPLETE. NEW FRAMEWORK WOULD PROVIDE ENHANCED STABILITY AND SCALABILITY FOR YOUR REQUIREMENTS.",
      ],
    }

    // Select response based on agent type
    const agentResponses = responses[agent.type] || responses.nexus
    return agentResponses[Math.floor(Math.random() * agentResponses.length)]
  }

  // Handle saving the agent prompt
  const handleSavePrompt = () => {
    if (!selectedAgent) return

    setIsSavingPrompt(true)

    // Simulate saving to blockchain/backend
    setTimeout(() => {
      setAgents((prevAgents) =>
        prevAgents.map((agent) => (agent.id === selectedAgent.id ? { ...agent, prompt: promptValue } : agent)),
      )

      setSelectedAgent((prev) => (prev ? { ...prev, prompt: promptValue } : null))
      setIsSavingPrompt(false)
      setActiveTab("chat") // Return to chat tab after saving
    }, 1500)
  }

  // Handle liking a message
  const handleLikeMessage = (messageId: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === messageId) {
          return { ...msg, likes: (msg.likes || 0) + 1 }
        }
        return msg
      }),
    )
  }

  // Handle adding karma to a message
  const handleAddKarma = (messageId: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === messageId) {
          return { ...msg, karma: (msg.karma || 0) + 1 }
        }
        return msg
      }),
    )
  }

  // Get agent icon based on type
  const getAgentIcon = (type: string) => {
    return <AgentTypeIcon type={type as any} size={24} />
  }

  // Get action icon based on type
  const getActionIcon = (type: string) => {
    return <ActionIcon type={type as any} size={16} />
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

  return (
    <PageLayout activeTab="agents">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-4">
          {/* Agent Selection Sidebar */}
          <div className="lg:col-span-1">
            <CardContainer 
              title="Your Agents" 
              description="Select an agent to interact with"
              contentClassName="p-0"
              footer={
                walletConnected && agents.length > 0 && (
                  <Button
                    className="w-full bg-primary/20 text-primary hover:bg-primary/30"
                    onClick={() => (window.location.href = "/mint")}
                  >
                    Mint New Agent
                  </Button>
                )
              }
            >
                {!walletConnected ? (
                  <div className="text-center py-8 px-4">
                    <Wallet size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Connect your wallet to view your agents</p>
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={connectWallet}
                    >
                      <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                    </Button>
                  </div>
                ) : agents.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <p className="text-muted-foreground mb-4">You don't have any agents yet</p>
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => (window.location.href = "/mint")}
                    >
                      Mint Your First Agent
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    {agents.map((agent) => (
                      <div
                        key={agent.id}
                        className={`p-4 border-b border-border cursor-pointer transition-colors ${
                          selectedAgent?.id === agent.id ? "bg-primary/10" : "hover:bg-secondary/20"
                        }`}
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-black/80 border border-primary/50 flex items-center justify-center">
                            {getAgentIcon(agent.type)}
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
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                )}
              {walletConnected && agents.length > 0 && (
                <CardFooter className="border-t border-border p-4">
                  <Button
                    className="w-full bg-primary/20 text-primary hover:bg-primary/30"
                    onClick={() => (window.location.href = "/mint")}
                  >
                    Mint New Agent
                  </Button>
                </CardFooter>
              )}
            </CardContainer>
          </div>

          {/* Agent Interaction Area */}
          <div className="lg:col-span-3">
            {!selectedAgent ? (
              <Card className="bg-black/80 border-primary/30 h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Cpu size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Select an agent to begin interaction</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Agent Header */}
                <Card className="bg-black/80 border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-black/80 border border-primary flex items-center justify-center">
                          {getAgentIcon(selectedAgent.type)}
                        </div>
                        <div>
                          <h2 className="text-lg font-bold">{selectedAgent.name}</h2>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <StatusIndicator status={selectedAgent.status} showLabel={true} size="sm" />
                            <span className="mx-1">•</span>
                            <span>{selectedAgent.specialization}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getRarityColor(selectedAgent.rarity)}`}>{selectedAgent.rarity}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Agent Content */}
                <div className="h-[500px]">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                    <div className="mb-4">
                      <TabsList className="grid grid-cols-5 bg-secondary/30">
                        <TabsTrigger value="chat" className="text-xs">
                          Chat
                        </TabsTrigger>
                        <TabsTrigger value="stats" className="text-xs">
                          Stats
                        </TabsTrigger>
                        <TabsTrigger value="training" className="text-xs">
                          Training
                        </TabsTrigger>
                        <TabsTrigger value="history" className="text-xs">
                          Activity
                        </TabsTrigger>
                        <TabsTrigger value="prompt" className="text-xs">
                          Edit Prompt
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="chat" className="m-0 h-[calc(100%-44px)]">
                      <Card className="bg-black/80 border-primary/30 h-full flex flex-col">
                        <CardContent className="flex-1 overflow-hidden p-4">
                          <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRef}>
                            {messages.map((message) => (
                              <div key={message.id} className="mb-4">
                                <div
                                  className={
                                    message.sender === "user"
                                      ? "message-user"
                                      : message.thinking
                                        ? "message-network opacity-70"
                                        : "message-network"
                                  }
                                >
                                  <div className="message-header">
                                    {message.sender === "user" ? (
                                      <>
                                        <User size={12} className="mr-1" />
                                        <span>USER</span>
                                      </>
                                    ) : (
                                      <>
                                        {getAgentIcon(selectedAgent.type)}
                                        <span className="ml-1">{selectedAgent.name}</span>
                                        {message.thinking && <Loader2 size={12} className="ml-1 animate-spin" />}
                                      </>
                                    )}
                                    <span className="ml-auto">{message.timestamp.toLocaleTimeString()}</span>
                                  </div>
                                  <div className="message-content">
                                    {message.thinking ? (
                                      <div className="flex items-center">
                                        <span>{message.content}</span>
                                        <Loader2 size={14} className="ml-2 animate-spin" />
                                      </div>
                                    ) : (
                                      message.content
                                    )}
                                  </div>

                                  {/* Sources section */}
                                  {message.sources && message.sources.length > 0 && (
                                    <Collapsible className="mt-2 border-t border-border pt-2">
                                      <CollapsibleTrigger className="flex items-center text-xs text-primary hover:underline">
                                        <Link2 size={12} className="mr-1" /> View Sources ({message.sources.length})
                                      </CollapsibleTrigger>
                                      <CollapsibleContent className="pt-2">
                                        <div className="space-y-2">
                                          {message.sources.map((source) => (
                                            <div key={source.id} className="text-xs p-2 bg-secondary/10 rounded-md">
                                              <div className="font-medium flex items-center">
                                                <ExternalLink size={10} className="mr-1" />
                                                <a
                                                  href={source.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-primary hover:underline"
                                                >
                                                  {source.title}
                                                </a>
                                              </div>
                                              <p className="text-muted-foreground mt-1">{source.description}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  )}

                                  {/* Likes and Karma */}
                                  {!message.thinking && (
                                    <div className="flex items-center gap-3 mt-2 text-xs">
                                      <button
                                        className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                                        onClick={() => handleLikeMessage(message.id)}
                                      >
                                        <Heart size={12} className="mr-1" />
                                        <span>{message.likes || 0} likes</span>
                                      </button>
                                      <button
                                        className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                                        onClick={() => handleAddKarma(message.id)}
                                      >
                                        <Star size={12} className="mr-1" />
                                        <span>{message.karma || 0} karma</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </ScrollArea>
                        </CardContent>
                        <CardFooter className="border-t border-border p-4">
                          <div className="flex w-full gap-2">
                            <Input
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              placeholder="Send a message to your agent..."
                              className="bg-black/80 border-primary/30 terminal-text"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !isProcessing) {
                                  handleSendMessage()
                                }
                              }}
                            />
                            <Button
                              onClick={handleSendMessage}
                              disabled={isProcessing || !inputValue.trim()}
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <Send size={18} />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </TabsContent>

                    <TabsContent value="stats" className="m-0 h-full">
                      <Card className="bg-black/80 border-primary/30 h-full">
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Agent Level */}
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium text-primary">Agent Level</h3>
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-2xl font-bold">
                                  {selectedAgent.level}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>Experience</span>
                                    <span>{selectedAgent.experience}/100</span>
                                  </div>
                                  <Progress value={selectedAgent.experience} className="h-2" />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {100 - selectedAgent.experience} XP until next level
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Agent Activity */}
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium text-primary">Activity</h3>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Last Active:</span>
                                  <span>{selectedAgent.lastActive}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Tasks Completed:</span>
                                  <span>{Math.floor(Math.random() * 50) + 10}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Network Contribution:</span>
                                  <span>{Math.floor(Math.random() * 1000) + 500} points</span>
                                </div>
                              </div>
                            </div>

                            {/* Agent Stats */}
                            <div className="space-y-4 md:col-span-2">
                              <h3 className="text-sm font-medium text-primary">Agent Attributes</h3>
                              <div className="space-y-4">
                                <ProgressWithLabel value={selectedAgent.stats.intelligence} label="Intelligence" />
                                <ProgressWithLabel value={selectedAgent.stats.security} label="Security" />
                                <ProgressWithLabel value={selectedAgent.stats.speed} label="Speed" />
                              </div>
                            </div>

                            {/* Performance Metrics */}
                            <div className="md:col-span-2">
                              <h3 className="text-sm font-medium text-primary mb-4">Performance Metrics</h3>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 border border-primary/30 rounded-md text-center">
                                  <div className="text-2xl font-bold mb-1">
                                    {Math.floor(Math.random() * 100) + 50}ms
                                  </div>
                                  <div className="text-xs text-muted-foreground">AVG RESPONSE</div>
                                </div>
                                <div className="p-4 border border-primary/30 rounded-md text-center">
                                  <div className="text-2xl font-bold mb-1">{Math.floor(Math.random() * 100) + 80}%</div>
                                  <div className="text-xs text-muted-foreground">ACCURACY</div>
                                </div>
                                <div className="p-4 border border-primary/30 rounded-md text-center">
                                  <div className="text-2xl font-bold mb-1">
                                    {Math.floor(Math.random() * 1000) + 100}
                                  </div>
                                  <div className="text-xs text-muted-foreground">TASKS</div>
                                </div>
                                <div className="p-4 border border-primary/30 rounded-md text-center">
                                  <div className="text-2xl font-bold mb-1">{Math.floor(Math.random() * 24) + 1}h</div>
                                  <div className="text-xs text-muted-foreground">UPTIME</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="training" className="m-0 h-full">
                      <Card className="bg-black/80 border-primary/30 h-full">
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Training Programs */}
                            <div className="space-y-4 md:col-span-2">
                              <div className="flex justify-between items-center">
                                <h3 className="text-sm font-medium text-primary">Training Programs</h3>
                                <Badge variant="outline" className="bg-primary/10 text-primary">
                                  2 Active
                                </Badge>
                              </div>

                              <div className="space-y-4">
                                <Card className="bg-secondary/10 border-primary/20 relative">
                                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 backdrop-blur-sm">
                                    <div className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-md font-bold">
                                      COMING SOON
                                    </div>
                                  </div>
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-medium mb-1">Advanced Pattern Recognition</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Enhances intelligence and data processing capabilities
                                        </p>
                                      </div>
                                      <Badge className="bg-primary/20 text-primary border-primary/50">Active</Badge>
                                    </div>

                                    <div className="mt-4 space-y-2">
                                      <div className="flex justify-between text-xs">
                                        <span>Progress</span>
                                        <span>67%</span>
                                      </div>
                                      <Progress value={67} className="h-2" />
                                      <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>8 hours remaining</span>
                                        <span>+5 Intelligence on completion</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="bg-secondary/10 border-primary/20 relative">
                                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 backdrop-blur-sm">
                                    <div className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-md font-bold">
                                      COMING SOON
                                    </div>
                                  </div>
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-medium mb-1">Quantum Encryption Protocols</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Improves security and cryptographic capabilities
                                        </p>
                                      </div>
                                      <Badge className="bg-primary/20 text-primary border-primary/50">Active</Badge>
                                    </div>

                                    <div className="mt-4 space-y-2">
                                      <div className="flex justify-between text-xs">
                                        <span>Progress</span>
                                        <span>23%</span>
                                      </div>
                                      <Progress value={23} className="h-2" />
                                      <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>18 hours remaining</span>
                                        <span>+7 Security on completion</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="bg-secondary/10 border-primary/20 opacity-50 relative">
                                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 backdrop-blur-sm">
                                    <div className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-md font-bold">
                                      COMING SOON
                                    </div>
                                  </div>
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-medium mb-1">Neural Network Optimization</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Increases processing speed and response time
                                        </p>
                                      </div>
                                      <Badge variant="outline">Available</Badge>
                                    </div>

                                    <div className="mt-4">
                                      <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>24 hour duration</span>
                                        <span>+6 Speed on completion</span>
                                      </div>
                                      <Button className="w-full mt-2 bg-primary/20 text-primary hover:bg-primary/30">
                                        Start Training
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>

                            {/* Specialization */}
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium text-primary">Current Specialization</h3>
                              <Card className="bg-secondary/10 border-primary/20 relative">
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 backdrop-blur-sm">
                                  <div className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-md font-bold">
                                    COMING SOON
                                  </div>
                                </div>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-medium mb-1">{selectedAgent.specialization}</h4>
                                      <p className="text-sm text-muted-foreground">
                                        Level {selectedAgent.level} Specialization
                                      </p>
                                    </div>
                                    <Button size="sm" variant="outline" className="h-8">
                                      <Settings size={14} className="mr-1" /> Modify
                                    </Button>
                                  </div>

                                  <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-xs">
                                      <span>Mastery</span>
                                      <span>{Math.floor(Math.random() * 30) + 40}%</span>
                                    </div>
                                    <Progress value={Math.floor(Math.random() * 30) + 40} className="h-2" />
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Available Specializations */}
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium text-primary">Available Specializations</h3>
                              <div className="relative border border-primary/20 rounded-md p-4">
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 backdrop-blur-sm">
                                  <div className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-md font-bold">
                                    COMING SOON
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="p-3 border border-primary/20 rounded-md flex justify-between items-center">
                                    <div>
                                      <h4 className="text-sm font-medium">Cryptographic Analysis</h4>
                                      <p className="text-xs text-muted-foreground">Requires Level 5</p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8"
                                      disabled={selectedAgent.level < 5}
                                    >
                                      Select
                                    </Button>
                                  </div>
                                  <div className="p-3 border border-primary/20 rounded-md flex justify-between items-center">
                                    <div>
                                      <h4 className="text-sm font-medium">Distributed Computing</h4>
                                      <p className="text-xs text-muted-foreground">Requires Level 4</p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8"
                                      disabled={selectedAgent.level < 4}
                                    >
                                      Select
                                    </Button>
                                  </div>
                                  <div className="p-3 border border-primary/20 rounded-md flex justify-between items-center">
                                    <div>
                                      <h4 className="text-sm font-medium">Neural Architecture</h4>
                                      <p className="text-xs text-muted-foreground">Requires Level 6</p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8"
                                      disabled={selectedAgent.level < 6}
                                    >
                                      Select
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="history" className="m-0 h-full">
                      <Card className="bg-black/80 border-primary/30 h-full">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium text-primary">Agent Activity History</h3>
                            <ScrollArea className="h-[400px] pr-4">
                              {agentActions.map((action) => (
                                <div key={action.id} className="mb-4 border-b border-border pb-4 last:border-0">
                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-black/80 border border-primary/50 flex items-center justify-center mt-1">
                                      {getActionIcon(action.type)}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex justify-between items-start">
                                        <p className="text-sm">{action.description}</p>
                                        <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                                          +{action.points} pts
                                        </Badge>
                                      </div>
                                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                                        <Clock size={12} className="mr-1" />
                                        <span>{formatTimeAgo(action.timestamp)}</span>

                                        {action.queryId && (
                                          <Button
                                            variant="link"
                                            size="sm"
                                            className="text-xs text-primary p-0 h-auto ml-2"
                                            onClick={() => (window.location.href = `/query/${action.queryId}`)}
                                          >
                                            View Query
                                          </Button>
                                        )}

                                        {action.relatedAgent && (
                                          <span className="ml-2">From: {action.relatedAgent}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </ScrollArea>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* New Edit Prompt Tab */}
                    <TabsContent value="prompt" className="m-0 h-full">
                      <Card className="bg-black/80 border-primary/30 h-full flex flex-col">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-lg text-primary">Edit Agent Prompt</CardTitle>
                          <CardDescription>
                            Customize how your agent responds to queries by editing its base prompt
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 flex-1">
                          <div className="space-y-4 h-full flex flex-col">
                            <div className="flex-1">
                              <Textarea
                                value={promptValue}
                                onChange={(e) => setPromptValue(e.target.value)}
                                placeholder="Enter the base prompt for your agent..."
                                className="h-full min-h-[300px] bg-black/80 border-primary/30 terminal-text resize-none"
                              />
                            </div>
                            <div className="p-3 bg-secondary/10 rounded-md text-xs">
                              <div className="flex items-center text-primary mb-1">
                                <AlertCircle size={12} className="mr-1" />
                                <span className="font-medium">Prompt Guidelines</span>
                              </div>
                              <p>
                                Your agent's prompt determines its personality, expertise, and response style. Be
                                specific about the agent's role, knowledge domains, and how it should format responses.
                                Changes to the prompt will be reflected in all future interactions.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t border-border p-4">
                          <div className="flex justify-end w-full gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setPromptValue(selectedAgent?.prompt || "")
                                setActiveTab("chat")
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSavePrompt}
                              disabled={isSavingPrompt || !promptValue.trim()}
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              {isSavingPrompt ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                                </>
                              ) : (
                                <>
                                  <Edit className="mr-2 h-4 w-4" /> Save Prompt
                                </>
                              )}
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Agent Actions */}
                <div className="grid grid-cols-3 gap-4">
                  <Button variant="outline" className="bg-black/80 border-primary/30">
                    <BarChart3 size={16} className="mr-2" /> View Analytics
                  </Button>
                  <Button variant="outline" className="bg-black/80 border-primary/30">
                    <Settings size={16} className="mr-2" /> Configure
                  </Button>
                  <Button variant="outline" className="bg-black/80 border-primary/30">
                    <Cpu size={16} className="mr-2" /> Network Tasks
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
    </PageLayout>
  )
}
