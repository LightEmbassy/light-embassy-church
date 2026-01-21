import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { ShareDialog } from "@/components/sharing/ShareDialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Play, Clock, ExternalLink, Share2, ArrowLeft, Search, X } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useMediaHistory } from "@/hooks/useMediaHistory"

interface VideoItem {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  embedId: string
}

interface WatchSectionProps {
  onBack?: () => void
}

const THUMBNAIL_CACHE_KEY = 'video_thumbnails_cache'

export function WatchSection({ onBack }: WatchSectionProps) {
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null)
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [thumbnailCache, setThumbnailCache] = useState<Record<string, string>>({})
  const [generatingThumbnails, setGeneratingThumbnails] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const { trackMedia } = useMediaHistory()

  // Load cached thumbnails from localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem(THUMBNAIL_CACHE_KEY)
      if (cached) {
        setThumbnailCache(JSON.parse(cached))
      }
    } catch (e) {
      console.error('Error loading thumbnail cache:', e)
    }
  }, [])

  // Generate AI thumbnail for a video
  const generateThumbnail = useCallback(async (video: VideoItem) => {
    if (thumbnailCache[video.id] || generatingThumbnails.has(video.id)) {
      return
    }

    setGeneratingThumbnails(prev => new Set(prev).add(video.id))

    try {
      const { data, error } = await supabase.functions.invoke('generate-video-thumbnail', {
        body: { videoTitle: video.title, videoId: video.id }
      })

      if (error) {
        console.error('Error generating thumbnail:', error)
        return
      }

      if (data?.thumbnailUrl) {
        setThumbnailCache(prev => {
          const newCache = { ...prev, [video.id]: data.thumbnailUrl }
          // Save to localStorage
          try {
            localStorage.setItem(THUMBNAIL_CACHE_KEY, JSON.stringify(newCache))
          } catch (e) {
            console.error('Error saving thumbnail cache:', e)
          }
          return newCache
        })
      }
    } catch (error) {
      console.error('Failed to generate thumbnail:', error)
    } finally {
      setGeneratingThumbnails(prev => {
        const next = new Set(prev)
        next.delete(video.id)
        return next
      })
    }
  }, [thumbnailCache, generatingThumbnails])

  // Generate thumbnails for all videos
  useEffect(() => {
    if (videos.length > 0) {
      // Generate thumbnails for all videos
      videos.forEach(video => {
        if (!thumbnailCache[video.id]) {
          generateThumbnail(video)
        }
      })
    }
  }, [videos, thumbnailCache, generateThumbnail])

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos
    const query = searchQuery.toLowerCase().trim()
    return videos.filter(video => 
      video.title.toLowerCase().includes(query) ||
      video.description.toLowerCase().includes(query)
    )
  }, [videos, searchQuery])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.functions.invoke('fetch-youtube-videos', {
        body: { maxResults: 20 }
      })

      if (error) {
        console.error('Error fetching videos:', error)
        throw error
      }

      setVideos(data?.videos || [])
    } catch (error) {
      console.error('Failed to fetch videos:', error)
      toast({
        title: "Error loading videos",
        description: "Unable to load videos. Please try again later.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const getYouTubeEmbedUrl = (embedId: string) => {
    return `https://www.youtube.com/embed/${embedId}?autoplay=1&rel=0`
  }

  const getYouTubeWatchUrl = (embedId: string) => {
    return `https://www.youtube.com/watch?v=${embedId}`
  }

  const handlePlayVideo = (video: VideoItem) => {
    setPlayingVideo(video)
    trackMedia('video', video.id, video.title)
  }

  const VideoCard = ({ video }: { video: VideoItem }) => {
    const aiThumbnail = thumbnailCache[video.id]
    const isGenerating = generatingThumbnails.has(video.id)
    
    return (
      <Card 
        className="group cursor-pointer hover:shadow-divine transition-divine overflow-hidden relative"
        onClick={() => handlePlayVideo(video)}
      >
        <CardContent className="p-0">
          <AspectRatio ratio={16 / 9}>
            {/* Background thumbnail - use AI generated or YouTube fallback */}
            {isGenerating ? (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse flex items-center justify-center">
                <div className="text-xs text-muted-foreground">Generating...</div>
              </div>
            ) : (
              <img
                src={aiThumbnail || video.thumbnail}
                alt={video.title}
                className="object-cover w-full h-full"
                onError={(e) => {
                  // Fallback to YouTube thumbnails if AI thumbnail fails
                  const target = e.currentTarget;
                  if (!target.src.includes('ytimg.com')) {
                    target.src = `https://i.ytimg.com/vi/${video.embedId}/mqdefault.jpg`;
                  } else if (target.src.includes('mqdefault')) {
                    target.src = `https://i.ytimg.com/vi/${video.embedId}/hqdefault.jpg`;
                  }
                }}
              />
            )}
            {/* Dark gradient overlay for text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-black/70 group-hover:via-black/20 transition-divine" />
            
            {/* Play button - centered */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/95 rounded-full p-2 sm:p-3 backdrop-blur-sm group-hover:scale-110 transition-transform shadow-xl">
                <Play className="h-5 w-5 sm:h-6 sm:w-6 text-primary fill-primary" />
              </div>
            </div>
            
            {/* Title and info overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
              <h3 className="font-inter font-bold text-white line-clamp-2 mb-1 text-xs drop-shadow-lg">
                {video.title}
              </h3>
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1 text-[10px] text-white/80 truncate">
                  <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                  {video.publishedAt}
                </div>
                <ShareDialog
                  content={{
                    title: video.title,
                    text: `Watch: ${video.title}`,
                    url: getYouTubeWatchUrl(video.embedId)
                  }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-white hover:bg-white/20 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                </ShareDialog>
              </div>
            </div>
          </AspectRatio>
        </CardContent>
      </Card>
    )
  }

  const VideoSkeleton = () => (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Skeleton className="aspect-video" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex justify-between mt-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

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
          <h1 className="font-playfair text-3xl font-bold text-primary">Watch</h1>
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <a href="https://www.youtube.com/@lightembassychurchlundswed41" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              YouTube
            </a>
          </Button>
        </div>
        <p className="text-muted-foreground">
          Videos from Light Embassy Church
        </p>

        {/* Search Input */}
        {!loading && videos.length > 0 && (
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
              maxLength={100}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Video Grid */}
      <div className="px-6 mt-4">
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <VideoSkeleton key={i} />)}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No videos available at the moment.</p>
            <Button variant="outline" className="mt-4 gap-2" asChild>
              <a href="https://www.youtube.com/@lightembassychurchlundswed41" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Visit YouTube Channel
              </a>
            </Button>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No videos match "{searchQuery}"</p>
            <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>

      {/* Video Player Dialog */}
      <Dialog open={!!playingVideo} onOpenChange={(open) => !open && setPlayingVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="font-playfair text-lg pr-8 line-clamp-2">
              {playingVideo?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4">
            <AspectRatio ratio={16 / 9} className="bg-black rounded-lg overflow-hidden">
              {playingVideo && (
                <iframe
                  src={getYouTubeEmbedUrl(playingVideo.embedId)}
                  title={playingVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              )}
            </AspectRatio>
            {playingVideo && (
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a 
                    href={getYouTubeWatchUrl(playingVideo.embedId)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Watch on YouTube
                  </a>
                </Button>
                <ShareDialog
                  content={{
                    title: playingVideo.title,
                    text: `Watch: ${playingVideo.title}`,
                    url: getYouTubeWatchUrl(playingVideo.embedId)
                  }}
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </ShareDialog>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
