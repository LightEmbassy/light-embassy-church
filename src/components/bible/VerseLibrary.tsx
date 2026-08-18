import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Check, Heart, Search, Share2 } from "lucide-react"
import { ShareDialog } from "@/components/sharing/ShareDialog"
import { verseLibrary, verseThemes, type LibraryVerse } from "@/data/verses"

interface VerseLibraryProps {
  savedReferences: string[]
  onSave: (verse: LibraryVerse) => void | Promise<void>
  saving?: string | null
}

export function VerseLibrary({ savedReferences, onSave, saving }: VerseLibraryProps) {
  const [theme, setTheme] = useState("all")
  const [query, setQuery] = useState("")

  const verses = useMemo(() => {
    const q = query.trim().toLowerCase()
    return verseLibrary.filter((v) => {
      const matchesTheme = theme === "all" || v.theme === theme
      const matchesQuery =
        !q || v.reference.toLowerCase().includes(q) || v.text.toLowerCase().includes(q)
      return matchesTheme && matchesQuery
    })
  }, [theme, query])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-playfair text-2xl text-primary flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Verse Library
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Browse scripture by theme and save the verses that speak to you.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={theme} onValueChange={setTheme}>
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-start p-0">
            {verseThemes.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted/50 hover:bg-muted px-4 py-2 rounded-full text-sm font-medium transition-all"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            aria-label="Search verses"
            placeholder="Search verses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {verses.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No verses match your search.</p>
        ) : (
          <div className="space-y-3">
            {verses.map((verse) => {
              const isSaved = savedReferences.includes(verse.reference)
              return (
                <div key={verse.reference} className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-2">
                        {verse.reference}
                      </Badge>
                      <p className="text-foreground italic">"{verse.text}"</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <ShareDialog
                        content={{
                          title: `Scripture: ${verse.reference}`,
                          text: `"${verse.text}" - ${verse.reference}`,
                          url: "https://www.bible.com/bible",
                        }}
                      >
                        <Button variant="ghost" size="sm" aria-label={`Share ${verse.reference}`}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </ShareDialog>
                      <Button
                        variant={isSaved ? "secondary" : "outline"}
                        size="sm"
                        disabled={isSaved || saving === verse.reference}
                        onClick={() => onSave(verse)}
                        aria-label={isSaved ? `${verse.reference} saved` : `Save ${verse.reference}`}
                        className="gap-1.5"
                      >
                        {isSaved ? <Check className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                        {isSaved ? "Saved" : "Save"}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
