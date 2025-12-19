import { useState } from "react"
import { ForumSection } from "@/components/forum/ForumSection"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LearnProps {
  onBack?: () => void
}

const topics = [
  { id: "all", label: "All Topics" },
  { id: "healing", label: "Healing" },
  { id: "faith", label: "Faith" },
  { id: "love", label: "Love" },
  { id: "purpose", label: "Purpose" },
  { id: "bible", label: "Bible Study" },
  { id: "community", label: "Community" },
]

export default function Learn({ onBack }: LearnProps) {
  const [selectedTopic, setSelectedTopic] = useState("all")

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

        {/* Topic Tabs */}
        <div className="mb-8">
          <Tabs value={selectedTopic} onValueChange={setSelectedTopic} className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-center p-0">
              {topics.map((topic) => (
                <TabsTrigger
                  key={topic.id}
                  value={topic.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted/50 hover:bg-muted px-4 py-2 rounded-full text-sm font-medium transition-all"
                >
                  {topic.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <ForumSection selectedTopic={selectedTopic} />
      </div>
    </div>
  )
}