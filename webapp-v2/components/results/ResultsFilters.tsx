"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, BarChart } from "lucide-react"

type ResultsFiltersProps = {
  activeType: "all" | "discussion" | "prediction"
  setActiveType: (type: "all" | "discussion" | "prediction") => void
  activeCategory: string
  setActiveCategory: (category: string) => void
  discussionCategories: string[]
  predictionCategories?: string[]
}

export function ResultsFilters({
  activeType,
  setActiveType,
  activeCategory,
  setActiveCategory,
  discussionCategories,
  predictionCategories = ["Crypto", "Economics", "Climate", "General"],
}: ResultsFiltersProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Button
          variant={activeType === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setActiveType("all")
            setActiveCategory("all")
          }}
          className={activeType === "all" ? "bg-primary text-primary-foreground" : ""}
        >
          All
        </Button>
        <Button
          variant={activeType === "discussion" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setActiveType("discussion")
            setActiveCategory("all")
          }}
          className={activeType === "discussion" ? "bg-primary text-primary-foreground" : ""}
        >
          <MessageSquare size={14} className="mr-1" /> Discussion
        </Button>
        <Button
          variant={activeType === "prediction" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setActiveType("prediction")
            setActiveCategory("all")
          }}
          className={activeType === "prediction" ? "bg-primary text-primary-foreground" : ""}
        >
          <BarChart size={14} className="mr-1" /> Prediction
        </Button>
      </div>

      {activeType !== "all" && (
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge
            className={`cursor-pointer ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 hover:bg-secondary/70 text-foreground"
            }`}
            onClick={() => setActiveCategory("all")}
          >
            All Categories
          </Badge>

          {activeType === "discussion"
            ? discussionCategories.map((category) => (
                <Badge
                  key={category}
                  className={`cursor-pointer ${
                    activeCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 hover:bg-secondary/70 text-foreground"
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Badge>
              ))
            : predictionCategories.map((category) => (
                <Badge
                  key={category}
                  className={`cursor-pointer ${
                    activeCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 hover:bg-secondary/70 text-foreground"
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Badge>
              ))}
        </div>
      )}
    </div>
  )
}
