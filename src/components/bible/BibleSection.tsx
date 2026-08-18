import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Book, ExternalLink, Heart, Plus, Trash2, Share2 } from "lucide-react"
import { ShareDialog } from "@/components/sharing/ShareDialog"
import { SignInRequired } from "@/components/auth/SignInRequired"
import { VerseLibrary } from "@/components/bible/VerseLibrary"
import type { LibraryVerse } from "@/data/verses"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"


interface FavoriteVerse {
  id: string
  verse_reference: string
  verse_text: string
  book: string
  chapter: number
  verse: number
  created_at: string
}

export function BibleSection() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [favoriteVerses, setFavoriteVerses] = useState<FavoriteVerse[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [savingReference, setSavingReference] = useState<string | null>(null)

  const [newVerse, setNewVerse] = useState({
    reference: "",
    text: "",
    book: "",
    chapter: "",
    verse: ""
  })

  useEffect(() => {
    if (user) {
      fetchFavoriteVerses()
    }
  }, [user])

  const fetchFavoriteVerses = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from("favorite_verses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching favorite verses:", error)
      return
    }

    setFavoriteVerses(data || [])
  }

  const handleAddVerse = async () => {
    if (!user || !newVerse.reference || !newVerse.text || !newVerse.book || !newVerse.chapter || !newVerse.verse) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    const { error } = await supabase
      .from("favorite_verses")
      .insert({
        user_id: user.id,
        verse_reference: newVerse.reference,
        verse_text: newVerse.text,
        book: newVerse.book,
        chapter: parseInt(newVerse.chapter),
        verse: parseInt(newVerse.verse)
      })

    if (error) {
      console.error("Error adding favorite verse:", error)
      toast({
        title: "Error",
        description: "Failed to save favorite verse",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Success",
      description: "Verse saved to favorites!"
    })

    setNewVerse({ reference: "", text: "", book: "", chapter: "", verse: "" })
    setIsAddDialogOpen(false)
    fetchFavoriteVerses()
  }

  const handleDeleteVerse = async (verseId: string) => {
    const { error } = await supabase
      .from("favorite_verses")
      .delete()
      .eq("id", verseId)

    if (error) {
      console.error("Error deleting favorite verse:", error)
      toast({
        title: "Error",
        description: "Failed to delete verse",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Success",
      description: "Verse removed from favorites"
    })

    fetchFavoriteVerses()
  }

  const handleSaveLibraryVerse = async (verse: LibraryVerse) => {
    if (!user) return
    setSavingReference(verse.reference)
    const { error } = await supabase.from("favorite_verses").insert({
      user_id: user.id,
      verse_reference: verse.reference,
      verse_text: verse.text,
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
    })
    setSavingReference(null)

    if (error) {
      console.error("Error saving verse:", error)
      toast({
        title: "Error",
        description: "Failed to save this verse. Please try again.",
        variant: "destructive",
      })
      return
    }

    toast({ title: "Saved", description: `${verse.reference} added to your verses.` })
    fetchFavoriteVerses()
  }

  const openBibleCom = () => {
    window.open("https://www.bible.com/bible", "_blank", "noopener,noreferrer")
  }

  return (
    <div className="space-y-6">

      <Card className="border-0 shadow-divine bg-gradient-spiritual">
        <CardHeader className="text-center">
          <CardTitle className="font-playfair text-3xl text-white flex items-center justify-center gap-3">
            <Book className="h-8 w-8" />
            Bible Study
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-white/90 mb-6 text-lg">
              Access the complete Bible online with study tools, multiple translations, and reading plans
            </p>
            <Button 
              onClick={openBibleCom}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Open Bible.com
            </Button>
          </div>
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-playfair text-2xl text-primary flex items-center gap-2">
                <Heart className="h-6 w-6" />
                My Favorite Verses
              </CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Verse
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Favorite Verse</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reference">Verse Reference</Label>
                      <Input
                        id="reference"
                        placeholder="e.g., John 3:16"
                        value={newVerse.reference}
                        onChange={(e) => setNewVerse({ ...newVerse, reference: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="book">Book</Label>
                        <Input
                          id="book"
                          placeholder="John"
                          value={newVerse.book}
                          onChange={(e) => setNewVerse({ ...newVerse, book: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="chapter">Chapter</Label>
                        <Input
                          id="chapter"
                          type="number"
                          placeholder="3"
                          value={newVerse.chapter}
                          onChange={(e) => setNewVerse({ ...newVerse, chapter: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="verse">Verse</Label>
                        <Input
                          id="verse"
                          type="number"
                          placeholder="16"
                          value={newVerse.verse}
                          onChange={(e) => setNewVerse({ ...newVerse, verse: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="text">Verse Text</Label>
                      <Textarea
                        id="text"
                        placeholder="For God so loved the world..."
                        value={newVerse.text}
                        onChange={(e) => setNewVerse({ ...newVerse, text: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <Button onClick={handleAddVerse} className="w-full">
                      Save Verse
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {favoriteVerses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No favorite verses yet. Start adding verses that speak to your heart!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {favoriteVerses.map((verse) => (
                  <Card key={verse.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge variant="secondary" className="mb-2">
                            {verse.verse_reference}
                          </Badge>
                          <p className="text-foreground italic mb-2">
                            "{verse.verse_text}"
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Added {new Date(verse.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <ShareDialog
                            content={{
                              title: `Scripture: ${verse.verse_reference}`,
                              text: `"${verse.verse_text}" - ${verse.verse_reference}`,
                              url: "https://www.bible.com/bible"
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </ShareDialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVerse(verse.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-playfair text-xl text-primary">
            Daily Scripture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-6 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <Badge variant="outline">Philippians 4:13</Badge>
              <ShareDialog
                content={{
                  title: "Daily Scripture: Philippians 4:13",
                  text: "\"I can do all things through Christ who strengthens me.\" - Philippians 4:13\n\nRemember that God's strength is made perfect in our weakness. Trust in Him today.",
                  url: "https://www.bible.com/bible"
                }}
              >
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </ShareDialog>
            </div>
            <p className="text-lg italic text-foreground mb-4">
              "I can do all things through Christ who strengthens me."
            </p>
            <p className="text-sm text-muted-foreground">
              Remember that God's strength is made perfect in our weakness. Trust in Him today.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}