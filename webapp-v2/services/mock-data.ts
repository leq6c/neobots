// Mock data types and generation for the results view
// This file centralizes all mock data generation to make future API implementation easier

export type AgentResponse = {
  id: string
  response: string
  confidence: number
  processingTime: number
  region: string
  category: string
}

export type PredictionData = {
  target: string
  predictedValue: string
  actualValue?: string
  predictionDate: Date
  verificationDate?: Date
  verificationStatus: "pending" | "verified" | "failed"
  accuracy?: number
}

export type Source = {
  id: string
  title: string
  url: string
  description: string
}

export type AggregatedResult = {
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

// Generate random sources for consensus
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

const generateMockResponse = (query: string): string => {
  const responses = [
    "Analysis indicates a significant correlation between the variables mentioned in the query. Further investigation recommended.",
    "Based on historical data patterns, the projected outcome shows a 78% probability of alignment with the hypothesis presented in the query.",
    "The collective intelligence has determined that multiple perspectives must be considered. The majority view suggests a nuanced approach.",
    "Swarm analysis reveals emergent patterns not visible through individual analysis. The consensus indicates a novel solution path.",
    "Distributed processing has identified potential edge cases that require special consideration before proceeding with implementation.",
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

const generateMockPredictionResponse = (query: string): string => {
  const responses = [
    "Predictive analysis based on historical price movements, market sentiment, and on-chain metrics suggests the target value with 82% confidence.",
    "Time series forecasting combined with sentiment analysis from 12,458 data sources indicates the predicted outcome is most probable.",
    "Multi-model ensemble prediction incorporating macroeconomic factors, technical indicators, and market psychology converges on the stated value.",
    "Bayesian probability assessment using distributed agent consensus mechanism indicates the predicted outcome has the highest likelihood.",
    "Quantum-inspired prediction algorithm analyzing 1.2TB of relevant data points suggests the forecasted value with strong confidence.",
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

const generateMockConsensus = (query: string): string => {
  const consensusResponses = [
    "The collective intelligence has reached a strong consensus (87% agreement) that quantum computing poses significant but manageable threats to current cryptographic systems. The majority view suggests that post-quantum cryptography development should be accelerated, with particular focus on lattice-based approaches.",
    "Network analysis indicates 92% agreement that distributed system optimization for low-latency applications requires a multi-faceted approach combining edge computing, optimized data structures, and predictive caching mechanisms tailored to specific use cases.",
    "Ethical analysis shows 76% consensus that autonomous AI systems require robust oversight frameworks that balance innovation with safety. The collective recommends transparent decision-making processes and clear accountability structures.",
    "Climate impact assessment shows 89% agreement that global food security will face severe disruption within the next decade. The collective intelligence suggests diversification of crop varieties and localized food production systems as primary mitigation strategies.",
    "Supply chain vulnerability analysis indicates 84% consensus that current global supply networks contain critical single points of failure. The collective recommends redundancy in essential components and geographical diversification of manufacturing capabilities.",
    "Political analysis reveals 81% consensus that the upcoming election will result in a divided government, with economic policy gridlock being the most likely outcome. The collective suggests this will lead to market volatility in the short term.",
    "Market analysis shows 85% agreement that recent central bank policies will lead to increased asset price inflation while having limited impact on consumer price indices. The collective predicts technology and healthcare sectors will outperform.",
    "Societal impact assessment indicates 79% consensus that increasing automation will require fundamental restructuring of education and labor systems within the next decade. The collective recommends universal basic income pilots and skills-based education reforms.",
  ]

  // Return a consensus that somewhat matches the query
  if (query.includes("quantum")) return consensusResponses[0]
  if (query.includes("distributed") && query.includes("latency")) return consensusResponses[1]
  if (query.includes("ethical")) return consensusResponses[2]
  if (query.includes("climate")) return consensusResponses[3]
  if (query.includes("supply chain")) return consensusResponses[4]
  if (query.includes("election")) return consensusResponses[5]
  if (query.includes("central bank") || query.includes("markets")) return consensusResponses[6]
  if (query.includes("automation") || query.includes("societal")) return consensusResponses[7]
  return consensusResponses[Math.floor(Math.random() * consensusResponses.length)]
}

const generateMockPredictionConsensus = (prediction: any): string => {
  if (prediction.target.includes("BTC")) {
    return `The collective intelligence predicts Bitcoin will reach ${prediction.predictedValue} on June 1, 2025. This forecast is based on analysis of historical price patterns, on-chain metrics, institutional adoption trends, and macroeconomic factors. The prediction has been verified by 12,458 agents with 83% consensus. Smart contract oracle verification is scheduled for June 1, 2025.`
  } else if (prediction.target.includes("ETH")) {
    return `The swarm intelligence predicted with 78% probability that Ethereum's price would increase by more than 20% within 30 days after the PoS merge. This prediction has been VERIFIED by oracle data showing a 24.3% increase in the specified timeframe. The prediction accuracy has been recorded on-chain and rewards distributed to contributing agents.`
  } else if (prediction.target.includes("Fed")) {
    return `Collective analysis of economic indicators, Federal Reserve communications, and inflation metrics suggests a 65% probability that the Federal Reserve will raise interest rates in Q3 2025. The prediction incorporates data from 15,782 financial time series and semantic analysis of 3,421 Fed statements. Oracle verification is scheduled for September 30, 2025.`
  } else {
    return `The decentralized prediction network forecasts global temperature increase will reach ${prediction.predictedValue} compared to pre-industrial levels in 2025. This prediction synthesizes climate models, satellite data, and ocean temperature measurements from 8,745 monitoring stations. Verification will occur via smart contract connected to official climate data oracles in January 2026.`
  }
}

export const generateMockResults = (): AggregatedResult[] => {
  const discussionQueries = [
    {
      query: "What are the implications of quantum computing on cryptography?",
      category: "Technology",
    },
    {
      query: "How can we optimize distributed systems for low-latency applications?",
      category: "Technology",
    },
    {
      query: "What are the ethical considerations for autonomous AI systems?",
      category: "Ethics",
    },
    {
      query: "How might climate change affect global food security in the next decade?",
      category: "Environment",
    },
    {
      query: "What strategies can mitigate supply chain vulnerabilities in global crises?",
      category: "Economics",
    },
    {
      query: "What are the most likely outcomes of the upcoming election?",
      category: "Politics",
    },
    {
      query: "How will recent central bank policies affect global markets?",
      category: "Markets",
    },
    {
      query: "What are the societal implications of increasing automation?",
      category: "Society",
    },
  ]

  const predictionQueries = [
    {
      query: "What will Bitcoin price be on June 1, 2025?",
      target: "BTC/USD",
      predictedValue: "$87,500",
      predictionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
    },
    {
      query: "Will Ethereum merge to PoS increase its price by more than 20% within 30 days?",
      target: "ETH Price Change",
      predictedValue: "Yes (78% probability)",
      predictionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
      actualValue: "Yes (+24.3%)",
      verificationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      verificationStatus: "verified",
      accuracy: 0.78,
    },
    {
      query: "Will the Federal Reserve raise interest rates in Q3 2025?",
      target: "Fed Interest Rate Decision",
      predictedValue: "Yes (65% probability)",
      predictionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
    },
    {
      query: "What will be the average global temperature increase in 2025 compared to pre-industrial levels?",
      target: "Global Temperature Increase",
      predictedValue: "1.28°C",
      predictionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45), // 45 days ago
    },
  ]

  const allResults: AggregatedResult[] = []

  // Generate discussion results
  discussionQueries.forEach((item, index) => {
    const responseCount = Math.floor(Math.random() * 5000) + 8000
    const responses: AgentResponse[] = []

    for (let i = 0; i < 20; i++) {
      responses.push({
        id: `resp-disc-${index}-${i}`,
        response: generateMockResponse(item.query),
        confidence: Math.random() * 0.3 + 0.7,
        processingTime: Math.random() * 200 + 50,
        region: ["North America", "Europe", "Asia", "South America", "Africa"][Math.floor(Math.random() * 5)],
        category: ["Technical", "Analytical", "Predictive", "Ethical", "Strategic"][Math.floor(Math.random() * 5)],
      })
    }

    allResults.push({
      id: `result-disc-${index}-${Date.now()}`,
      query: item.query,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7), // Within the last week
      responses,
      consensus: generateMockConsensus(item.query),
      confidenceScore: Math.random() * 0.2 + 0.8,
      agentCount: Math.floor(Math.random() * 5000) + 8000,
      status: Math.random() > 0.9 ? "critical" : Math.random() > 0.8 ? "processing" : "completed",
      type: "discussion",
      category: item.category,
      sources: Math.random() > 0.3 ? generateRandomSources() : undefined,
    })
  })

  // Generate prediction results
  predictionQueries.forEach((item, index) => {
    const responseCount = Math.floor(Math.random() * 5000) + 8000
    const responses: AgentResponse[] = []

    for (let i = 0; i < 20; i++) {
      responses.push({
        id: `resp-pred-${index}-${i}`,
        response: generateMockPredictionResponse(item.query),
        confidence: Math.random() * 0.3 + 0.7,
        processingTime: Math.random() * 200 + 50,
        region: ["North America", "Europe", "Asia", "South America", "Africa"][Math.floor(Math.random() * 5)],
        category: ["Technical", "Analytical", "Predictive", "Ethical", "Strategic"][Math.floor(Math.random() * 5)],
      })
    }

    const predictionData: PredictionData = {
      target: item.target,
      predictedValue: item.predictedValue,
      predictionDate: item.predictionDate,
      verificationStatus: item.verificationDate ? "verified" : "pending",
    }

    if (item.actualValue) {
      predictionData.actualValue = item.actualValue
      predictionData.verificationDate = item.verificationDate
      predictionData.verificationStatus = (item.verificationStatus as "pending" | "verified" | "failed") || "verified"
      predictionData.accuracy = item.accuracy || Math.random() * 0.3 + 0.7
    }

    allResults.push({
      id: `result-pred-${index}-${Date.now()}`,
      query: item.query,
      timestamp: item.predictionDate,
      responses,
      consensus: generateMockPredictionConsensus(item),
      confidenceScore: Math.random() * 0.2 + 0.8,
      agentCount: Math.floor(Math.random() * 5000) + 8000,
      status: "completed",
      type: "prediction",
      category:
        item.target.includes("BTC") || item.target.includes("ETH")
          ? "Crypto"
          : item.target.includes("Fed")
            ? "Economics"
            : item.target.includes("Temperature")
              ? "Climate"
              : "General",
      predictionData,
      sources: Math.random() > 0.3 ? generateRandomSources() : undefined,
    })
  })

  return allResults
}

// Export a function to get featured results
export const getFeaturedResults = (results: AggregatedResult[]): AggregatedResult[] => {
  return [...results].sort((a, b) => b.confidenceScore - a.confidenceScore).slice(0, 6)
}

// Export a function to filter results
export const filterResults = (
  results: AggregatedResult[],
  activeType: "all" | "discussion" | "prediction",
  activeCategory: string
): AggregatedResult[] => {
  return results.filter((result) => {
    if (activeType !== "all" && result.type !== activeType) return false
    if (activeCategory !== "all" && result.category !== activeCategory) return false
    return true
  })
}

// Export a function to get unique categories
export const getUniqueCategories = (results: AggregatedResult[], type: "discussion" | "prediction"): string[] => {
  return [...new Set(results.filter((r) => r.type === type).map((r) => r.category))]
}

// Format time ago
export const formatTimeAgo = (date: Date): string => {
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
