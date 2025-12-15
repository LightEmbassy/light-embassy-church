import { Card, CardContent } from "@/components/ui/card"
import { Play, BookOpen, Heart, Headphones, MessageCircle, Users } from "lucide-react"
import watchBg from "@/assets/watch-bg.jpg"
import podcastBg from "@/assets/podcast-bg.jpg"
import prayerBg from "@/assets/prayer-bg.jpg"
import discoverBg from "@/assets/discover-bg.jpg"
import messagesBg from "@/assets/messages-bg.jpg"
import quizBg from "@/assets/quiz-bg.jpg"

interface QuickActionsProps {
  onNavigate?: (tab: string) => void
}

export function QuickActions({ onNavigate }: QuickActionsProps) {
  const actions = [
    {
      icon: Play,
      title: "Watch",
      description: "Pure word of God's grace",
      color: "bg-gradient-spiritual",
      textColor: "text-white",
      tab: "watch",
      hasImageBg: true,
      bgImage: watchBg
    },
    {
      icon: Users,
      title: "Discover More",
      description: "Community forum & discussions",
      color: "bg-gradient-divine",
      textColor: "text-primary",
      tab: "learn",
      hasImageBg: true,
      bgImage: discoverBg
    },
    {
      icon: Heart,
      title: "Prayer Request",
      description: "Request prayer for yourself or others",
      color: "bg-accent",
      textColor: "text-primary",
      tab: "prayers",
      hasImageBg: true,
      bgImage: prayerBg
    },
    {
      icon: MessageCircle,
      title: "Messages",
      description: "Connect with church staff",
      color: "bg-gradient-peace",
      textColor: "text-primary",
      tab: "messages",
      hasImageBg: true,
      bgImage: messagesBg
    },
    {
      icon: Headphones,
      title: "Podcast",
      description: "Listen from anywhere!",
      color: "bg-primary-glow",
      textColor: "text-primary",
      tab: "podcast",
      hasImageBg: true,
      bgImage: podcastBg
    },
    {
      icon: BookOpen,
      title: "Take Another Quiz",
      description: "Test your Bible knowledge!",
      color: "bg-accent",
      textColor: "text-primary",
      tab: "quiz",
      hasImageBg: true,
      bgImage: quizBg
    }
  ]

  const handleActionClick = (tab: string) => {
    onNavigate?.(tab)
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="font-playfair text-2xl font-semibold text-foreground">
        Quick Actions
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon
          
          // Special card with image background for Watch
          if (action.hasImageBg) {
            return (
              <Card 
                key={index} 
                className="border-0 shadow-gentle hover:shadow-divine transition-divine cursor-pointer group overflow-hidden"
                onClick={() => handleActionClick(action.tab)}
              >
                <CardContent className="p-0 relative h-28">
                  {/* Background image */}
                  <img 
                    src={action.bgImage}
                    alt={action.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/70 transition-all" />
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col items-center justify-center text-center space-y-2 p-4">
                    <div className="bg-white/90 rounded-full p-2 group-hover:scale-110 transition-transform shadow-md">
                      <Icon className="h-6 w-6 text-primary fill-primary" />
                    </div>
                    <div>
                      <h3 className="font-inter font-bold text-sm text-white drop-shadow-lg">
                        {action.title}
                      </h3>
                      <p className="text-xs text-white/80 drop-shadow">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          }
          
          // Standard card for other actions
          return (
            <Card 
              key={index} 
              className="border-0 shadow-gentle hover:shadow-divine transition-divine cursor-pointer group"
              onClick={() => handleActionClick(action.tab)}
            >
              <CardContent className={`p-4 ${action.color} rounded-lg`}>
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Icon className={`h-6 w-6 ${action.textColor} group-hover:scale-110 transition-divine`} />
                  </div>
                  <div>
                    <h3 className={`font-inter font-semibold text-sm ${action.textColor}`}>
                      {action.title}
                    </h3>
                    <p className={`text-xs ${action.textColor} opacity-80`}>
                      {action.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}