import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { ShareDialog } from "@/components/sharing/ShareDialog"
import { Play, Pause, Clock, ExternalLink, Headphones, Share2, ArrowLeft, Loader2, Volume2, X } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { Slider } from "@/components/ui/slider"

interface Episode {
  id: string
  title: string
  description: string
  artwork: string
  duration: string
  publishedAt: string
  audioUrl: string
}

interface PodcastSectionProps {
  onBack?: () => void
}

export function PodcastSection({ onBack }: PodcastSectionProps) {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [fallbackImage, setFallbackImage] = useState("https://pbcdn1.podbean.com/imglogo/image-logo/16660439/LEC_csvbaz.jpg")
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchEpisodes()
  }, [])

  const fetchEpisodes = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-podcasts')
      
      if (error) throw error
      
      if (data?.episodes) {
        setEpisodes(data.episodes)
      }
      if (data?.fallbackImage) {
        setFallbackImage(data.fallbackImage)
      }
    } catch (error) {
      console.error('Error fetching podcasts:', error)
    } finally {
      setLoading(false)
    }
  }

  const playEpisode = (episode: Episode) => {
    if (currentEpisode?.id === episode.id) {
      togglePlayPause()
    } else {
      setCurrentEpisode(episode)
      setIsPlaying(true)
      setCurrentTime(0)
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setCurrentEpisode(null)
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (currentEpisode && audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
  }, [currentEpisode])

  const EpisodeCard = ({ episode }: { episode: Episode }) => {
    const isCurrentlyPlaying = currentEpisode?.id === episode.id && isPlaying
    const isCurrentEpisode = currentEpisode?.id === episode.id

    return (
      <Card 
        className={`group cursor-pointer hover:shadow-divine transition-divine ${isCurrentEpisode ? 'ring-2 ring-primary' : ''}`}
        onClick={() => playEpisode(episode)}
      >
        <CardContent className="p-0">
          <div className="flex gap-4 p-4">
            <div className="relative flex-shrink-0">
              <AspectRatio ratio={1} className="w-20">
                <img
                  src={episode.artwork}
                  alt={episode.title}
                  className="object-cover w-full h-full rounded-lg"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-divine rounded-lg" />
                <div className={`absolute inset-0 flex items-center justify-center transition-divine ${isCurrentEpisode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <div className="bg-white/90 rounded-full p-2 backdrop-blur-sm">
                    {isCurrentlyPlaying ? (
                      <Pause className="h-4 w-4 text-primary fill-primary" />
                    ) : (
                      <Play className="h-4 w-4 text-primary fill-primary" />
                    )}
                  </div>
                </div>
              </AspectRatio>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-inter font-semibold text-foreground line-clamp-2 mb-2">
                {episode.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {episode.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {episode.duration}
                  </div>
                  <span>{episode.publishedAt}</span>
                </div>
                <ShareDialog
                  content={{
                    title: episode.title,
                    text: `Listen to this podcast episode: ${episode.title}\n\n${episode.description}`,
                    url: episode.audioUrl
                  }}
                >
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </ShareDialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-16">
      {/* Header */}
      <div className="p-6">
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
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-playfair text-3xl font-bold text-primary">Podcast</h1>
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <a href="https://lightembassychurch.podbean.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              View on Podbean
            </a>
          </Button>
        </div>
        <p className="text-muted-foreground">
          Revealing the Bible, discovering the truth, living the best life!
        </p>
      </div>

      {/* Podcast Info */}
      <div className="px-6 mb-6">
        <Card className="bg-gradient-spiritual text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <AspectRatio ratio={1} className="w-20">
                  <img
                    src="https://pbcdn1.podbean.com/imglogo/image-logo/16660439/LEC_csvbaz.jpg"
                    alt="Light Embassy Church Podcast"
                    className="object-cover w-full h-full rounded-lg"
                  />
                </AspectRatio>
              </div>
              <div className="flex-1">
                <h2 className="font-playfair text-xl font-bold mb-2">Light Embassy Church</h2>
                <p className="text-white/90 text-sm mb-3">
                  Revealing the Bible, discovering the truth, living the best life!
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30" asChild>
                    <a href="https://podcasts.apple.com/us/podcast/light-embassy-church/id1700709017" target="_blank" rel="noopener noreferrer">
                      Apple Podcasts
                    </a>
                  </Button>
                  <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30" asChild>
                    <a href="https://open.spotify.com/show/0ENCdKMSIjSoE9e5CKJxUb" target="_blank" rel="noopener noreferrer">
                      Spotify
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Episodes */}
      <div className="px-6">
        <div className="space-y-4">
          <h2 className="font-playfair text-xl font-semibold text-foreground">
            Latest Episodes
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading episodes...</span>
            </div>
          ) : episodes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No episodes available at this time.
            </p>
          ) : (
            <div className="space-y-3">
              {episodes.map((episode) => (
                <EpisodeCard key={episode.id} episode={episode} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subscribe Section */}
      <div className="p-6 mt-8">
        <Card className="bg-gradient-peace text-primary">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm">
                <Headphones className="w-4 h-4" />
                Subscribe
              </div>
              <h3 className="font-playfair text-2xl font-bold">Never Miss an Episode</h3>
              <p className="text-primary/80">
                Subscribe to our podcast on your favorite platform
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="secondary" size="lg" asChild>
                  <a href="https://podcasts.apple.com/us/podcast/light-embassy-church/id1700709017" target="_blank" rel="noopener noreferrer">
                    Apple Podcasts
                  </a>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <a href="https://open.spotify.com/show/0ENCdKMSIjSoE9e5CKJxUb" target="_blank" rel="noopener noreferrer">
                    Spotify
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audio Player */}
      {currentEpisode && (
        <div className="fixed bottom-16 left-0 right-0 bg-card border-t shadow-lg z-50">
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <img 
                src={currentEpisode.artwork} 
                alt={currentEpisode.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm line-clamp-1">
                  {currentEpisode.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(currentTime)} / {formatTime(audioDuration || 0)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={closePlayer}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Slider
              value={[currentTime]}
              max={audioDuration || 100}
              step={1}
              onValueChange={handleSeek}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentEpisode?.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  )
}