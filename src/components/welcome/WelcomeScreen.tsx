import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Headphones, Heart, MessageCircle, MapPin, HelpCircle, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WelcomeScreenProps {
  onComplete: () => void
  onNavigate?: (tab: string) => void
}

const features = [
  {
    icon: Play,
    title: 'Watch',
    description: 'Stream inspiring sermons and teachings',
    color: 'from-rose-500 to-orange-400',
    tab: 'watch'
  },
  {
    icon: Headphones,
    title: 'Podcasts',
    description: 'Listen to uplifting messages on the go',
    color: 'from-violet-500 to-purple-400',
    tab: 'podcast'
  },
  {
    icon: Heart,
    title: 'Prayers',
    description: 'Share and support prayer requests',
    color: 'from-pink-500 to-rose-400',
    tab: 'prayers'
  },
  {
    icon: MessageCircle,
    title: 'Messages',
    description: 'Connect with our community',
    color: 'from-cyan-500 to-blue-400',
    tab: 'messages'
  },
  {
    icon: MapPin,
    title: 'Locations',
    description: 'Find a Light Embassy near you',
    color: 'from-emerald-500 to-teal-400',
    tab: 'locations'
  },
  {
    icon: HelpCircle,
    title: 'Quiz',
    description: 'Test your knowledge and win prizes',
    color: 'from-amber-500 to-yellow-400',
    tab: 'quiz'
  }
]

export function WelcomeScreen({ onComplete, onNavigate }: WelcomeScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleGetStarted = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handleFeatureClick = (tab: string) => {
    onComplete()
    onNavigate?.(tab)
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary via-primary/90 to-secondary overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        {/* Step indicators */}
        <div className="flex gap-2 mb-6 sm:mb-8">
          {[0, 1, 2].map((step) => (
            <button
              key={step}
              onClick={() => setCurrentStep(step)}
              className={cn(
                "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300",
                currentStep === step 
                  ? "bg-white w-6 sm:w-8" 
                  : "bg-white/40 hover:bg-white/60"
              )}
            />
          ))}
        </div>

        {/* Content based on step */}
        <div className="w-full max-w-lg mx-auto text-center">
          {currentStep === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 sm:mb-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
                  Welcome to<br />Light Embassy
                </h1>
                <p className="text-base sm:text-lg text-white/90 max-w-md mx-auto px-4">
                  Your spiritual home for inspiration, connection, and growth. 
                  We're so glad you're here!
                </p>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-2">
                Discover What's Inside
              </h2>
              <p className="text-sm sm:text-base text-white/80 mb-6 sm:mb-8 px-4">
                Explore our features designed to enrich your spiritual journey
              </p>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3 px-2">
                {features.map((feature, index) => (
                  <Card 
                    key={feature.title}
                    className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleFeatureClick(feature.tab)}
                  >
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br flex items-center justify-center group-hover:scale-110 transition-transform",
                        feature.color
                      )}>
                        <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-white text-sm sm:text-base">{feature.title}</h3>
                      <p className="text-[10px] sm:text-xs text-white/70 mt-1 leading-tight">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 sm:mb-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Play className="w-10 h-10 sm:w-12 sm:h-12 text-white ml-1" />
                </div>
                <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                  Start Your Journey
                </h2>
                <p className="text-sm sm:text-base text-white/90 max-w-md mx-auto mb-6 sm:mb-8 px-4">
                  We recommend starting with our latest video message to get inspired, 
                  or take our quiz to win exciting prizes!
                </p>
              </div>

              <div className="flex flex-col gap-3 px-4 sm:px-0">
                <Button 
                  size="lg"
                  onClick={() => handleFeatureClick('watch')}
                  className="w-full bg-white text-primary hover:bg-white/90 font-semibold py-5 sm:py-6 text-base sm:text-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Latest Video
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => handleFeatureClick('quiz')}
                  className="w-full border-white/40 text-white hover:bg-white/10 font-semibold py-5 sm:py-6 text-base sm:text-lg"
                >
                  <HelpCircle className="w-5 h-5 mr-2" />
                  Take the Quiz
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col items-center gap-3 sm:gap-4 w-full max-w-lg px-4">
          {currentStep < 2 && (
            <Button 
              size="lg"
              onClick={handleGetStarted}
              className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-semibold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg"
            >
              {currentStep === 0 ? "Let's Get Started" : "Continue"}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}
          
          <button 
            onClick={onComplete}
            className="text-white/70 hover:text-white text-sm sm:text-base transition-colors py-2"
          >
            {currentStep === 2 ? "Explore on my own" : "Skip introduction"}
          </button>
        </div>
      </div>
    </div>
  )
}
