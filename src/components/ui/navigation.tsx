import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Church, Home, Play, BookOpen, Heart, Calendar, User, MessageSquare, Headphones } from "lucide-react"

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

export function Navigation({ activeTab, onTabChange, className }: NavigationProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'watch', label: 'Watch', icon: Play },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'prayers', label: 'Prayers', icon: Heart },
    { id: 'podcast', label: 'Podcast', icon: Headphones },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'locations', label: 'Locations', icon: Church },
  ]

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border",
      "flex items-center justify-around py-2 px-4 z-50",
      className
    )}>
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        
        return (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-col gap-1 h-auto py-2 px-3 transition-divine",
              isActive 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
            )}
          >
            <Icon className={cn(
              "h-5 w-5 transition-divine",
              isActive && "text-primary"
            )} />
            <span className="text-xs font-medium">{tab.label}</span>
          </Button>
        )
      })}
    </nav>
  )
}