import { useState, useCallback } from "react"
import { ForumSection } from "@/components/forum/ForumSection"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Lightbulb, LayoutGrid, Heart, Sparkles, Hand, Target, BookOpen, Users } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LearnProps {
  onBack?: () => void
}

const topics = [
  { id: "all", label: "All Topics", icon: LayoutGrid },
  { id: "healing", label: "Healing", icon: Heart },
  { id: "faith", label: "Faith", icon: Sparkles },
  { id: "love", label: "Love", icon: Hand },
  { id: "purpose", label: "Purpose", icon: Target },
  { id: "bible", label: "Bible Study", icon: BookOpen },
  { id: "community", label: "Community", icon: Users },
]

const topicPrompts: Record<string, string[]> = {
  healing: [
    "Is healing available for everyone today?",
    "How do you respond when healing doesn't come immediately?",
    "Share a testimony of healing in your life or someone you know",
  ],
  faith: [
    "What does walking by faith look like in your daily life?",
    "How do you maintain faith during difficult seasons?",
    "What has strengthened your faith the most?",
  ],
  love: [
    "How do you show God's love to those around you?",
    "What does 'a greater love' mean to you?",
    "How has experiencing God's love changed your relationships?",
  ],
  purpose: [
    "How did you discover your calling or purpose?",
    "What keeps you busy vs what fulfills you spiritually?",
    "How do you balance work, family, and ministry?",
  ],
  bible: [
    "Which scripture has transformed your understanding recently?",
    "How do you approach studying the Bible effectively?",
    "What commonly misunderstood passage would you like to discuss?",
  ],
  community: [
    "How has church community impacted your spiritual growth?",
    "What does serving others mean to you?",
    "How can we better support each other as believers?",
  ],
}

export default function Learn({ onBack }: LearnProps) {
  const [selectedTopic, setSelectedTopic] = useState("all")
  const [prefillTitle, setPrefillTitle] = useState<string | undefined>()

  const currentPrompts = selectedTopic !== "all" ? topicPrompts[selectedTopic] : null

  const handlePromptClick = (prompt: string) => {
    setPrefillTitle(prompt)
  }

  const handlePrefillUsed = useCallback(() => {
    setPrefillTitle(undefined)
  }, [])

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
        <div className="mb-6">
          <Tabs value={selectedTopic} onValueChange={setSelectedTopic} className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-center p-0">
              {topics.map((topic) => {
                const Icon = topic.icon
                return (
                  <TabsTrigger
                    key={topic.id}
                    value={topic.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted/50 hover:bg-muted px-4 py-2 rounded-full text-sm font-medium transition-all gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {topic.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Discussion Prompts */}
        {currentPrompts && (
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm text-primary">Discussion Starters</span>
                <span className="text-xs text-muted-foreground">(click to start a discussion)</span>
              </div>
              <ul className="space-y-2">
                {currentPrompts.map((prompt, index) => (
                  <li 
                    key={index} 
                    className="text-sm text-muted-foreground flex items-start gap-2 cursor-pointer hover:text-primary transition-colors group"
                    onClick={() => handlePromptClick(prompt)}
                  >
                    <span className="text-primary/60 group-hover:text-primary">•</span>
                    <span className="hover:underline">{prompt}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <ForumSection 
          selectedTopic={selectedTopic} 
          prefillTitle={prefillTitle}
          onPrefillUsed={handlePrefillUsed}
        />
      </div>
    </div>
  )
}
