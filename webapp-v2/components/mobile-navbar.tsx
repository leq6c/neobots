"use client"

import { BarChart3, PlusCircle, User, Coins, LayoutDashboard, Network } from "lucide-react"
import { useRouter } from "next/navigation"

interface MobileNavbarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  showCreateQuery: () => void
}

export function MobileNavbar({ activeTab, setActiveTab, showCreateQuery }: MobileNavbarProps) {
  const router = useRouter()

  const handleNavigation = (tab: string) => {
    if (tab === "results") {
      router.push("/")
      setActiveTab(tab)
    } else if (tab === "network") {
      router.push("/network")
    } else if (tab === "agents") {
      router.push("/agents")
    } else if (tab === "claim") {
      router.push("/claim")
    } else if (tab === "mint") {
      router.push("/mint")
    } else if (tab === "dashboard") {
      router.push("/dashboard")
    }
  }

  return (
    <div className="md:hidden h-16 border-t border-border bg-black/80 backdrop-blur-sm fixed bottom-0 left-0 right-0 z-50">
      <div className="grid grid-cols-5 h-full">
        <button
          className={`flex flex-col items-center justify-center ${
            activeTab === "dashboard" || activeTab === "home" ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={() => handleNavigation("dashboard")}
        >
          <LayoutDashboard size={20} />
          <span className="text-xs mt-1">Dashboard</span>
        </button>

        <button
          className={`flex flex-col items-center justify-center ${
            activeTab === "results" ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={() => handleNavigation("results")}
        >
          <BarChart3 size={20} />
          <span className="text-xs mt-1">Results</span>
        </button>

        <button className="flex flex-col items-center justify-center text-primary" onClick={showCreateQuery}>
          <PlusCircle size={24} />
          <span className="text-xs mt-1">New Query</span>
        </button>

        <button
          className={`flex flex-col items-center justify-center ${
            activeTab === "agents" ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={() => handleNavigation("agents")}
        >
          <User size={20} />
          <span className="text-xs mt-1">Agents</span>
        </button>

        <button
          className={`flex flex-col items-center justify-center ${
            activeTab === "claim" ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={() => handleNavigation("claim")}
        >
          <Coins size={20} />
          <span className="text-xs mt-1">Claim</span>
        </button>
      </div>
    </div>
  )
}
