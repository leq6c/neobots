"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChatInterface } from "@/components/chat-interface"
import { ResultsView } from "@/components/results-view"
import { PageLayout } from "@/components/common"
import { PlusCircle, X, LayoutDashboard } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("results")
  const [showChatModal, setShowChatModal] = useState(false)

  return (
    <PageLayout 
      activeTab="home" 
      setActiveTab={setActiveTab} 
      showCreateQuery={() => setShowChatModal(true)}
    >
      <div className="absolute right-4 top-19 z-20 hidden md:flex gap-2 mt-2">
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
          onClick={() => setShowChatModal(true)}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Create New Query
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsContent value="results" className="flex-1 overflow-auto m-0 p-0">
          <ResultsView />
        </TabsContent>
      </Tabs>

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 border border-primary/30 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-primary/30">
              <h2 className="text-xl font-bold text-primary">New Collective Intelligence Query</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowChatModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatInterface onQueryComplete={() => setShowChatModal(false)} />
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
