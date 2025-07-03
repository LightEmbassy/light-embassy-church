import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Share, Heart, Headphones } from "lucide-react"

export function DailyInspiration() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="font-playfair text-2xl font-semibold text-foreground">
        Latest Teaching
      </h2>
      
      <Card className="border-0 shadow-divine bg-gradient-spiritual">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-white">
            <BookOpen className="h-5 w-5" />
            <span className="font-inter font-medium">Light Embassy Podcast</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-white space-y-3">
            <h3 className="font-playfair text-xl font-semibold">
              "Why you not ought to be sick"
            </h3>
            <p className="text-white/90 leading-relaxed font-inter">
              Discover the truth about divine health and God's perfect will for your wellbeing. 
              Learn how faith and understanding can transform your perspective on healing.
            </p>
            <p className="text-white/80 text-sm font-inter">
              Latest Episode - Season 3
            </p>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-divine"
            >
              <Headphones className="mr-2 h-4 w-4" />
              Listen
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/40 text-white hover:bg-white/20 transition-divine"
            >
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}