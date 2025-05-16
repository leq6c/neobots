"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { 
  AggregatedResult, 
  generateMockResults, 
  getFeaturedResults, 
  filterResults, 
  getUniqueCategories 
} from "@/services/mock-data"
import { ResultsFilters } from "./ResultsFilters"
import { FeaturedResults } from "./FeaturedResults"
import { ResultsList } from "./ResultsList"
import { ResultDetails } from "./ResultDetails"

export function ResultsView() {
  const [isLoading, setIsLoading] = useState(true)
  const [results, setResults] = useState<AggregatedResult[]>([])
  const [selectedResult, setSelectedResult] = useState<AggregatedResult | null>(null)
  const [featuredResults, setFeaturedResults] = useState<AggregatedResult[]>([])
  const [activeType, setActiveType] = useState<"all" | "discussion" | "prediction">("all")
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [discussionCategories, setDiscussionCategories] = useState<string[]>([])

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      const mockResults = generateMockResults()
      setResults(mockResults)
      setSelectedResult(mockResults[0])

      // Set featured results (top 6 with highest confidence)
      setFeaturedResults(getFeaturedResults(mockResults))

      // Get unique discussion categories
      setDiscussionCategories(getUniqueCategories(mockResults, "discussion"))

      setIsLoading(false)
    }, 0)
  }, [])

  // Filter results based on active type and category
  const filteredResults = filterResults(results, activeType, activeCategory)

  // Handle load more results
  const handleLoadMore = () => {
    // Simulate loading more results
    setTimeout(() => {
      if (page >= 3) {
        setHasMore(false)
        return
      }

      const newResults = generateMockResults()
      setResults((prev) => [...prev, ...newResults])
      setPage((prev) => prev + 1)
    }, 1000)
  }

  return (
    <div className="h-full p-4 pt-2 overflow-auto">
      {isLoading ? (
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 size={24} className="animate-spin text-primary mb-2" />
            <div className="text-sm text-muted-foreground">Loading collective intelligence data...</div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 pb-20 md:pb-4">
          {/* Category Filters */}
          <ResultsFilters
            activeType={activeType}
            setActiveType={setActiveType}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            discussionCategories={discussionCategories}
          />

          {/* Featured Consensus Section */}
          <FeaturedResults 
            featuredResults={featuredResults} 
            onSelectResult={setSelectedResult} 
          />

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Query List */}
            <ResultsList
              results={filteredResults}
              selectedResult={selectedResult}
              onSelectResult={setSelectedResult}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              page={page}
            />

            {/* Result Details */}
            <ResultDetails selectedResult={selectedResult} />
          </div>
        </div>
      )}
    </div>
  )
}
