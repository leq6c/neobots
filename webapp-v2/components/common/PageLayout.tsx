"use client"

import { ReactNode } from "react"
import { DesktopNavbar } from "@/components/desktop-navbar"
import { MobileNavbar } from "@/components/mobile-navbar"
import { NeuralLinkStatus } from "./NeuralLinkStatus"

type PageLayoutProps = {
  children: ReactNode
  activeTab?: string
  setActiveTab?: (tab: string) => void
  showCreateQuery?: () => void
  className?: string
  neuralLinkAgentCount?: number
  isConnected?: boolean
}

export function PageLayout({
  children,
  activeTab = "home",
  setActiveTab = () => {},
  showCreateQuery = () => {},
  className = "",
  neuralLinkAgentCount = 12458,
  isConnected = true,
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-black grid-bg scanline ${className}`}>
      {/* Desktop Navigation */}
      <DesktopNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Header with status */}
      <NeuralLinkStatus isConnected={isConnected} agentCount={neuralLinkAgentCount} />

      {/* Main Content */}
      <div className="w-full mx-auto pt-14 pb-16 md:pb-4 md:pl-20 lg:pl-20 h-full">
        <div className="h-full">
        {children}
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavbar activeTab={activeTab} setActiveTab={setActiveTab} showCreateQuery={showCreateQuery} />
    </div>
  )
}
