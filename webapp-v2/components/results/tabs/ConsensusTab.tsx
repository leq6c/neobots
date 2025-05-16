"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Link2, ExternalLink, AlertTriangle } from "lucide-react"
import { AggregatedResult } from "@/services/mock-data"
import { VerificationBadge } from "@/components/common/VerificationBadge"

type ConsensusTabProps = {
  result: AggregatedResult
}

export function ConsensusTab({ result }: ConsensusTabProps) {
  return (
    <div className="flex-1 p-4 m-0 overflow-auto">
      <Card className="bg-black/80 border-primary/30">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm text-primary">Collective Intelligence Consensus</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="terminal-text">{result.consensus}</div>

          {/* Sources section */}
          {result.sources && result.sources.length > 0 && (
            <Collapsible className="mt-4 border-t border-border pt-3">
              <CollapsibleTrigger className="flex items-center text-xs text-primary hover:underline">
                <Link2 size={12} className="mr-1" /> View Sources ({result.sources.length})
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="space-y-2">
                  {result.sources.map((source) => (
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

          {/* Prediction-specific information */}
          {result.type === "prediction" && result.predictionData && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Target</div>
                  <div className="font-medium">{result.predictionData.target}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Predicted Value</div>
                  <div className="font-medium">{result.predictionData.predictedValue}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Prediction Date</div>
                  <div className="font-medium">
                    {result.predictionData.predictionDate.toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Verification Status</div>
                  <div className="font-medium flex items-center">
                    <VerificationBadge status={result.predictionData.verificationStatus} />
                  </div>
                </div>

                {result.predictionData.actualValue && (
                  <>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Actual Value</div>
                      <div className="font-medium">{result.predictionData.actualValue}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Verification Date</div>
                      <div className="font-medium">
                        {result.predictionData.verificationDate?.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-muted-foreground mb-1">Prediction Accuracy</div>
                      <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(result.predictionData.accuracy || 0) * 100}%` }}
                        />
                      </div>
                      <div className="text-right text-xs mt-1">
                        {Math.round((result.predictionData.accuracy || 0) * 100)}% accurate
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 p-3 bg-secondary/10 rounded-md text-xs">
                <div className="flex items-center text-primary mb-1">
                  <AlertTriangle size={12} className="mr-1" />
                  <span className="font-medium">Oracle Verification</span>
                </div>
                <p>
                  This prediction{" "}
                  {result.predictionData.verificationStatus === "verified"
                    ? "was verified"
                    : "will be verified"}{" "}
                  by decentralized oracle networks using smart contracts.{" "}
                  {result.predictionData.verificationStatus === "pending"
                    ? `Verification scheduled for ${result.predictionData.predictionDate.toLocaleDateString()}.`
                    : "Verification data is stored on-chain and immutable."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card className="bg-black/80 border-primary/30">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-primary">Agreement Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-40 flex items-end gap-1">
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
            <CardTitle className="text-sm text-primary">Regional Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-2">
              {["North America", "Europe", "Asia", "South America", "Africa"].map((region) => (
                <div key={region} className="flex justify-between items-center">
                  <span className="text-xs">{region}</span>
                  <div className="w-24 h-3 bg-secondary rounded-full overflow-hidden">
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
      </div>
    </div>
  )
}
