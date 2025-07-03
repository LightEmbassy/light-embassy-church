import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, BookOpen, Heart, Calendar, Users, Headphones } from "lucide-react"

export function QuickActions() {
  const actions = [
    {
      icon: Play,
      title: "Live Service",
      description: "Join our worship",
      color: "bg-gradient-spiritual",
      textColor: "text-white"
    },
    {
      icon: BookOpen,
      title: "Daily Word",
      description: "Today's devotion",
      color: "bg-gradient-divine",
      textColor: "text-primary"
    },
    {
      icon: Heart,
      title: "Prayer Request",
      description: "Share your heart",
      color: "bg-accent",
      textColor: "text-primary"
    },
    {
      icon: Calendar,
      title: "Events",
      description: "Upcoming services",
      color: "bg-gradient-peace",
      textColor: "text-primary"
    },
    {
      icon: Users,
      title: "Connect",
      description: "Find community",
      color: "bg-muted",
      textColor: "text-primary"
    },
    {
      icon: Headphones,
      title: "Podcast",
      description: "Listen & learn",
      color: "bg-primary-glow",
      textColor: "text-primary"
    }
  ]

  return (
    <div className="p-6 space-y-4">
      <h2 className="font-playfair text-2xl font-semibold text-foreground">
        Quick Actions
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <Card 
              key={index} 
              className="border-0 shadow-gentle hover:shadow-divine transition-divine cursor-pointer group"
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