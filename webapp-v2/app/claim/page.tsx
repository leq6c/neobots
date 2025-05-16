"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Wallet, Loader2, CheckCircle2, Clock, AlertCircle, ArrowUpRight } from "lucide-react"
import { PageLayout, CardContainer, ProgressWithLabel } from "@/components/common"

export default function ClaimPage() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [claimingState, setClaimingState] = useState<"idle" | "connecting" | "claiming" | "confirming" | "success">(
    "idle",
  )
  const [claimProgress, setClaimProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("available")
  const [tokenBalance, setTokenBalance] = useState({
    nbt: 0,
    staked: 0,
    pending: 0,
  })

  // Simulate wallet connection
  const connectWallet = () => {
    setClaimingState("connecting")
    setTimeout(() => {
      setWalletConnected(true)
      setClaimingState("idle")
      // Set some initial token data
      setTokenBalance({
        nbt: 250,
        staked: 1000,
        pending: 75,
      })
    }, 1500)
  }

  // Simulate claiming process
  const startClaiming = () => {
    if (!walletConnected) {
      connectWallet()
      return
    }

    setClaimingState("claiming")
    setClaimProgress(0)

    const interval = setInterval(() => {
      setClaimProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setClaimingState("confirming")
          setTimeout(() => {
            setClaimingState("success")
            // Update token balance after successful claim
            setTokenBalance((prev) => ({
              ...prev,
              nbt: prev.nbt + prev.pending,
              pending: 0,
            }))
          }, 2000)
          return 100
        }
        return prev + 5
      })
    }, 200)
  }

  // Available claims data
  const availableClaims = [
    {
      id: "daily-reward",
      title: "Daily Participation Reward",
      amount: 25,
      status: "ready",
      description: "Reward for daily participation in the network",
      expiresIn: "23 hours",
    },
    {
      id: "agent-contribution",
      title: "Agent Contribution Reward",
      amount: 50,
      status: "ready",
      description: "Reward for your agents' contributions to the network",
      expiresIn: "3 days",
    },
    {
      id: "staking-reward",
      title: "Staking Reward",
      amount: 0,
      status: "pending",
      description: "Reward for staking NEOBOTS tokens",
      progress: 65,
      nextReward: "8 hours",
    },
  ]

  // Transaction history
  const transactionHistory = [
    {
      id: "tx-1",
      type: "Claim",
      amount: 75,
      timestamp: "2023-05-04 14:32",
      status: "Confirmed",
      txHash: "0x8f7e6d5c4b3a2910...",
    },
    {
      id: "tx-2",
      type: "Stake",
      amount: 500,
      timestamp: "2023-05-03 09:15",
      status: "Confirmed",
      txHash: "0x1a2b3c4d5e6f7890...",
    },
    {
      id: "tx-3",
      type: "Claim",
      amount: 100,
      timestamp: "2023-05-01 18:45",
      status: "Confirmed",
      txHash: "0x9876543210abcdef...",
    },
    {
      id: "tx-4",
      type: "Mint",
      amount: -150,
      timestamp: "2023-04-28 11:20",
      status: "Confirmed",
      txHash: "0xfedcba9876543210...",
    },
    {
      id: "tx-5",
      type: "Claim",
      amount: 50,
      timestamp: "2023-04-25 16:10",
      status: "Confirmed",
      txHash: "0x0123456789abcdef...",
    },
  ]

  return (
    <PageLayout activeTab="claim">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
        {/* Token Balance */}
        <div>
          <CardContainer
            title="Token Balance"
            description="Your NEOBOTS token holdings"
            footer={
              !walletConnected && (
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={connectWallet}
                  disabled={claimingState === "connecting"}
                >
                  {claimingState === "connecting" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting Wallet
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                    </>
                  )}
                </Button>
              )
            }
          >
            {!walletConnected ? (
              <div className="text-center py-8">
                <Wallet size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Connect your wallet to view your token balance</p>
              </div>
            ) : (
              <>
                <div className="p-6 border border-primary/30 rounded-md text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{tokenBalance.nbt}</div>
                  <div className="text-sm text-muted-foreground">NEOBOTS TOKENS</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-primary/30 rounded-md text-center">
                    <div className="text-2xl font-bold mb-1">{tokenBalance.staked}</div>
                    <div className="text-xs text-muted-foreground">STAKED</div>
                  </div>
                  <div className="p-4 border border-primary/30 rounded-md text-center">
                    <div className="text-2xl font-bold mb-1">{tokenBalance.pending}</div>
                    <div className="text-xs text-muted-foreground">PENDING</div>
                  </div>
                </div>

                <div className="p-4 bg-secondary/30 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Token Price:</span>
                    <span className="text-sm">$0.42 USD</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Value:</span>
                    <span className="text-sm">${(tokenBalance.nbt * 0.42).toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-sm">Network Rank:</span>
                    <span className="text-sm">Top 15%</span>
                  </div>
                </div>
              </>
            )}
          </CardContainer>

          {walletConnected && claimingState === "success" && (
            <CardContainer title="Claim Successful" className="mt-6">
              <div className="text-center py-4">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-primary" />
                <p className="text-lg font-bold mb-2">Tokens Claimed Successfully!</p>
                <p className="text-muted-foreground mb-4">
                  {tokenBalance.pending + 75} NEOBOTS tokens have been added to your balance
                </p>
                <div className="p-4 bg-secondary/30 rounded-md terminal-text text-sm">
                  <div className="flex justify-between mb-2">
                    <span>Transaction Hash:</span>
                    <span className="text-primary">0x3f2e1d0c9b8a7654...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Block Number:</span>
                    <span>15,782,342</span>
                  </div>
                </div>
              </div>
            </CardContainer>
          )}
        </div>

        {/* Claims and History */}
        <div className="lg:col-span-2">
          <CardContainer title="NEOBOTS Tokens" description="Claim rewards and view transaction history">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 bg-secondary/30">
                <TabsTrigger value="available">Available Claims</TabsTrigger>
                <TabsTrigger value="history">Transaction History</TabsTrigger>
              </TabsList>

              <TabsContent value="available" className="mt-4 space-y-4">
                {!walletConnected ? (
                  <div className="text-center py-8">
                    <Wallet size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Connect your wallet to view available claims</p>
                  </div>
                ) : claimingState === "claiming" || claimingState === "confirming" ? (
                  <div className="text-center py-8">
                    <div className="space-y-4">
                      <Loader2 size={48} className="mx-auto animate-spin text-primary" />
                      <p className="font-medium">
                        {claimingState === "claiming" ? "Processing Claim..." : "Confirming Transaction..."}
                      </p>
                      {claimingState === "claiming" && (
                        <>
                          <Progress value={claimProgress} className="h-2 max-w-md mx-auto" />
                          <p className="text-sm text-muted-foreground">
                            Please wait while your tokens are being claimed
                          </p>
                        </>
                      )}
                      {claimingState === "confirming" && (
                        <p className="text-sm text-muted-foreground">Waiting for blockchain confirmation...</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {availableClaims.map((claim) => (
                      <CardContainer key={claim.id} className="bg-secondary/10 border-primary/20">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium mb-1">{claim.title}</h3>
                            <p className="text-sm text-muted-foreground">{claim.description}</p>
                          </div>
                          <Badge
                            className={
                              claim.status === "ready"
                                ? "bg-primary/20 text-primary border-primary/50"
                                : "bg-amber-500/20 text-amber-500 border-amber-500/50"
                            }
                          >
                            {claim.status === "ready" ? "Ready to Claim" : "In Progress"}
                          </Badge>
                        </div>

                        <div className="mt-4">
                          {claim.status === "ready" ? (
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <Clock size={14} className="mr-1 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Expires in {claim.expiresIn}</span>
                              </div>
                              <div className="text-lg font-bold text-primary">{claim.amount} NEOBOTS</div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {claim.status === "pending" && claim.progress !== undefined && (
                                <ProgressWithLabel value={claim.progress} label="Progress" size="sm" />
                              )}
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <Clock size={14} className="mr-1 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {claim.status === "ready" ? `Expires in ${claim.expiresIn}` : `Next reward in ${claim.nextReward}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContainer>
                    ))}

                    <div className="flex justify-between items-center p-4 border border-primary/30 rounded-md">
                      <div>
                        <p className="font-medium">Total Available</p>
                        <p className="text-2xl font-bold text-primary">
                          {availableClaims
                            .filter((claim) => claim.status === "ready")
                            .reduce((sum, claim) => sum + claim.amount, 0)}{" "}
                          NEOBOTS
                        </p>
                      </div>
                      <Button
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={startClaiming}
                        disabled={
                          availableClaims.filter((claim) => claim.status === "ready").length === 0 ||
                          claimingState !== "idle"
                        }
                      >
                        Claim All Tokens
                      </Button>
                    </div>

                    <div className="p-4 border border-amber-500/30 rounded-md bg-amber-500/10 flex items-start">
                      <AlertCircle size={16} className="text-amber-500 mr-2 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-500">Claim Frequency</p>
                        <p className="text-muted-foreground">
                          Tokens can be claimed once every 24 hours. Unclaimed tokens will expire after 7 days.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                {!walletConnected ? (
                  <div className="text-center py-8">
                    <Wallet size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Connect your wallet to view transaction history</p>
                  </div>
                ) : (
                  <div className="rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead className="hidden md:table-cell">Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactionHistory.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell>{tx.type}</TableCell>
                            <TableCell className={tx.amount < 0 ? "text-destructive" : "text-primary"}>
                              {tx.amount > 0 ? "+" : ""}
                              {tx.amount} NEOBOTS
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{tx.timestamp}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  tx.status === "Confirmed"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-amber-500/10 text-amber-500"
                                }
                              >
                                {tx.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ArrowUpRight size={14} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContainer>
        </div>
      </div>
    </PageLayout>
  )
}
