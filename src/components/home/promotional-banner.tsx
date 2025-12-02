import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Play, BookOpen, Headphones, ArrowRight, ClipboardList } from "lucide-react"

interface PromoBanner {
  id: string
  title: string
  description: string
  action: string
  actionUrl: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  badge?: string
  animated?: boolean
}

const promoBanners: PromoBanner[] = [
  {
    id: "quiz",
    title: "Take a Quiz",
    description: "Test your knowledge of Scripture and grow in your understanding of God's Word",
    action: "Start Quiz",
    actionUrl: "/quiz",
    icon: ClipboardList,
    gradient: "bg-gradient-to-r from-purple-500/10 to-pink-500/10",
    badge: "Challenge Yourself",
    animated: true
  },
  {
    id: "watch",
    title: "Watch Our Videos",
    description: "Filled with the pure word of God's grace to build you up and deliver unto you an inheritance among the saints",
    action: "Watch Now",
    actionUrl: "/watch",
    icon: Play,
    gradient: "bg-gradient-to-r from-blue-500/10 to-purple-500/10",
    badge: "New Episodes"
  },
  {
    id: "podcast",
    title: "Light Embassy Podcast",
    description: "Revealing the Bible, discovering the truth, living the best life! Listen from anywhere.",
    action: "Listen Now",
    actionUrl: "/podcast",
    icon: Headphones,
    gradient: "bg-gradient-to-r from-green-500/10 to-teal-500/10",
    badge: "Latest: Why you not ought to be sick"
  },
  {
    id: "study",
    title: "Dig Deeper into God's Word",
    description: "Explore our Bible studies and discover your divine destiny through spiritual understanding",
    action: "Read More",
    actionUrl: "/learn",
    icon: BookOpen,
    gradient: "bg-gradient-to-r from-orange-500/10 to-red-500/10",
    badge: "Bible Study"
  },
]

interface PromotionalBannerProps {
  onNavigate?: (tab: string) => void
}

export function PromotionalBanner({ onNavigate }: PromotionalBannerProps) {
  const [currentBanner, setCurrentBanner] = useState(0)
  const [dismissed, setDismissed] = useState<string[]>([])

  const activeBanners = promoBanners.filter(banner => !dismissed.includes(banner.id))
  
  if (activeBanners.length === 0) return null

  const banner = activeBanners[currentBanner % activeBanners.length]
  const Icon = banner.icon

  const handleDismiss = () => {
    setDismissed(prev => [...prev, banner.id])
    if (currentBanner >= activeBanners.length - 1) {
      setCurrentBanner(0)
    }
  }

  const handleNext = () => {
    setCurrentBanner((prev) => (prev + 1) % activeBanners.length)
  }

  return (
    <div className="container mx-auto px-6 pt-4 pb-2">
      <Card className={`relative overflow-hidden border-0 ${banner.gradient} backdrop-blur-sm`}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={`bg-white/20 backdrop-blur-sm rounded-lg p-2 mt-1 ${banner.animated ? 'animate-pulse' : ''}`}>
                <Icon className={`h-5 w-5 text-primary ${banner.animated ? 'animate-bounce' : ''}`} />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">
                    {banner.title}
                  </h3>
                  {banner.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {banner.badge}
                    </Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  {banner.description}
                </p>
                
                <div className="flex items-center gap-3 pt-1">
                  <Button 
                    size="sm" 
                    className="text-xs h-8"
                    onClick={() => onNavigate?.(banner.actionUrl.replace('/', ''))}
                  >
                    {banner.action}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                  
                  {activeBanners.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-8 text-muted-foreground hover:text-foreground"
                      onClick={handleNext}
                    >
                      Next ({currentBanner + 1}/{activeBanners.length})
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}