"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AggregatedResult } from "@/services/mock-data"

type AnalyticsTabProps = {
  result: AggregatedResult
}

export function AnalyticsTab({ result }: AnalyticsTabProps) {
  return (
    <div className="flex-1 p-4 m-0 overflow-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-black/80 border-primary/30">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-primary">Response Time Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-40 flex items-end gap-1">
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
            <CardTitle className="text-sm text-primary">Confidence Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-40 flex items-end gap-1">
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

        <Card className="bg-black/80 border-primary/30 md:col-span-2">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-primary">Response Category Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-5 gap-4">
              {["Technical", "Analytical", "Predictive", "Ethical", "Strategic"].map((category) => (
                <div key={category} className="flex flex-col items-center">
                  <div className="w-full h-24 bg-secondary rounded-md overflow-hidden">
                    <div
                      className="w-full bg-primary"
                      style={{
                        height: `${Math.floor(Math.random() * 70) + 30}%`,
                        marginTop: `${Math.floor(Math.random() * 30)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs mt-2">{category}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
