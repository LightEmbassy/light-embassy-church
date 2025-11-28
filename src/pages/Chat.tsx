import { ChatBot } from "@/components/chat/ChatBot"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface ChatProps {
  onBack?: () => void
}

export default function Chat({ onBack }: ChatProps) {
  return (
    <div className="min-h-screen bg-background pb-20 pt-16">
      <div className="container mx-auto px-6 py-8">
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
            Chat Assistant
          </h1>
          <p className="text-muted-foreground text-lg">
            Ask questions about faith, the Bible, and Light Embassy Church
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <ChatBot />
        </div>
      </div>
    </div>
  )
}