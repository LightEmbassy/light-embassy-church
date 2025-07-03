import { useState } from "react"
import { Navigation as TopNavigation } from "@/components/layout/Navigation"
import { Navigation } from "@/components/ui/navigation"
import Home from "./Home"
import Prayers from "./Prayers"

const Index = () => {
  const [activeTab, setActiveTab] = useState("home")

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home />
      case 'watch':
        return (
          <div className="min-h-screen bg-background pb-20 pt-16">
            <div className="text-center p-8">
              <h1 className="font-playfair text-3xl font-bold mb-4 text-primary">Watch</h1>
              <p className="text-muted-foreground">Live services and recorded content coming soon!</p>
            </div>
          </div>
        )
      case 'learn':
        return (
          <div className="min-h-screen bg-background pb-20 pt-16">
            <div className="text-center p-8">
              <h1 className="font-playfair text-3xl font-bold mb-4 text-primary">Learn</h1>
              <p className="text-muted-foreground">Bible studies and teaching materials coming soon!</p>
            </div>
          </div>
        )
      case 'prayers':
        return <Prayers />
      case 'events':
        return (
          <div className="min-h-screen bg-background pb-20 pt-16">
            <div className="text-center p-8">
              <h1 className="font-playfair text-3xl font-bold mb-4 text-primary">Events</h1>
              <p className="text-muted-foreground">Church calendar and upcoming events coming soon!</p>
            </div>
          </div>
        )
      default:
        return <Home />
    }
  }

  return (
    <div className="font-inter">
      <TopNavigation />
      <div className="pt-20">
        {renderContent()}
      </div>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
};

export default Index;
