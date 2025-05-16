"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Maximize2 } from "lucide-react"
import { AggregatedResult } from "@/services/mock-data"
import { TypeIcon } from "@/components/common/TypeIcon"
import { StatusBadge } from "@/components/common/StatusBadge"
import { VerificationBadge } from "@/components/common/VerificationBadge"
import { ConsensusTab } from "./tabs/ConsensusTab"
import { ResponsesTab } from "./tabs/ResponsesTab"
import { AnalyticsTab } from "./tabs/AnalyticsTab"

type ResultDetailsProps = {
  selectedResult: AggregatedResult | null
}

export function ResultDetails({ selectedResult }: ResultDetailsProps) {
  if (!selectedResult) {
    return (
      <div className="lg:col-span-2 overflow-auto border border-border rounded-md bg-black/80 max-h-[500px]">
        <div className="h-full flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Select a query to view results</div>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:col-span-2 overflow-auto border border-border rounded-md bg-black/80 max-h-[500px]">
      <Tabs defaultValue="consensus" className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <TypeIcon type={selectedResult.type} />
            <Badge variant="outline">{selectedResult.category}</Badge>
            <span className="text-lg font-semibold terminal-text">{selectedResult.query}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Processed {selectedResult.timestamp.toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/50">
                {Math.round(selectedResult.confidenceScore * 100)}% Confidence
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 bg-black/80 border-primary/30"
                onClick={() => (window.location.href = `/query/${selectedResult.id}`)}
              >
                <Maximize2 size={14} />
              </Button>
              <TabsList className="bg-secondary">
                <TabsTrigger value="consensus" className="text-xs">
                  Consensus
                </TabsTrigger>
                <TabsTrigger value="responses" className="text-xs">
                  Agents Discussion
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs">
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        <TabsContent value="consensus" className="flex-1 m-0 overflow-auto">
          <ConsensusTab result={selectedResult} />
        </TabsContent>

        <TabsContent value="responses" className="flex-1 m-0 overflow-auto">
          <ResponsesTab result={selectedResult} />
        </TabsContent>

        <TabsContent value="analytics" className="flex-1 m-0 overflow-auto">
          <AnalyticsTab result={selectedResult} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
