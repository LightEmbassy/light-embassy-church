import { Button } from "@/components/ui/button"
import { Play, Heart } from "lucide-react"
import heroLightEmbassy from "@/assets/hero-light-embassy-new.jpg"

export function HeroSection() {
  return (
    <div className="relative h-[400px] overflow-hidden rounded-b-3xl">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={heroLightEmbassy}
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="https://lightembassy.org/wp-content/uploads/2024/09/le-web-header.mp4" type="video/mp4" />
      </video>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-6 text-white">
        <div className="space-y-4">
          <h1 className="font-playfair text-3xl font-bold leading-tight">
            Light Embassy Church
          </h1>
          <p className="text-white/90 text-lg font-inter">
            Revealing the Bible, discovering the truth, living the best life!
          </p>
          
          <div className="flex gap-3 pt-2">
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm transition-divine"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Videos
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/40 text-white hover:bg-white/20 backdrop-blur-sm transition-divine"
            >
              <Heart className="mr-2 h-5 w-5" />
              Prayer Request
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}