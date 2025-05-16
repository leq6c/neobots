"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Cpu, Zap, Shield, Brain, Sparkles, Wallet, AlertCircle, Loader2 } from "lucide-react"
import { PageLayout, CardContainer, RarityBadge, AgentTypeIcon, ProgressWithLabel } from "@/components/common"
import { useRouter } from "next/navigation"

export default function MintPage() {
  const [selectedAgent, setSelectedAgent] = useState("sentinel")
  const [agentName, setAgentName] = useState("")
  const [intelligence, setIntelligence] = useState(70)
  const [security, setSecurity] = useState(50)
  const [speed, setSpeed] = useState(60)
  const [mintingState, setMintingState] = useState<"idle" | "connecting" | "minting" | "confirming" | "success">("idle")
  const [mintProgress, setMintProgress] = useState(0)
  const [walletConnected, setWalletConnected] = useState(false)
  const [mintCost, setMintCost] = useState(0.05)
  const [gasFee, setGasFee] = useState(0.003)

  const router = useRouter()

  // Simulate wallet connection
  const connectWallet = () => {
    setMintingState("connecting")
    setTimeout(() => {
      setWalletConnected(true)
      setMintingState("idle")
    }, 1500)
  }

  // Simulate minting process
  const startMinting = () => {
    if (!walletConnected) {
      connectWallet()
      return
    }

    setMintingState("minting")
    setMintProgress(0)

    const interval = setInterval(() => {
      setMintProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setMintingState("confirming")
          setTimeout(() => {
            setMintingState("success")
          }, 2000)
          return 100
        }
        return prev + 5
      })
    }, 200)
  }

  // Calculate total cost
  const totalCost = mintCost + gasFee

  // Agent types
  const agentTypes = [
    {
      id: "sentinel",
      name: "Sentinel",
      description: "Specialized in security and monitoring. Excellent for network protection and threat detection.",
      baseStats: { intelligence: 70, security: 90, speed: 60 },
      rarity: "Common",
      supply: 10000,
    },
    {
      id: "oracle",
      name: "Oracle",
      description: "Focused on data analysis and prediction. Superior pattern recognition and forecasting abilities.",
      baseStats: { intelligence: 90, security: 60, speed: 50 },
      rarity: "Rare",
      supply: 5000,
    },
    {
      id: "nexus",
      name: "Nexus",
      description: "Balanced agent with networking capabilities. Excels at connecting disparate systems and protocols.",
      baseStats: { intelligence: 75, security: 75, speed: 75 },
      rarity: "Uncommon",
      supply: 7500,
    },
    {
      id: "phantom",
      name: "Phantom",
      description: "Stealth-focused agent with high-speed processing. Ideal for covert operations and rapid response.",
      baseStats: { intelligence: 65, security: 80, speed: 95 },
      rarity: "Epic",
      supply: 2500,
    },
    {
      id: "architect",
      name: "Architect",
      description: "Specialized in system design and optimization. Creates efficient structures and protocols.",
      baseStats: { intelligence: 95, security: 70, speed: 40 },
      rarity: "Legendary",
      supply: 1000,
    },
  ]

  // Get current agent
  const currentAgent = agentTypes.find((agent) => agent.id === selectedAgent) || agentTypes[0]

  // Set initial stats based on selected agent
  useEffect(() => {
    if (currentAgent) {
      setIntelligence(currentAgent.baseStats.intelligence)
      setSecurity(currentAgent.baseStats.security)
      setSpeed(currentAgent.baseStats.speed)
    }
  }, [selectedAgent, currentAgent])

  // Update mint cost based on agent rarity
  useEffect(() => {
    switch (currentAgent.rarity) {
      case "Common":
        setMintCost(0.05)
        break
      case "Uncommon":
        setMintCost(0.08)
        break
      case "Rare":
        setMintCost(0.12)
        break
      case "Epic":
        setMintCost(0.2)
        break
      case "Legendary":
        setMintCost(0.35)
        break
      default:
        setMintCost(0.05)
    }
  }, [currentAgent])

  // Handle agent type selection
  const handleAgentTypeChange = (value: string) => {
    setSelectedAgent(value)
  }

  return (
    <PageLayout activeTab="mint">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Agent Preview */}
        <div>
          <CardContainer
            title="Agent Preview"
            description={`Limited supply: ${currentAgent.supply.toLocaleString()} agents available`}
            headerClassName="flex justify-between items-center"
          >
            <div className="flex justify-between items-center w-full">
              <CardTitle className="text-xl text-primary">Agent Preview</CardTitle>
              <RarityBadge rarity={currentAgent.rarity as any} />
            </div>
            <CardDescription>
              Limited supply: {currentAgent.supply.toLocaleString()} agents available
            </CardDescription>
            <div className="flex flex-col items-center justify-center p-8">
              <div className="w-64 h-64 border border-primary/30 rounded-md flex items-center justify-center mb-6 relative overflow-hidden">
                {/* Agent visualization */}
                <div className="absolute inset-0 grid-bg opacity-50"></div>
                <div className="relative z-10 text-center">
                  <div className="w-32 h-32 rounded-full bg-black/80 border border-primary flex items-center justify-center mb-4 mx-auto">
                    <AgentTypeIcon type={selectedAgent as any} size={64} />
                  </div>
                  <div className="text-lg font-bold terminal-text">
                    {agentName || currentAgent.name} #{Math.floor(Math.random() * 10000)}
                  </div>
                </div>
              </div>

              <div className="w-full space-y-4">
                <ProgressWithLabel value={intelligence} label="Intelligence" />
                <ProgressWithLabel value={security} label="Security" />
                <ProgressWithLabel value={speed} label="Speed" />
              </div>
            </div>
          </CardContainer>
        </div>

        {/* Minting Controls */}
        <div>
          <CardContainer
            title="Mint a New Agent"
            description="Create a unique AI agent to join the decentralized intelligence network"
            footer={
              mintingState !== "success" && (
                !walletConnected ? (
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={connectWallet}
                    disabled={mintingState !== "idle"}
                  >
                    {mintingState === "connecting" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting Wallet
                      </>
                    ) : (
                      <>
                        <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={startMinting}
                    disabled={mintingState !== "idle"}
                  >
                    {mintingState === "minting" || mintingState === "confirming" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Minting Agent
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" /> Mint Agent
                      </>
                    )}
                  </Button>
                )
              )
            }
          >
            {mintingState === "success" ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Agent Successfully Minted!</h3>
                <p className="text-muted-foreground mb-6">
                  Your new agent has been added to the decentralized intelligence network
                </p>
                <div className="p-4 bg-secondary/30 rounded-md terminal-text text-sm mb-6">
                  <div className="flex justify-between mb-2">
                    <span>Transaction Hash:</span>
                    <span className="text-primary">0x7f9e8d7c6b5a4321...</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Block Number:</span>
                    <span>15,782,341</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Used:</span>
                    <span>{gasFee} ETH</span>
                  </div>
                </div>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                  onClick={() => router.push("/")}
                >
                  Return to Dashboard
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="agent-type">Agent Type</Label>
                  <Tabs
                    defaultValue={selectedAgent}
                    value={selectedAgent}
                    onValueChange={handleAgentTypeChange}
                    className="mt-2"
                  >
                    <TabsList className="grid grid-cols-5 bg-secondary/30">
                      {agentTypes.map((agent) => (
                        <TabsTrigger key={agent.id} value={agent.id}>
                          {agent.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <TabsContent value={selectedAgent} className="mt-4">
                      <p className="text-sm text-muted-foreground">{currentAgent.description}</p>
                    </TabsContent>
                  </Tabs>
                </div>

                <div>
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input
                    id="agent-name"
                    placeholder="Enter a name for your agent"
                    className="bg-black/80 border-primary/30 mt-2"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Customize Attributes</Label>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="intelligence">Intelligence</Label>
                        <span className="text-xs">{intelligence}%</span>
                      </div>
                      <Slider
                        id="intelligence"
                        min={50}
                        max={100}
                        step={1}
                        value={[intelligence]}
                        onValueChange={(value) => setIntelligence(value[0])}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="security">Security</Label>
                        <span className="text-xs">{security}%</span>
                      </div>
                      <Slider
                        id="security"
                        min={50}
                        max={100}
                        step={1}
                        value={[security]}
                        onValueChange={(value) => setSecurity(value[0])}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="speed">Speed</Label>
                        <span className="text-xs">{speed}%</span>
                      </div>
                      <Slider
                        id="speed"
                        min={50}
                        max={100}
                        step={1}
                        value={[speed]}
                        onValueChange={(value) => setSpeed(value[0])}
                      />
                    </div>
                  </div>
                </div>

                {mintingState === "minting" && (
                  <div className="space-y-2">
                    <Label>Minting Progress</Label>
                    <Progress value={mintProgress} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">
                      Please wait while your agent is being minted...
                    </p>
                  </div>
                )}

                {mintingState === "confirming" && (
                  <div className="p-4 bg-secondary/30 rounded-md">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm">Waiting for blockchain confirmation...</p>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-secondary/30 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Mint Cost:</span>
                    <span className="text-sm">{mintCost} ETH</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Gas Fee (est.):</span>
                    <span className="text-sm">{gasFee} ETH</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold">{totalCost.toFixed(3)} ETH</span>
                  </div>
                </div>
              </>
            )}
          </CardContainer>

          {walletConnected && mintingState === "idle" && (
            <div className="mt-4 p-4 border border-amber-500/30 rounded-md bg-amber-500/10 flex items-start">
              <AlertCircle size={16} className="text-amber-500 mr-2 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-500">Important Note</p>
                <p className="text-muted-foreground">
                  Minting an agent requires a blockchain transaction. Make sure you have enough ETH in your wallet to
                  cover the mint cost and gas fees.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
