import { useEffect } from "react"
import { Navigation as TopNavigation } from "@/components/layout/Navigation"
import { Navigation } from "@/components/ui/navigation"
import { useNavigation } from "@/contexts/NavigationContext"
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
  const { currentTab, navigateTo, goBack, navigationHistory } = useNavigation()

  useEffect(() => {
    // Get current state data if any
    const currentState = navigationHistory[navigationHistory.length - 1]
    console.log('Current navigation state:', currentState)
  }, [navigationHistory])

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <Home onNavigate={navigateTo} />
      case 'watch':
        return <Watch onBack={goBack} />
      case 'learn':
        return <Learn onBack={goBack} />
      case 'prayers':
        return <Prayers onBack={goBack} />
      case 'podcast':
        return <Podcast onBack={goBack} />
      case 'messages':
        return <Messages onBack={goBack} />
      case 'locations':
        return <Locations onBack={goBack} />
      case 'chat':
        return <Chat onBack={goBack} />
      case 'admin':
        return <Admin onBack={goBack} />
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
        return <Home onNavigate={navigateTo} />
    }
  }

  return (
    <div className="font-inter">
      <TopNavigation />
      <div className="pt-20">
        {renderContent()}
      </div>
      <Navigation activeTab={currentTab} onTabChange={navigateTo} />
    </div>
  )
};

export default Index;
