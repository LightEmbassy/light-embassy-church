import { BibleSection } from "@/components/bible/BibleSection"
import { ForumSection } from "@/components/forum/ForumSection"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Book, MessageSquare } from "lucide-react"

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

        <Tabs defaultValue="forum" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="forum" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Community Forum
            </TabsTrigger>
            <TabsTrigger value="bible" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              Bible
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forum">
            <ForumSection />
          </TabsContent>

          <TabsContent value="bible">
            <BibleSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}