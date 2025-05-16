"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Network,
  User,
  Coins,
  PlusCircle,
  Menu,
  X,
  Settings,
  LogOut,
  HelpCircle,
  Home,
  LayoutDashboard,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DesktopNavbarProps {
  activeTab?: string
  setActiveTab?: (tab: string) => void
}

export function DesktopNavbar({ activeTab = "results", setActiveTab }: DesktopNavbarProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  console.log(activeTab);

  const handleTabChange = (tab: string) => {
    if (setActiveTab) {
      setActiveTab(tab)
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 bg-black/90 border-r border-primary/30 z-40 transition-all duration-300 ${
          isExpanded ? "w-64" : "w-20"
        }`}
      >
        <div className={`flex items-center ${isExpanded ? "justify-between" : "justify-center"} p-4 border-b border-primary/30`}>
          {isExpanded ? (
            <h1 className="text-xl font-bold text-primary">NEOBOTS MIND</h1>
          ) : (
            <div className="hidden"></div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary hover:bg-primary/10"
          >
            {isExpanded ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>

        <div className="flex-1 py-4">
          <div className="space-y-2 px-3">
            <Button
              variant="ghost"
              className={`w-full justify-${
                isExpanded ? "start" : "center"
              } ${activeTab === "dashboard" ? "text-primary bg-primary/10" : "text-muted-foreground"} hover:text-primary hover:bg-primary/10`}
              onClick={() => router.push("/dashboard")}
            >
              <LayoutDashboard size={20} className={isExpanded ? "mr-2" : ""} />
              {isExpanded && <span>Dashboard</span>}
            </Button>

            <Button
              variant="ghost"
              className={`w-full justify-${
                isExpanded ? "start" : "center"
              } ${activeTab === "home" ? "text-primary bg-primary/10" : "text-muted-foreground"} hover:text-primary hover:bg-primary/10`}
              onClick={() => router.push("/")}
            >
              <Home size={20} className={isExpanded ? "mr-2" : ""} />
              {isExpanded && <span>Home</span>}
            </Button>

            <Button
              variant="ghost"
              className={`w-full justify-${
                isExpanded ? "start" : "center"
              } ${activeTab === "network" ? "text-primary bg-primary/10" : "text-muted-foreground"} hover:text-primary hover:bg-primary/10`}
              onClick={() => router.push("/network")}
            >
              <Network size={20} className={isExpanded ? "mr-2" : ""} />
              {isExpanded && <span>Network</span>}
            </Button>

            <Button
              variant="ghost"
              className={`w-full justify-${
                isExpanded ? "start" : "center"
              } ${activeTab === "agents" ? "text-primary bg-primary/10" : "text-muted-foreground"} hover:text-primary hover:bg-primary/10`}
              onClick={() => router.push("/agents")}
            >
              <User size={20} className={isExpanded ? "mr-2" : ""} />
              {isExpanded && <span>My Agents</span>}
            </Button>

            <Button
              variant="ghost"
              className={`w-full justify-${
                isExpanded ? "start" : "center"
              } ${activeTab === "claim" ? "text-primary bg-primary/10" : "text-muted-foreground"} hover:text-primary hover:bg-primary/10`}
              onClick={() => router.push("/claim")}
            >
              <Coins size={20} className={isExpanded ? "mr-2" : ""} />
              {isExpanded && <span>Claim Tokens</span>}
            </Button>
          </div>
        </div>

        <div className="p-3 border-t border-primary/30">
          <Button
            variant="outline"
            className={`w-full justify-${
              isExpanded ? "start" : "center"
            } ${activeTab === "mint" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary border-primary/50"} hover:bg-primary/20`}
            onClick={() => router.push("/mint")}
          >
            <PlusCircle size={18} className={isExpanded ? "mr-2" : ""} />
            {isExpanded && <span>Mint New Agent</span>}
          </Button>

          <div className="mt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-full justify-${
                    isExpanded ? "between" : "center"
                  } text-muted-foreground hover:text-primary hover:bg-primary/10`}
                >
                  <div className="flex items-center">
                    <Settings size={18} className={isExpanded ? "mr-2" : ""} />
                    {isExpanded && <span>Settings</span>}
                  </div>
                  {isExpanded && <ChevronDown size={16} />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-black/90 border-primary/30">
                <DropdownMenuLabel>User Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings size={16} className="mr-2" />
                  <span>Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle size={16} className="mr-2" />
                  <span>Help & Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut size={16} className="mr-2" />
                  <span>Disconnect Wallet</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Top navigation for desktop */}
      <div className="hidden md:flex items-center justify-end gap-4 absolute top-4 right-4 z-30">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="bg-black/80 border-primary/30">
              <User size={16} className="mr-2" />
              <span>Connected</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-black/90 border-primary/30">
            <DropdownMenuLabel>Wallet</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Coins size={16} className="mr-2" />
              <span>250 NEOBOTS Tokens</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <User size={16} className="mr-2" />
              <span>3 Agents</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut size={16} className="mr-2" />
              <span>Disconnect</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

function ChevronDown(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
