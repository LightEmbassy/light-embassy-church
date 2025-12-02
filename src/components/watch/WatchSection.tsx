import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { ShareDialog } from "@/components/sharing/ShareDialog"
import { Play, Clock, Users, ExternalLink, Share2, ArrowLeft } from "lucide-react"

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
  // Videos from Light Embassy Church - https://lightembassy.org/watch
  const featuredVideos: VideoItem[] = [
    {
      id: "1",
      title: "The King Is Coming!",
      description: "A powerful message from Light Embassy Church about the return of Christ and living in expectation of His coming.",
      thumbnail: "https://img.youtube.com/vi/J8zRYVAsqw8/maxresdefault.jpg",
      duration: "30:32",
      views: "Featured",
      publishedAt: "Light Embassy",
      embedId: "J8zRYVAsqw8"
    },
    {
      id: "2", 
      title: "Light Embassy Church Healing Special Feature",
      description: "A special feature on healing testimonies and the power of God's healing grace at Light Embassy Church.",
      thumbnail: "https://img.youtube.com/vi/pMRaAr6kc3o/maxresdefault.jpg",
      duration: "19:42",
      views: "Featured",
      publishedAt: "Light Embassy",
      embedId: "pMRaAr6kc3o"
    },
    {
      id: "3",
      title: "His Word is Greater Than Feeling",
      description: "An encouraging message about trusting God's Word above our feelings and circumstances.",
      thumbnail: "https://img.youtube.com/vi/UZP-pj1yQCc/maxresdefault.jpg", 
      duration: "15:48",
      views: "Featured",
      publishedAt: "Light Embassy",
      embedId: "UZP-pj1yQCc"
    }
  ]

  // Light Embassy Podcast playlist
  const podcast: VideoItem[] = [
    {
      id: "4",
      title: "Light Embassy Podcast",
      description: "Revealing the Bible, discovering the truth, living the best life! Watch and listen to the Light Embassy Podcast series.",
      thumbnail: "https://img.youtube.com/vi/J8zRYVAsqw8/maxresdefault.jpg",
      duration: "Series",
      views: "Podcast",
      publishedAt: "Light Embassy",
      embedId: "videoseries?list=PLqEHLUKupSnCw8WAJHCscE9f0lmFhzB_Z"
    }
  ]

  // The Trumpeter - Daily Devotional
  const devotional: VideoItem[] = [
    {
      id: "5",
      title: "The Trumpeter - Daily Devotional",
      description: "We're committed to empowering you with knowledge and resources needed for your spiritual edification and growth.",
      thumbnail: "https://img.youtube.com/vi/pMRaAr6kc3o/maxresdefault.jpg",
      duration: "Series",
      views: "Devotional",
      publishedAt: "Light Embassy",
      embedId: "videoseries?list=PLqEHLUKupSnAOEp8ZSfuhu7H2CuKkRZKU"
    }
  ]

  // The Spiritual Man - Teaching Series
  const teaching: VideoItem[] = [
    {
      id: "6",
      title: "The Spiritual Man - Teaching Series",
      description: "Recordings of the teaching series at Light Embassy Church on the topic of 'the spiritual man'.",
      thumbnail: "https://img.youtube.com/vi/UZP-pj1yQCc/maxresdefault.jpg",
      duration: "Series",
      views: "Teaching",
      publishedAt: "Light Embassy",
      embedId: "videoseries?list=PLqEHLUKupSnB1GZiueI895TJJ9v6oRJoa"
    }
  ]

  const VideoCard = ({ video }: { video: VideoItem }) => (
    <Card className="group cursor-pointer hover:shadow-divine transition-divine">
      <CardContent className="p-0">
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            <img
              src={video.thumbnail}
              alt={video.title}
              className="object-cover w-full h-full rounded-t-lg"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-divine rounded-t-lg" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-divine">
              <div className="bg-white/90 rounded-full p-4 backdrop-blur-sm">
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
                {video.views} views
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
                url: `https://www.youtube.com/watch?v=${video.embedId}`
              }}
            >
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </ShareDialog>
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
                Featured Videos
              </h2>
              <div className="grid gap-4">
                {featuredVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
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
              <div className="grid gap-4">
                {podcast.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
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
              <div className="grid gap-4">
                {devotional.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
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
              <div className="grid gap-4">
                {teaching.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
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
    </div>
  )
}