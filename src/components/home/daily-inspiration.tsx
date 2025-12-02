import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Share, Headphones, ExternalLink } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

interface PodcastEpisode {
  id: string
  title: string
  description: string | null
  audio_url: string
  published_at: string | null
}

export function DailyInspiration() {
  const [latestEpisode, setLatestEpisode] = useState<PodcastEpisode | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLatestEpisode()
  }, [])

  const fetchLatestEpisode = async () => {
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      setLatestEpisode(data)
    } catch (error) {
      console.error('Error fetching latest episode:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleListen = () => {
    if (latestEpisode?.audio_url) {
      window.open(latestEpisode.audio_url, '_blank')
    }
  }

  const handleShare = async () => {
    if (latestEpisode) {
      const shareData = {
        title: latestEpisode.title,
        text: `Listen to "${latestEpisode.title}" from Light Embassy Church`,
        url: latestEpisode.audio_url
      }
      
      if (navigator.share) {
        try {
          await navigator.share(shareData)
        } catch (err) {
          console.log('Share cancelled')
        }
      } else {
        navigator.clipboard.writeText(latestEpisode.audio_url)
      }
    }
  }

  // Fallback content if no episodes
  const title = latestEpisode?.title || "Why you ought not to be sick"
  const description = latestEpisode?.description || 
    "Discover the truth about divine health and God's perfect will for your wellbeing. Learn how faith and understanding can transform your perspective on healing."
  const truncatedDescription = description.length > 150 
    ? description.substring(0, 150) + '...' 
    : description

  return (
    <div className="p-6 space-y-4">
      <h2 className="font-playfair text-2xl font-semibold text-foreground">
        Latest Teaching
      </h2>
      
      <Card className="border-0 shadow-divine bg-gradient-spiritual">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-white">
            <BookOpen className="h-5 w-5" />
            <span className="font-inter font-medium">Light Embassy Podcast</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-white space-y-3">
            <h3 className="font-playfair text-xl font-semibold">
              "{title}"
            </h3>
            <p className="text-white/90 leading-relaxed font-inter text-sm">
              {truncatedDescription}
            </p>
            <p className="text-white/80 text-sm font-inter">
              {latestEpisode?.published_at 
                ? `Published ${new Date(latestEpisode.published_at).toLocaleDateString()}`
                : 'Latest Episode'
              }
            </p>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-divine"
              onClick={handleListen}
            >
              <Headphones className="mr-2 h-4 w-4" />
              Listen
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/40 text-white hover:bg-white/20 transition-divine"
              onClick={handleShare}
            >
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
