"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AggregatedResult } from "@/services/mock-data"

type ResponsesTabProps = {
  result: AggregatedResult
}

export function ResponsesTab({ result }: ResponsesTabProps) {
  return (
    <div className="flex-1 p-4 m-0 overflow-auto">
      <div className="grid grid-cols-1 gap-4">
        {result.responses.map((response) => (
          <Card key={response.id} className="bg-black/80 border-primary/30">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="text-xs">
                  {response.category}
                </Badge>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-primary/50 text-xs">
                    {Math.round(response.confidence * 100)}%
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {response.region}
                  </Badge>
                </div>
              </div>
              <div className="terminal-text text-sm">{response.response}</div>
              <div className="text-xs text-muted-foreground mt-2">
                Processing time: {response.processingTime.toFixed(2)}ms
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
