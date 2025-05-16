"use client"

import { SVGNetworkVisualization } from "@/components/svg-network-visualization"
import { PageLayout } from "@/components/common"

export default function NetworkPage() {
  return (
    <PageLayout activeTab="network" className="h-[100dvh] overflow-hidden">
      <div className="flex-1 overflow-auto -mt-12 -mb-16 md:-mb-4">
        <SVGNetworkVisualization />
      </div>
    </PageLayout>
  )
}
