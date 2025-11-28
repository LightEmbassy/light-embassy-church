import { BibleSection } from "@/components/bible/BibleSection"
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
            Learn & Grow
          </h1>
          <p className="text-muted-foreground text-lg">
            Dive deeper into God's Word and grow in your faith journey
          </p>
        </div>

        <BibleSection />
        
        {/* Future sections can be added here */}
        <div className="mt-12 text-center p-8 bg-muted/50 rounded-lg">
          <h2 className="font-playfair text-2xl font-semibold mb-4 text-primary">
            More Coming Soon
          </h2>
          <p className="text-muted-foreground">
            Bible studies, devotionals, and teaching materials will be available here soon!
          </p>
        </div>
      </div>
    </div>
  )
}