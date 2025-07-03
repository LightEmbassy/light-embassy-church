import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, BookOpen, Heart, Calendar, Users, Headphones } from "lucide-react"

export function QuickActions() {
  const actions = [
    {
      icon: Play,
      title: "Watch",
      description: "Pure word of God's grace",
      color: "bg-gradient-spiritual",
      textColor: "text-white"
    },
    {
      icon: BookOpen,
      title: "Read",
      description: "Dig deeper into God's Word",
      color: "bg-gradient-divine",
      textColor: "text-primary"
    },
    {
      icon: Heart,
      title: "Prayer Request",
      description: "Request prayer for yourself or others",
      color: "bg-accent",
      textColor: "text-primary"
    },
    {
      icon: Users,
      title: "Connect",
      description: "How to connect with us & others",
      color: "bg-gradient-peace",
      textColor: "text-primary"
    },
    {
      icon: BookOpen,
      title: "Discover More",
      description: "A safe place for questions",
      color: "bg-muted",
      textColor: "text-primary"
    },
    {
      icon: Headphones,
      title: "Podcast",
      description: "Listen from anywhere!",
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