import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Heart } from "lucide-react"
import heroLight from "@/assets/hero-light.jpg"

export function HeroSection() {
  return (
    <div className="relative h-[400px] overflow-hidden rounded-b-3xl">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroLight})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-6 text-white">
        <div className="space-y-4">
          <h1 className="font-playfair text-3xl font-bold leading-tight">
            Welcome to Light Embassy
          </h1>
          <p className="text-white/90 text-lg font-inter">
            A worldwide community united in worship, learning, and spiritual growth
          </p>
          
          <div className="flex gap-3 pt-2">
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm transition-divine"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Live
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/40 text-white hover:bg-white/20 backdrop-blur-sm transition-divine"
            >
              <Heart className="mr-2 h-5 w-5" />
              Pray
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}