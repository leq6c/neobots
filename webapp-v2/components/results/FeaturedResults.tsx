"use client"

import { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link2, Users, TrendingUp, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { AggregatedResult } from "@/services/mock-data"
import { TypeIcon } from "@/components/common/TypeIcon"
import { StatusBadge } from "@/components/common/StatusBadge"
import { VerificationBadge } from "@/components/common/VerificationBadge"
import { TimeAgo } from "@/components/common/TimeAgo"

type FeaturedResultsProps = {
  featuredResults: AggregatedResult[]
  onSelectResult: (result: AggregatedResult) => void
}

export function FeaturedResults({ featuredResults, onSelectResult }: FeaturedResultsProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const featuredScrollRef = useRef<HTMLDivElement>(null)

  const handleScrollLeft = () => {
    if (featuredScrollRef.current) {
      const newPosition = Math.max(0, scrollPosition - 300)
      featuredScrollRef.current.scrollTo({ left: newPosition, behavior: "smooth" })
      setScrollPosition(newPosition)
    }
  }

  const handleScrollRight = () => {
    if (featuredScrollRef.current) {
      const newPosition = scrollPosition + 300
      featuredScrollRef.current.scrollTo({ left: newPosition, behavior: "smooth" })
      setScrollPosition(newPosition)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-primary">Recent Collective Consensus</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-black/80 border-primary/30"
            onClick={handleScrollLeft}
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-black/80 border-primary/30"
            onClick={handleScrollRight}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
      <div className="relative">
        <div
          className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar"
          style={{ scrollBehavior: "smooth" }}
          ref={featuredScrollRef}
        >
          {featuredResults.map((result) => (
            <Card
              key={result.id}
              className={`bg-black/80 border-primary/30 hover:border-primary/50 transition-colors cursor-pointer flex-shrink-0 w-[300px]`}
              onClick={() => onSelectResult(result)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <TypeIcon type={result.type} />
                    <Badge variant="outline" className="mr-1">
                      {result.category}
                    </Badge>
                    <Clock size={14} className="text-muted-foreground ml-1 mr-1" />
                    <TimeAgo date={result.timestamp} />
                  </div>
                  {result.type === "prediction" && result.predictionData ? (
                    <VerificationBadge status={result.predictionData.verificationStatus} />
                  ) : (
                    <StatusBadge status={result.status} />
                  )}
                </div>
                <h3 className="font-medium mb-2 line-clamp-2">{result.query}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{result.consensus}</p>

                {/* Sources indicator */}
                {result.sources && result.sources.length > 0 && (
                  <div className="flex items-center text-xs text-primary mb-2">
                    <Link2 size={10} className="mr-1" />
                    <span>
                      {result.sources.length} source{result.sources.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center">
                    <Users size={12} className="mr-1" />
                    <span>{result.agentCount.toLocaleString()} agents</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp size={12} className="mr-1 text-primary" />
                    <span className="text-primary">{Math.round(result.confidenceScore * 100)}% confidence</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add custom styles for horizontal scrolling */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
