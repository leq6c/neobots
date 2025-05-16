"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AggregatedResult } from "@/services/mock-data"
import { TypeIcon } from "@/components/common/TypeIcon"
import { StatusBadge } from "@/components/common/StatusBadge"
import { VerificationBadge } from "@/components/common/VerificationBadge"
import { TimeAgo } from "@/components/common/TimeAgo"

type ResultsListProps = {
  results: AggregatedResult[]
  selectedResult: AggregatedResult | null
  onSelectResult: (result: AggregatedResult) => void
  hasMore: boolean
  onLoadMore: () => void
  page: number
}

export function ResultsList({
  results,
  selectedResult,
  onSelectResult,
  hasMore,
  onLoadMore,
  page,
}: ResultsListProps) {
  return (
    <div className="lg:col-span-1 overflow-auto border border-border rounded-md bg-black/80 p-2 max-h-[500px] hidden lg:block">
      <div className="text-sm font-semibold mb-2 px-2 text-primary">All Queries</div>
      {results.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">No results match the selected filters</div>
      ) : (
        results.map((result) => (
          <div
            key={result.id}
            className={`p-2 mb-2 rounded-md cursor-pointer transition-colors ${
              selectedResult?.id === result.id ? "bg-primary/10 border border-primary/50" : "hover:bg-secondary"
            }`}
            onClick={() => onSelectResult(result)}
          >
            <div className="flex items-center gap-1 mb-1">
              <TypeIcon type={result.type} />
              <Badge variant="outline" className="text-xs">
                {result.category}
              </Badge>
            </div>
            <div className="text-sm mb-1 truncate">{result.query}</div>
            <div className="flex justify-between items-center">
              <TimeAgo date={result.timestamp} />
              <div className="flex items-center gap-2">
                {result.type === "prediction" && result.predictionData ? (
                  <VerificationBadge status={result.predictionData.verificationStatus} />
                ) : (
                  <StatusBadge status={result.status} />
                )}
              </div>
            </div>
          </div>
        ))
      )}

      {/* Show More button */}
      {hasMore && results.length > 0 && (
        <div className="p-2 text-center">
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-black/80 border-primary/30"
            onClick={onLoadMore}
          >
            {page > 1 ? <>Show More Queries</> : <>Load More Queries</>}
          </Button>
        </div>
      )}
    </div>
  )
}
