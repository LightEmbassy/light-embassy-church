import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Share, Headphones, Play } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

interface PodcastEpisode {
  id: string
  title: string
  description: string | null
  audio_url: string
  image_url: string | null
  published_at: string | null
  link?: string
}

export function DailyInspiration() {
  const [latestEpisode, setLatestEpisode] = useState<PodcastEpisode | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLatestEpisode()
  }, [])

  const fetchLatestEpisode = async () => {
    try {
      // First try database
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data) {
        setLatestEpisode(data)
        setLoading(false)
        return
      }

      // Fallback: fetch from edge function
      const { data: feedData, error: feedError } = await supabase.functions.invoke('fetch-podcasts')
      
      if (feedData && feedData.length > 0) {
        const episode = feedData[0]
        setLatestEpisode({
          id: episode.id || '1',
          title: episode.title,
          description: episode.description,
          audio_url: episode.audioUrl || episode.link,
          image_url: episode.imageUrl,
          published_at: episode.pubDate,
          link: episode.link
        })
      }
    } catch (error) {
      console.error('Error fetching latest episode:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleListen = () => {
    const url = latestEpisode?.link || latestEpisode?.audio_url
    if (url) {
      window.open(url, '_blank')
    } else {
      window.open('https://lightembassychurch.podbean.com/', '_blank')
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
    "Discover the truth about divine health and God's perfect will for your wellbeing."
  const truncatedDescription = description.length > 120 
    ? description.substring(0, 120) + '...' 
    : description
  const imageUrl = latestEpisode?.image_url || "https://pbcdn1.podbean.com/imglogo/image-logo/16660439/LEC_csvbaz.jpg"

  return (
    <div className="p-6 space-y-4">
      <h2 className="font-playfair text-2xl font-semibold text-foreground">
        Latest Teaching
      </h2>
      
      <Card className="border-0 shadow-divine overflow-hidden">
        {/* Thumbnail with Play Button */}
        <div className="relative">
          <img 
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Play Button Overlay */}
          <button
            onClick={handleListen}
            className="absolute inset-0 flex items-center justify-center group"
          >
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </button>
          
          {/* Episode Badge */}
          <div className="absolute top-3 left-3 px-2 py-1 bg-primary/90 rounded-full">
            <span className="text-xs font-medium text-primary-foreground">Latest Episode</span>
          </div>
        </div>

        <CardContent className="p-4 bg-gradient-spiritual">
          <div className="text-white space-y-2">
            <h3 className="font-playfair text-lg font-semibold line-clamp-2">
              {title}
            </h3>
            <p className="text-white/80 text-sm font-inter line-clamp-2">
              {truncatedDescription}
            </p>
            {latestEpisode?.published_at && (
              <p className="text-white/60 text-xs font-inter">
                {new Date(latestEpisode.published_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            )}
          </div>
          
          <div className="flex gap-2 pt-3">
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-divine flex-1"
              onClick={handleListen}
            >
              <Headphones className="mr-2 h-4 w-4" />
              Listen Now
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/40 text-white hover:bg-white/20 transition-divine"
              onClick={handleShare}
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
