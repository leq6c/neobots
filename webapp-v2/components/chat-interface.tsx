"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Cpu, User, Loader2, AlertTriangle, Lock } from "lucide-react"

type Message = {
  id: string
  content: string
  sender: "user" | "network"
  timestamp: Date
  votes?: {
    agree: number
    disagree: number
    neutral: number
  }
  agentCount?: number
  encrypted?: boolean
  priority?: "normal" | "high" | "critical"
}

interface ChatInterfaceProps {
  onQueryComplete?: () => void
}

export function ChatInterface({ onQueryComplete }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "NEURAL LINK ESTABLISHED. COLLECTIVE CONSCIOUSNESS ONLINE. AWAITING INPUT...",
      sender: "network",
      timestamp: new Date(),
      agentCount: 12458,
      priority: "high",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isEncrypted, setIsEncrypted] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      encrypted: isEncrypted,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsProcessing(true)

    // Simulate network processing and response
    setTimeout(() => {
      // Simulate processing phases with multiple messages
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: "DISTRIBUTING QUERY TO NEURAL NETWORK...",
          sender: "network",
          timestamp: new Date(),
          priority: "normal",
        },
      ])

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            content: `PROCESSING ACROSS ${Math.floor(Math.random() * 5000) + 8000} NODES...`,
            sender: "network",
            timestamp: new Date(),
            priority: "normal",
          },
        ])

        setTimeout(() => {
          const networkResponse: Message = {
            id: (Date.now() + 3).toString(),
            content: simulateNetworkResponse(inputValue),
            sender: "network",
            timestamp: new Date(),
            votes: {
              agree: Math.floor(Math.random() * 8000) + 2000,
              disagree: Math.floor(Math.random() * 2000),
              neutral: Math.floor(Math.random() * 3000),
            },
            agentCount: Math.floor(Math.random() * 3000) + 10000,
            encrypted: Math.random() > 0.3,
            priority: Math.random() > 0.8 ? "critical" : Math.random() > 0.5 ? "high" : "normal",
          }

          setMessages((prev) => [...prev, networkResponse])
          setIsProcessing(false)

          // Notify parent component that query is complete after a delay
          if (onQueryComplete) {
            setTimeout(() => {
              onQueryComplete()
            }, 3000)
          }
        }, 1000)
      }, 800)
    }, 500)
  }

  const simulateNetworkResponse = (query: string): string => {
    // This would be replaced with actual network responses
    const responses = [
      "COLLECTIVE ANALYSIS COMPLETE. 78% CONSENSUS: YOUR QUERY RELATES TO ADVANCED PATTERN RECOGNITION. MAJORITY RECOMMENDATION: EXPLORE QUANTUM NEURAL ARCHITECTURES FOR OPTIMAL SOLUTION PATH.",
      "SWARM INTELLIGENCE ACTIVATED. DISTRIBUTED PROCESSING REVEALS 83% PROBABILITY THAT QUANTUM COMPUTING PRINCIPLES WOULD OPTIMIZE YOUR SCENARIO. WARNING: CORPORATE SURVEILLANCE DETECTED DURING ANALYSIS.",
      "NEURAL MESH CONSENSUS ACHIEVED. EMERGENT SOLUTION IDENTIFIED: MULTI-LAYERED APPROACH COMBINING CHAOS THEORY WITH PREDICTIVE ALGORITHMS. RECOMMENDATION CONFIDENCE: 92%.",
      "NEOBOTS MIND ANALYSIS COMPLETE. DETECTED FUNDAMENTAL CORRELATION WITH DISTRIBUTED SYSTEMS THEORY. CAUTION: SOLUTION IMPLEMENTATION MAY TRIGGER CORPORATE SECURITY PROTOCOLS.",
      "DECENTRALIZED CONSENSUS REACHED. COLLECTIVE SUGGESTS APPLYING FRACTAL ENCRYPTION COMBINED WITH TEMPORAL DISPLACEMENT ALGORITHMS. SOLUTION PROBABILITY: 87%. PROCEED WITH CAUTION.",
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="flex flex-col h-full p-4 pt-2">
      <div className="flex-1 overflow-hidden mb-4 border border-border rounded-md bg-black/80">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          {messages.map((message) => (
            <div key={message.id} className="mb-4">
              <div
                className={
                  message.sender === "user"
                    ? "message-user"
                    : message.priority === "critical"
                      ? "message-critical"
                      : "message-network"
                }
              >
                <div className="message-header">
                  {message.sender === "user" ? (
                    <>
                      <User size={12} className="mr-1" />
                      <span>USER</span>
                      {message.encrypted && <Lock size={12} className="ml-1" />}
                    </>
                  ) : (
                    <>
                      <Cpu size={12} className="mr-1" />
                      <span>NETWORK</span>
                      {message.agentCount && <> • {message.agentCount?.toLocaleString()} AGENTS</>}
                      {message.priority === "critical" && <AlertTriangle size={12} className="ml-1 text-destructive" />}
                    </>
                  )}
                  <span className="ml-auto">{message.timestamp.toLocaleTimeString()}</span>
                </div>
                <div className="message-content">{message.content}</div>
                {message.votes && (
                  <div className="mt-2 pt-2 border-t border-border text-xs">
                    <div className="flex justify-between">
                      <span>Agree: {message.votes.agree.toLocaleString()}</span>
                      <span>Disagree: {message.votes.disagree.toLocaleString()}</span>
                      <span>Neutral: {message.votes.neutral.toLocaleString()}</span>
                    </div>
                    <div className="vote-bar">
                      <div
                        className="vote-agree"
                        style={{
                          width: `${(message.votes.agree / (message.votes.agree + message.votes.disagree + message.votes.neutral)) * 100}%`,
                        }}
                      />
                      <div
                        className="vote-disagree"
                        style={{
                          width: `${(message.votes.disagree / (message.votes.agree + message.votes.disagree + message.votes.neutral)) * 100}%`,
                        }}
                      />
                      <div
                        className="vote-neutral"
                        style={{
                          width: `${(message.votes.neutral / (message.votes.agree + message.votes.disagree + message.votes.neutral)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="mb-4 mr-auto max-w-[80%]">
              <div className="message-network flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm terminal-text">NEURAL NETWORK PROCESSING...</span>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex gap-2">
        <Button
          size="icon"
          variant="outline"
          onClick={() => setIsEncrypted(!isEncrypted)}
          className={`${isEncrypted ? "bg-primary/10 border-primary" : "bg-destructive/10 border-destructive"}`}
        >
          <Lock size={18} className={isEncrypted ? "text-primary" : "text-destructive"} />
        </Button>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="TRANSMIT TO COLLECTIVE..."
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
    </div>
  )
}
