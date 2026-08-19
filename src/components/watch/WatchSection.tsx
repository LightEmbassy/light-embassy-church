import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { ShareDialog } from "@/components/sharing/ShareDialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Play, Clock, ExternalLink, Share2, ArrowLeft, Search, X, History } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useMediaHistory } from "@/hooks/useMediaHistory"
import { useAuth } from "@/contexts/AuthContext"

interface VideoItem {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  embedId: string
}

interface RecentlyWatchedItem {
  id: string
  media_id: string
  media_title: string
  watched_at: string
}

interface WatchSectionProps {
  onBack?: () => void
}

export function WatchSection({ onBack }: WatchSectionProps) {
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null)
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [recentlyWatched, setRecentlyWatched] = useState<RecentlyWatchedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const { trackMedia } = useMediaHistory()
  const { user } = useAuth()

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos
    const query = searchQuery.toLowerCase().trim()
    return videos.filter(video => 
      video.title.toLowerCase().includes(query) ||
      video.description.toLowerCase().includes(query)
    )
  }, [videos, searchQuery])

  const PAGE_SIZE = 15
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(filteredVideos.length / PAGE_SIZE))
  const pagedVideos = useMemo(
    () => filteredVideos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredVideos, page]
  )

  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.functions.invoke('fetch-youtube-videos', {
        body: { maxResults: 90 }
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

  const fetchRecentlyWatched = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('media_history')
      .select('id, media_id, media_title, watched_at')
      .eq('user_id', user.id)
      .eq('media_type', 'video')
      .order('watched_at', { ascending: false })
      .limit(10)
    
    if (!error && data) {
      // Remove duplicates, keeping only the most recent watch of each video
      const uniqueVideos = data.reduce((acc: RecentlyWatchedItem[], item) => {
        if (!acc.find(v => v.media_id === item.media_id)) {
          acc.push(item)
        }
        return acc
      }, [])
      setRecentlyWatched(uniqueVideos.slice(0, 6))
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  useEffect(() => {
    if (user) {
      fetchRecentlyWatched()
    }
  }, [user])

  const getYouTubeEmbedUrl = (embedId: string) => {
    return `https://www.youtube.com/embed/${embedId}?autoplay=1&rel=0`
  }

  const getYouTubeWatchUrl = (embedId: string) => {
    return `https://www.youtube.com/watch?v=${embedId}`
  }

  const handlePlayVideo = (video: VideoItem) => {
    setPlayingVideo(video)
    trackMedia('video', video.id, video.title)
    // Refresh recently watched after a short delay
    setTimeout(() => fetchRecentlyWatched(), 1000)
  }

  const handlePlayFromHistory = (historyItem: RecentlyWatchedItem) => {
    // Find the video in the videos list to get full details
    const video = videos.find(v => v.id === historyItem.media_id)
    if (video) {
      handlePlayVideo(video)
    } else {
      // If video not in current list, create a minimal video object
      // The embed ID is stored as the media_id
      setPlayingVideo({
        id: historyItem.media_id,
        title: historyItem.media_title,
        description: '',
        thumbnail: `https://i.ytimg.com/vi/${historyItem.media_id}/mqdefault.jpg`,
        publishedAt: '',
        embedId: historyItem.media_id
      })
    }
  }

  // Get thumbnail for a recently watched video
  const getHistoryThumbnail = (mediaId: string) => {
    return `https://i.ytimg.com/vi/${mediaId}/hqdefault.jpg`
  }

  const VideoCard = ({ video }: { video: VideoItem }) => {
    return (
      <Card 
        className="group cursor-pointer hover:shadow-divine transition-divine overflow-hidden"
        onClick={() => handlePlayVideo(video)}
      >
        <CardContent className="p-0">
          {/* Thumbnail */}
          <AspectRatio ratio={16 / 9} className="relative bg-muted">
            <img
              src={`https://i.ytimg.com/vi/${video.embedId}/hqdefault.jpg`}
              alt={video.title}
              loading="lazy"
              className="object-cover w-full h-full"
              onError={(e) => {
                const target = e.currentTarget
                if (target.src.includes('hqdefault')) {
                  target.src = `https://i.ytimg.com/vi/${video.embedId}/mqdefault.jpg`
                } else if (target.src.includes('mqdefault')) {
                  target.src = video.thumbnail
                }
              }}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
            
            {/* Play button - centered */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Play video: ${video.title}`} role="button">
              <div className="bg-white/95 rounded-full p-2 sm:p-3 backdrop-blur-sm group-hover:scale-110 transition-transform shadow-xl">
                <Play className="h-5 w-5 sm:h-6 sm:w-6 text-primary fill-primary" aria-hidden="true" />
              </div>
            </div>
          </AspectRatio>
          
          {/* Title and details below thumbnail */}
          <div className="p-2 sm:p-3">
            <h3 className="font-inter font-semibold text-foreground line-clamp-2 text-xs sm:text-sm leading-tight">
              {video.title}
            </h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
              {video.description}
            </p>
            <div className="flex items-center justify-between gap-1 mt-1.5">
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
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
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Share video: ${video.title}`}
                >
                  <Share2 className="h-3 w-3" aria-hidden="true" />
                </Button>
              </ShareDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const VideoSkeleton = () => (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <AspectRatio ratio={16 / 9}>
          <Skeleton className="w-full h-full" />
        </AspectRatio>
        <div className="p-2 sm:p-3 space-y-1.5">
          <Skeleton className="h-3 sm:h-4 w-full" />
          <Skeleton className="h-3 sm:h-4 w-3/4" />
          <div className="flex justify-between mt-1.5">
            <Skeleton className="h-2.5 sm:h-3 w-16" />
            <Skeleton className="h-6 w-6 rounded" />
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
          Welcome to our video library. Here you will find sermons, Bible teachings, worship sessions, and
          testimonies from Light Embassy Church. Every video is crafted to help you grow in faith, understand
          Scripture, and experience the presence of God. Browse the latest messages, search by topic, or pick up
          where you left off in your recently watched list.
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
                aria-label="Clear search"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Recently Watched Section */}
      {user && recentlyWatched.length > 0 && !searchQuery && (
        <div className="px-6 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-primary" />
            <h2 className="font-inter font-semibold text-foreground text-sm">Recently Watched</h2>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-3">
              {recentlyWatched.map((item) => (
                <Card 
                  key={item.id}
                  className="group cursor-pointer hover:shadow-divine transition-divine overflow-hidden flex-shrink-0 w-32 sm:w-40"
                  onClick={() => handlePlayFromHistory(item)}
                >
                  <CardContent className="p-0">
                    <AspectRatio ratio={16 / 9} className="relative bg-muted">
                      <img
                        src={getHistoryThumbnail(item.media_id)}
                        alt={item.media_title}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          const target = e.currentTarget
                          if (!target.src.includes('hqdefault')) {
                            target.src = `https://i.ytimg.com/vi/${item.media_id}/hqdefault.jpg`
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Play video: ${item.media_title}`} role="button">
                        <div className="bg-white/95 rounded-full p-1.5 backdrop-blur-sm group-hover:scale-110 transition-transform shadow-xl">
                          <Play className="h-3 w-3 text-primary fill-primary" aria-hidden="true" />
                        </div>
                      </div>
                    </AspectRatio>
                    <div className="p-1.5 sm:p-2">
                      <h3 className="font-inter font-medium text-foreground line-clamp-2 text-[10px] sm:text-xs leading-tight">
                        {item.media_title}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

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
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {pagedVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  Prev
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <Button
                    key={n}
                    variant={n === page ? "default" : "outline"}
                    size="sm"
                    className="w-9 px-0"
                    onClick={() => setPage(n)}
                    aria-label={`Page ${n}`}
                    aria-current={n === page ? "page" : undefined}
                  >
                    {n}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                >
                  Next
                </Button>
              </div>
            )}
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredVideos.length)} of {filteredVideos.length} videos
            </p>
          </>
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
