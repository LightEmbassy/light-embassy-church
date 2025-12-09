import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { ShareDialog } from "@/components/sharing/ShareDialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Play, Clock, Users, ExternalLink, Share2, ArrowLeft } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface VideoItem {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  views: string
  publishedAt: string
  embedId: string
}

interface WatchSectionProps {
  onBack?: () => void
}

export function WatchSection({ onBack }: WatchSectionProps) {
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null)
  const [featuredVideos, setFeaturedVideos] = useState<VideoItem[]>([])
  const [podcastVideos, setPodcastVideos] = useState<VideoItem[]>([])
  const [devotionalVideos, setDevotionalVideos] = useState<VideoItem[]>([])
  const [teachingVideos, setTeachingVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>({
    featured: true,
    podcast: true,
    devotional: true,
    teaching: true
  })
  const { toast } = useToast()

  const fetchVideos = async (category: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-youtube-videos', {
        body: { category, maxResults: category === 'featured' ? 10 : 15 }
      })

      if (error) {
        console.error(`Error fetching ${category} videos:`, error)
        throw error
      }

      return data?.videos || []
    } catch (error) {
      console.error(`Failed to fetch ${category} videos:`, error)
      toast({
        title: "Error loading videos",
        description: "Unable to load videos. Please try again later.",
        variant: "destructive"
      })
      return []
    }
  }

  useEffect(() => {
    const loadAllVideos = async () => {
      // Load featured videos first
      const featured = await fetchVideos('featured')
      setFeaturedVideos(featured)
      setLoading(prev => ({ ...prev, featured: false }))

      // Load other categories in parallel
      const [podcast, devotional, teaching] = await Promise.all([
        fetchVideos('podcast'),
        fetchVideos('devotional'),
        fetchVideos('teaching')
      ])

      setPodcastVideos(podcast)
      setDevotionalVideos(devotional)
      setTeachingVideos(teaching)
      setLoading({ featured: false, podcast: false, devotional: false, teaching: false })
    }

    loadAllVideos()
  }, [])

  const getYouTubeEmbedUrl = (embedId: string) => {
    if (embedId.startsWith("videoseries")) {
      return `https://www.youtube.com/embed/${embedId}`
    }
    return `https://www.youtube.com/embed/${embedId}?autoplay=1&rel=0`
  }

  const getYouTubeWatchUrl = (embedId: string) => {
    if (embedId.startsWith("videoseries")) {
      return `https://www.youtube.com/playlist?${embedId.split("?")[1]}`
    }
    return `https://www.youtube.com/watch?v=${embedId}`
  }

  const VideoCard = ({ video }: { video: VideoItem }) => (
    <Card 
      className="group cursor-pointer hover:shadow-divine transition-divine"
      onClick={() => setPlayingVideo(video)}
    >
      <CardContent className="p-0">
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            <img
              src={video.thumbnail}
              alt={video.title}
              className="object-cover w-full h-full rounded-t-lg"
              onError={(e) => {
                // Fallback to default YouTube thumbnail
                e.currentTarget.src = `https://img.youtube.com/vi/${video.embedId}/hqdefault.jpg`
              }}
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-divine rounded-t-lg" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 rounded-full p-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
                <Play className="h-8 w-8 text-primary fill-primary" />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {video.duration}
            </div>
          </AspectRatio>
        </div>
        <div className="p-4">
          <h3 className="font-inter font-semibold text-foreground line-clamp-2 mb-2">
            {video.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {video.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {video.views}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {video.publishedAt}
              </div>
            </div>
            <ShareDialog
              content={{
                title: video.title,
                text: `Watch this message: ${video.title}\n\n${video.description}`,
                url: getYouTubeWatchUrl(video.embedId)
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
      </CardContent>
    </Card>
  )

  const VideoSkeleton = () => (
    <Card>
      <CardContent className="p-0">
        <Skeleton className="aspect-video rounded-t-lg" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex justify-between mt-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderVideoGrid = (videos: VideoItem[], isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <VideoSkeleton key={i} />)}
        </div>
      )
    }

    if (videos.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No videos available at the moment.
        </div>
      )
    }

    return (
      <div className="grid gap-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
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
          <h1 className="font-playfair text-3xl font-bold text-primary">Watch</h1>
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <a href="https://www.youtube.com/@lightembassychurchlundswed41" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              YouTube Channel
            </a>
          </Button>
        </div>
        <p className="text-muted-foreground">
          Watch our videos, filled with the pure word of God's grace
        </p>
      </div>

      {/* Content Tabs */}
      <div className="px-6">
        <Tabs defaultValue="featured" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="podcast">Podcast</TabsTrigger>
            <TabsTrigger value="devotional">Devotional</TabsTrigger>
            <TabsTrigger value="teaching">Teaching</TabsTrigger>
          </TabsList>
          
          <TabsContent value="featured" className="mt-6">
            <div className="space-y-4">
              <h2 className="font-playfair text-xl font-semibold text-foreground">
                Latest Videos
              </h2>
              {renderVideoGrid(featuredVideos, loading.featured)}
            </div>
          </TabsContent>
          
          <TabsContent value="podcast" className="mt-6">
            <div className="space-y-4">
              <h2 className="font-playfair text-xl font-semibold text-foreground">
                Light Embassy Podcast
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                Revealing the Bible, discovering the truth, living the best life!
              </p>
              {renderVideoGrid(podcastVideos, loading.podcast)}
              <Button variant="outline" className="w-full gap-2" asChild>
                <a href="https://www.youtube.com/playlist?list=PLqEHLUKupSnCw8WAJHCscE9f0lmFhzB_Z" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  View Full Podcast Playlist
                </a>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="devotional" className="mt-6">
            <div className="space-y-4">
              <h2 className="font-playfair text-xl font-semibold text-foreground">
                The Trumpeter - Daily Devotional
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                Empowering you with knowledge and resources for spiritual edification and growth.
              </p>
              {renderVideoGrid(devotionalVideos, loading.devotional)}
              <Button variant="outline" className="w-full gap-2" asChild>
                <a href="https://www.youtube.com/playlist?list=PLqEHLUKupSnAOEp8ZSfuhu7H2CuKkRZKU" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  View Full Devotional Playlist
                </a>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="teaching" className="mt-6">
            <div className="space-y-4">
              <h2 className="font-playfair text-xl font-semibold text-foreground">
                The Spiritual Man - Teaching Series
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                Deep teachings on the topic of "the spiritual man" from Light Embassy Church.
              </p>
              {renderVideoGrid(teachingVideos, loading.teaching)}
              <Button variant="outline" className="w-full gap-2" asChild>
                <a href="https://www.youtube.com/playlist?list=PLqEHLUKupSnB1GZiueI895TJJ9v6oRJoa" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  View Full Teaching Playlist
                </a>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Live Section */}
      <div className="p-6 mt-8">
        <Card className="bg-gradient-spiritual text-white">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Coming Soon
              </div>
              <h3 className="font-playfair text-2xl font-bold">Live Services</h3>
              <p className="text-white/90">
                Join us for live worship services and special events
              </p>
              <Button variant="secondary" size="lg" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                Get Notified
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Player Dialog */}
      <Dialog open={!!playingVideo} onOpenChange={(open) => !open && setPlayingVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="font-playfair text-lg pr-8">
                {playingVideo?.title}
              </DialogTitle>
            </div>
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
              <div className="mt-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {playingVideo.description}
                </p>
                <div className="flex items-center gap-2">
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
                      text: `Watch this message: ${playingVideo.title}\n\n${playingVideo.description}`,
                      url: getYouTubeWatchUrl(playingVideo.embedId)
                    }}
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </ShareDialog>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
