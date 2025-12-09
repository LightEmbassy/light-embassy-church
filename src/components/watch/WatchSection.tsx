import { useState, useEffect, useMemo } from "react"
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

export function WatchSection({ onBack }: WatchSectionProps) {
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null)
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

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

  const VideoCard = ({ video }: { video: VideoItem }) => (
    <Card 
      className="group cursor-pointer hover:shadow-divine transition-divine overflow-hidden"
      onClick={() => setPlayingVideo(video)}
    >
      <CardContent className="p-0">
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            <img
              src={video.thumbnail}
              alt={video.title}
              className="object-cover w-full h-full"
              onError={(e) => {
                // Fallback to hqdefault if maxresdefault doesn't exist
                e.currentTarget.src = `https://i.ytimg.com/vi/${video.embedId}/hqdefault.jpg`
              }}
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-divine" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 rounded-full p-3 backdrop-blur-sm group-hover:scale-110 transition-transform shadow-lg">
                <Play className="h-6 w-6 text-primary fill-primary" />
              </div>
            </div>
          </AspectRatio>
        </div>
        <div className="p-4">
          <h3 className="font-inter font-semibold text-foreground line-clamp-2 mb-2 text-sm">
            {video.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
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
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </ShareDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )

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
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <VideoSkeleton key={i} />)}
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
          <div className="grid grid-cols-2 gap-4">
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
