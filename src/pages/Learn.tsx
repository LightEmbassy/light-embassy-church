import { ForumSection } from "@/components/forum/ForumSection"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface LearnProps {
  onBack?: () => void
}

export default function Learn({ onBack }: LearnProps) {
  return (
    <div className="min-h-screen bg-background pb-20 pt-16">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {onBack && (
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        )}
        <div className="text-center mb-8">
          <h1 className="font-playfair text-4xl font-bold mb-4 text-primary">
            Discover More
          </h1>
          <p className="text-muted-foreground text-lg">
            A safe place for questions, discussions, and growing in faith together
          </p>
        </div>

        <ForumSection />
      </div>
    </div>
  )
}