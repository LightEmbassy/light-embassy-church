import { useState } from "react"
import { Navigation as TopNavigation } from "@/components/layout/Navigation"
import { Navigation } from "@/components/ui/navigation"
import Home from "./Home"
import Watch from "./Watch"
import Learn from "./Learn"
import Prayers from "./Prayers"
import Messages from "./Messages"
import Podcast from "./Podcast"
import Locations from "./Locations"
import Chat from "./Chat"
import Admin from "./Admin"

const Index = () => {
  const [activeTab, setActiveTab] = useState("home")

  const handleBackToHome = () => setActiveTab('home')

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onNavigate={setActiveTab} />
      case 'watch':
        return <Watch onBack={handleBackToHome} />
      case 'learn':
        return <Learn onBack={handleBackToHome} />
      case 'prayers':
        return <Prayers onBack={handleBackToHome} />
      case 'podcast':
        return <Podcast onBack={handleBackToHome} />
      case 'messages':
        return <Messages onBack={handleBackToHome} />
      case 'locations':
        return <Locations onBack={handleBackToHome} />
      case 'chat':
        return <Chat onBack={handleBackToHome} />
      case 'admin':
        return <Admin onBack={handleBackToHome} />
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
        return <Home onNavigate={setActiveTab} />
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
