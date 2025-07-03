import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Share, Heart } from "lucide-react"

export function DailyInspiration() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="font-playfair text-2xl font-semibold text-foreground">
        Today's Inspiration
      </h2>
      
      <Card className="border-0 shadow-divine bg-gradient-spiritual">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-white">
            <BookOpen className="h-5 w-5" />
            <span className="font-inter font-medium">Word for Today</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-white space-y-3">
            <h3 className="font-playfair text-xl font-semibold">
              "Trust in the Lord with all your heart"
            </h3>
            <p className="text-white/90 leading-relaxed font-inter">
              "Trust in the Lord with all your heart and lean not on your own understanding; 
              in all your ways submit to him, and he will make your paths straight."
            </p>
            <p className="text-white/80 text-sm font-inter">
              - Proverbs 3:5-6
            </p>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-divine"
            >
              <Heart className="mr-2 h-4 w-4" />
              Reflect
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