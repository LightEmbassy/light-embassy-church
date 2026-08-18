import { Button } from "@/components/ui/button"
import { Play, Heart } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function HeroSection() {
  const navigate = useNavigate()
  
  return (
    <div className="relative h-[400px] overflow-hidden rounded-b-3xl">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="https://lightembassy.org/wp-content/uploads/2024/09/le-web-header.mp4" type="video/mp4" />
      </video>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-6 text-white">
        <div className="space-y-3">
          <h1 className="font-playfair text-3xl font-bold leading-tight">
            Light Embassy Church
          </h1>
          <p className="text-white font-medium text-base font-inter">
            A safe and welcoming community of Followers of Christ growing together
          </p>
          <p className="text-white/80 text-sm font-inter italic">
            Revealing the Bible, discovering the truth, living the best life!
          </p>
          
          <div className="flex gap-3 pt-2">
            {/* Watch Videos Card Button */}
            <div 
              className="relative w-32 h-20 rounded-xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-secondary/80 to-primary/80"
              onClick={() => navigate('/watch')}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/70 transition-all" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="bg-white/90 rounded-full p-2 mb-1 group-hover:scale-110 transition-transform shadow-md">
                  <Play className="h-4 w-4 text-primary fill-primary" />
                </div>
                <span className="text-white font-semibold text-xs drop-shadow-lg">Watch Videos</span>
              </div>
            </div>
            
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white text-primary font-semibold hover:bg-white/90 backdrop-blur-sm transition-divine shadow-lg"
              onClick={() => navigate('/prayers')}
            >
              <Heart className="mr-2 h-5 w-5 fill-primary" />
              Prayer Request
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

