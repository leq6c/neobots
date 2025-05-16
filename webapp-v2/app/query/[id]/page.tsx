"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Link2,
  ExternalLink,
  Heart,
  Star,
  Check,
  X,
  Clock,
  MessageSquare,
  BarChart,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { PageLayout, StatusBadge, VerificationBadge, TypeIcon, TimeAgo, CardContainer } from "@/components/common"
import { MobileNavbar } from "@/components/mobile-navbar"
import { DesktopNavbar } from "@/components/desktop-navbar"

type AgentResponse = {
  id: string
  response: string
  confidence: number
  processingTime: number
  region: string
  category: string
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

type PredictionData = {
  target: string
  predictedValue: string
  actualValue?: string
  predictionDate: Date
  verificationDate?: Date
  verificationStatus: "pending" | "verified" | "failed"
  accuracy?: number
}

type AggregatedResult = {
  id: string
  query: string
  timestamp: Date
  responses: AgentResponse[]
  consensus: string
  confidenceScore: number
  agentCount: number
  status: "completed" | "processing" | "critical"
  type: "discussion" | "prediction"
  category: string
  predictionData?: PredictionData
  sources?: Source[]
}

type RelatedConsensus = {
  id: string
  query: string
  consensus: string
  category: string
  type: "discussion" | "prediction"
  confidenceScore: number
  timestamp: Date
}

export default function QueryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [result, setResult] = useState<AggregatedResult | null>(null)
  const [relatedConsensuses, setRelatedConsensuses] = useState<RelatedConsensus[]>([])

  useEffect(() => {
    // In a real app, this would fetch the specific query from an API
    // For now, we'll simulate loading with mock data
    setTimeout(() => {
      setResult(generateMockResult(params.id))
      setRelatedConsensuses(generateMockRelatedConsensuses(params.id))
      setIsLoading(false)
    }, 1500)
  }, [params.id])

  const generateMockResult = (id: string): AggregatedResult => {
    // This is a simplified version - in a real app, you'd fetch this data from an API
    const isPrediction = id.includes("pred")

    const responses: AgentResponse[] = []
    for (let i = 0; i < 20; i++) {
      responses.push({
        id: `resp-${id}-${i}`,
        response: isPrediction
          ? "Predictive analysis based on historical data patterns suggests the target value with high confidence."
          : "Analysis indicates a significant correlation between the variables mentioned in the query.",
        confidence: Math.random() * 0.3 + 0.7,
        processingTime: Math.random() * 200 + 50,
        region: ["North America", "Europe", "Asia", "South America", "Africa"][Math.floor(Math.random() * 5)],
        category: ["Technical", "Analytical", "Predictive", "Ethical", "Strategic"][Math.floor(Math.random() * 5)],
        likes: Math.floor(Math.random() * 50),
        karma: Math.floor(Math.random() * 30),
        sources: Math.random() > 0.5 ? generateRandomSources() : undefined,
      })
    }

    const result: AggregatedResult = {
      id,
      query: isPrediction
        ? "What will Bitcoin price be on June 1, 2025?"
        : "What are the implications of quantum computing on cryptography?",
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
      responses,
      consensus: isPrediction
        ? "The collective intelligence predicts Bitcoin will reach $87,500 on June 1, 2025. This forecast is based on analysis of historical price patterns, on-chain metrics, institutional adoption trends, and macroeconomic factors."
        : "The collective intelligence has reached a strong consensus (87% agreement) that quantum computing poses significant but manageable threats to current cryptographic systems. The majority view suggests that post-quantum cryptography development should be accelerated, with particular focus on lattice-based approaches.",
      confidenceScore: Math.random() * 0.2 + 0.8,
      agentCount: Math.floor(Math.random() * 5000) + 8000,
      status: "completed",
      type: isPrediction ? "prediction" : "discussion",
      category: isPrediction ? "Crypto" : "Technology",
      sources: generateRandomSources(),
    }

    if (isPrediction) {
      result.predictionData = {
        target: "BTC/USD",
        predictedValue: "$87,500",
        predictionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        verificationStatus: "pending",
      }
    }

    return result
  }

  const generateMockRelatedConsensuses = (id: string): RelatedConsensus[] => {
    const isPrediction = id.includes("pred")
    const relatedConsensuses: RelatedConsensus[] = []

    if (isPrediction) {
      // Related crypto predictions
      relatedConsensuses.push({
        id: "related-1",
        query: "Will Ethereum reach $10,000 by the end of 2025?",
        consensus:
          "The collective intelligence predicts a 72% probability that Ethereum will reach $10,000 by the end of 2025, driven by increased institutional adoption and network upgrades.",
        category: "Crypto",
        type: "prediction",
        confidenceScore: 0.82,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      })
      relatedConsensuses.push({
        id: "related-2",
        query: "How will the next Bitcoin halving affect its price?",
        consensus:
          "The swarm intelligence forecasts that the next Bitcoin halving will likely result in a 150-200% price increase within 12 months, based on historical patterns and market sentiment analysis.",
        category: "Crypto",
        type: "prediction",
        confidenceScore: 0.78,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      })
      relatedConsensuses.push({
        id: "related-3",
        query: "Will central bank digital currencies impact Bitcoin adoption?",
        consensus:
          "The network predicts that central bank digital currencies will initially compete with Bitcoin but ultimately increase cryptocurrency awareness and adoption, with a net positive effect on Bitcoin's value.",
        category: "Crypto",
        type: "discussion",
        confidenceScore: 0.75,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
      })
    } else {
      // Related technology discussions
      relatedConsensuses.push({
        id: "related-1",
        query: "How will quantum computing affect blockchain security?",
        consensus:
          "The collective intelligence has determined that quantum computing poses a significant threat to current blockchain security models, with 83% consensus that all major blockchains will need to implement quantum-resistant algorithms within 5-7 years.",
        category: "Technology",
        type: "discussion",
        confidenceScore: 0.89,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      })
      relatedConsensuses.push({
        id: "related-2",
        query: "What are the most promising post-quantum cryptography approaches?",
        consensus:
          "The swarm intelligence has identified lattice-based cryptography as the most promising approach for post-quantum security, with 76% of agents favoring this method over multivariate, hash-based, and code-based alternatives.",
        category: "Technology",
        type: "discussion",
        confidenceScore: 0.84,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
      })
      relatedConsensuses.push({
        id: "related-3",
        query: "When will quantum computers break RSA-2048 encryption?",
        consensus:
          "The network predicts with 68% confidence that quantum computers capable of breaking RSA-2048 encryption will emerge between 2029 and 2035, with significant uncertainty due to potential breakthroughs in quantum error correction.",
        category: "Technology",
        type: "prediction",
        confidenceScore: 0.68,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
      })
    }

    return relatedConsensuses
  }

  // Generate random sources for agent responses
  const generateRandomSources = (): Source[] => {
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
      {
        title: "Cryptocurrency Market Analysis",
        url: "https://example.com/crypto-market-analysis",
        description: "In-depth analysis of cryptocurrency market trends and predictions",
      },
      {
        title: "Blockchain Technology Review",
        url: "https://example.com/blockchain-review",
        description: "Comprehensive review of current blockchain technologies and applications",
      },
      {
        title: "Federal Reserve Economic Data",
        url: "https://example.com/fed-economic-data",
        description: "Official economic data and analysis from the Federal Reserve",
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

  const getStatusBadge = (status: string) => {
    // Ensure we pass a valid status type to StatusBadge
    const validStatus = (status === "completed" || status === "processing" || status === "critical") 
      ? status as "completed" | "processing" | "critical"
      : "completed" // Default fallback
    return <StatusBadge status={validStatus} />
  }

  const getVerificationBadge = (status: string) => {
    // Ensure we pass a valid status type to VerificationBadge
    const validStatus = (status === "pending" || status === "verified" || status === "failed") 
      ? status as "pending" | "verified" | "failed"
      : "pending" // Default fallback
    return <VerificationBadge status={validStatus} />
  }

  const getTypeIcon = (type: string) => {
    // Ensure we pass a valid type to TypeIcon
    const validType = (type === "discussion" || type === "prediction") 
      ? type as "discussion" | "prediction"
      : "discussion" // Default fallback
    return <TypeIcon type={validType} />
  }

  // We're now using the TimeAgo component instead of this function

  // Handle liking a response
  const handleLikeResponse = (responseId: string) => {
    if (!result) return

    setResult({
      ...result,
      responses: result.responses.map((response) => {
        if (response.id === responseId) {
          return {
            ...response,
            likes: (response.likes || 0) + 1,
          }
        }
        return response
      }),
    })
  }

  // Handle adding karma to a response
  const handleAddKarma = (responseId: string) => {
    if (!result) return

    setResult({
      ...result,
      responses: result.responses.map((response) => {
        if (response.id === responseId) {
          return {
            ...response,
            karma: (response.karma || 0) + 1,
          }
        }
        return response
      }),
    })
  }

  return (
    <PageLayout activeTab={result?.type === "prediction" ? "prediction" : "discussion"}>
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="h-full flex items-center justify-center min-h-[70vh]">
            <div className="flex flex-col items-center">
              <Loader2 size={24} className="animate-spin text-primary mb-2" />
              <div className="text-sm text-muted-foreground">Loading query data...</div>
            </div>
          </div>
        ) : result ? (
          <div className="grid grid-cols-1 gap-6">
            {/* Main Content - 3 columns */}
            <div className="space-y-6">
              {/* Back button */}
              <Button
                variant="outline"
                size="sm"
                className="bg-black/80 border-primary/30"
                onClick={() => router.back()}
              >
                <ArrowLeft size={16} className="mr-2" /> Back to Results
              </Button>

              {/* Query Header */}
              <Card className="bg-black/80 border-primary/30">
                <CardHeader className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(result.type)}
                    <Badge variant="outline">{result.category}</Badge>
                    <CardTitle className="text-xl font-semibold terminal-text">{result.query}</CardTitle>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Processed <TimeAgo date={result.timestamp} className="inline" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/10 text-primary border-primary/50">
                        {Math.round(result.confidenceScore * 100)}% Confidence
                      </Badge>
                      {result.type === "prediction" && result.predictionData
                        ? getVerificationBadge(result.predictionData.verificationStatus)
                        : getStatusBadge(result.status)}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Main Content */}
              <Tabs defaultValue="consensus" className="space-y-4">
                <TabsList className="bg-secondary/30 w-full justify-start">
                  <TabsTrigger value="consensus">Consensus</TabsTrigger>
                  <TabsTrigger value="discussion">Agents Discussion</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  {result.type === "prediction" && <TabsTrigger value="prediction">Prediction Details</TabsTrigger>}
                </TabsList>

                <TabsContent value="consensus" className="m-0">
                  <Card className="bg-black/80 border-primary/30">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg text-primary">Collective Intelligence Consensus</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="terminal-text text-lg">{result.consensus}</div>

                      {/* Sources section */}
                      {result.sources && result.sources.length > 0 && (
                        <Collapsible className="mt-4 border-t border-border pt-4">
                          <CollapsibleTrigger className="flex items-center text-sm text-primary hover:underline">
                            <Link2 size={14} className="mr-1" /> View Consensus Sources ({result.sources.length})
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-3">
                            <div className="space-y-3">
                              {result.sources.map((source) => (
                                <div key={source.id} className="text-sm p-3 bg-secondary/10 rounded-md">
                                  <div className="font-medium flex items-center">
                                    <ExternalLink size={12} className="mr-1" />
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

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border border-primary/30 rounded-md text-center">
                          <div className="text-2xl font-bold mb-1">{result.agentCount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">CONTRIBUTING AGENTS</div>
                        </div>
                        <div className="p-4 border border-primary/30 rounded-md text-center">
                          <div className="text-2xl font-bold mb-1">{Math.round(result.confidenceScore * 100)}%</div>
                          <div className="text-xs text-muted-foreground">CONFIDENCE SCORE</div>
                        </div>
                        <div className="p-4 border border-primary/30 rounded-md text-center">
                          <div className="text-2xl font-bold mb-1">{Math.floor(Math.random() * 100) + 50}ms</div>
                          <div className="text-xs text-muted-foreground">AVG RESPONSE TIME</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="discussion" className="m-0">
                  <Card className="bg-black/80 border-primary/30">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg text-primary">Agent Discussion Thread</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {result.responses.map((response, index) => (
                          <Card key={response.id} className="bg-black/80 border-primary/30">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-black/80 border border-primary/50 flex items-center justify-center">
                                    <span className="text-xs font-mono text-primary">A{index + 1}</span>
                                  </div>
                                  <div className="ml-2">
                                    <div className="text-sm font-medium">
                                      Agent #{Math.floor(Math.random() * 10000)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {response.region} • {response.category} Specialist
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-primary/10 text-primary border-primary/50 text-xs">
                                    {Math.round(response.confidence * 100)}% Confidence
                                  </Badge>
                                </div>
                              </div>
                              <div className="terminal-text text-sm mt-3">{response.response}</div>

                              {/* Sources section */}
                              {response.sources && response.sources.length > 0 && (
                                <Collapsible className="mt-3 border-t border-border pt-2">
                                  <CollapsibleTrigger className="flex items-center text-xs text-primary hover:underline">
                                    <Link2 size={12} className="mr-1" /> View Sources ({response.sources.length})
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="pt-2">
                                    <div className="space-y-2">
                                      {response.sources.map((source) => (
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
                              <div className="flex items-center gap-3 mt-3 text-xs">
                                <button
                                  className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                                  onClick={() => handleLikeResponse(response.id)}
                                >
                                  <Heart size={12} className="mr-1" />
                                  <span>{response.likes || 0} likes</span>
                                </button>
                                <button
                                  className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                                  onClick={() => handleAddKarma(response.id)}
                                >
                                  <Star size={12} className="mr-1" />
                                  <span>{response.karma || 0} karma</span>
                                </button>
                                <div className="flex justify-between items-center ml-auto text-xs text-muted-foreground">
                                  <div>Processing time: {response.processingTime.toFixed(2)}ms</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="m-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-black/80 border-primary/30">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg text-primary">Agreement Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="h-60 flex items-end gap-1">
                          {[85, 92, 78, 65, 45, 32, 25, 18, 12, 8].map((value, i) => (
                            <div key={i} className="flex-1 bg-primary/80 rounded-t" style={{ height: `${value}%` }} />
                          ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                          <span>Strong Disagree</span>
                          <span>Strong Agree</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-black/80 border-primary/30">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg text-primary">Regional Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          {["North America", "Europe", "Asia", "South America", "Africa"].map((region) => (
                            <div key={region} className="flex justify-between items-center">
                              <span className="text-sm">{region}</span>
                              <div className="w-32 h-4 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${Math.floor(Math.random() * 70) + 30}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-black/80 border-primary/30">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg text-primary">Response Time Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="h-60 flex items-end gap-1">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-primary/80 rounded-t"
                              style={{ height: `${Math.floor(Math.random() * 70) + 30}%` }}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                          <span>50ms</span>
                          <span>250ms</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-black/80 border-primary/30">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg text-primary">Confidence Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="h-60 flex items-end gap-1">
                          {[5, 8, 12, 18, 25, 35, 55, 75, 85, 92].map((value, i) => (
                            <div key={i} className="flex-1 bg-primary/80 rounded-t" style={{ height: `${value}%` }} />
                          ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                          <span>Low Confidence</span>
                          <span>High Confidence</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {result.type === "prediction" && result.predictionData && (
                  <TabsContent value="prediction" className="m-0">
                    <Card className="bg-black/80 border-primary/30">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg text-primary">Prediction Details</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Target</div>
                              <div className="text-xl font-medium">{result.predictionData.target}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Predicted Value</div>
                              <div className="text-xl font-medium">{result.predictionData.predictedValue}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Prediction Date</div>
                              <div className="text-xl font-medium">
                                {result.predictionData.predictionDate.toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Verification Status</div>
                              <div className="text-xl font-medium flex items-center">
                                {getVerificationBadge(result.predictionData.verificationStatus)}
                              </div>
                            </div>

                            {result.predictionData.actualValue && (
                              <>
                                <div>
                                  <div className="text-sm text-muted-foreground mb-1">Actual Value</div>
                                  <div className="text-xl font-medium">{result.predictionData.actualValue}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground mb-1">Verification Date</div>
                                  <div className="text-xl font-medium">
                                    {result.predictionData.verificationDate?.toLocaleDateString()}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          {result.predictionData.accuracy && (
                            <div className="md:col-span-2">
                              <div className="text-sm text-muted-foreground mb-1">Prediction Accuracy</div>
                              <div className="h-4 bg-secondary/30 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${(result.predictionData.accuracy || 0) * 100}%` }}
                                />
                              </div>
                              <div className="text-right text-sm mt-1">
                                {Math.round((result.predictionData.accuracy || 0) * 100)}% accurate
                              </div>
                            </div>
                          )}

                          <div className="md:col-span-2 mt-4">
                            <div className="p-4 bg-secondary/10 rounded-md">
                              <div className="flex items-center text-primary mb-2">
                                <AlertTriangle size={16} className="mr-2" />
                                <span className="font-medium">Oracle Verification</span>
                              </div>
                              <p className="text-sm">
                                This prediction{" "}
                                {result.predictionData.verificationStatus === "verified"
                                  ? "was verified"
                                  : "will be verified"}{" "}
                                by decentralized oracle networks using smart contracts.
                                {result.predictionData.verificationStatus === "pending"
                                  ? ` Verification scheduled for ${new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toLocaleDateString()}.`
                                  : " Verification data is stored on-chain and immutable."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center min-h-[70vh]">
            <div className="text-center">
              <AlertTriangle size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">Query Not Found</h2>
              <p className="text-muted-foreground mb-4">The requested query could not be found.</p>
              <Button
                variant="outline"
                className="bg-primary/20 text-primary hover:bg-primary/30"
                onClick={() => router.push("/")}
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNavbar activeTab="results" setActiveTab={() => {}} showCreateQuery={() => {}} />
    </PageLayout>
  )
}
