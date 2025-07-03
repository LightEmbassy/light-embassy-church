import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Play, Clock, Users, ExternalLink } from "lucide-react"

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

export function WatchSection() {
  // Real videos from Light Embassy Church and related Swedish churches
  const featuredVideos: VideoItem[] = [
    {
      id: "1",
      title: "Step out of your boat - Joakim Lundqvist, Pastor Word of Life Sweden",
      description: "Incredible stories of God at work through Eastern Europe, including the humanitarian refugee crisis. A powerful message about stepping out in faith.",
      thumbnail: "https://img.youtube.com/vi/dQbISDDbt_A/maxresdefault.jpg",
      duration: "45:30",
      views: "2.1K",
      publishedAt: "March 2022",
      embedId: "dQbISDDbt_A"
    },
    {
      id: "2", 
      title: "The Power To See - Pastor Wilberforce Bezudde",
      description: "Pastor Wilberforce teaches the importance of using your faith to see. From the IBC Conference in Stockholm.",
      thumbnail: "https://img.youtube.com/vi/K0BPLdZQu8E/maxresdefault.jpg",
      duration: "32:15",
      views: "136",
      publishedAt: "June 2023",
      embedId: "K0BPLdZQu8E"
    },
    {
      id: "3",
      title: "Living as Light in a Darkened World",
      description: "Pastor Tim Dunn explores living as a beacon of light and embodying wisdom in a world shadowed by darkness.",
      thumbnail: "https://img.youtube.com/vi/2dO6kKqaRKE/maxresdefault.jpg", 
      duration: "28:45",
      views: "634",
      publishedAt: "Recent",
      embedId: "2dO6kKqaRKE"
    }
  ]

  const sermons: VideoItem[] = [
    {
      id: "4",
      title: "Step out of your boat - Joakim Lundqvist",
      description: "Over 700 churches planted throughout Eastern Europe. Hear incredible stories of God at work and a message about stepping out in faith.",
      thumbnail: "https://img.youtube.com/vi/dQbISDDbt_A/maxresdefault.jpg",
      duration: "52:20",
      views: "2.1K",
      publishedAt: "March 2022", 
      embedId: "dQbISDDbt_A"
    },
    {
      id: "5",
      title: "The Power To See - Full Sermon",
      description: "Pastor Wilberforce teaches the importance of using your faith to see. A powerful message from Stockholm conference.",
      thumbnail: "https://img.youtube.com/vi/K0BPLdZQu8E/maxresdefault.jpg",
      duration: "41:15",
      views: "136",
      publishedAt: "June 2023",
      embedId: "K0BPLdZQu8E"
    },
    {
      id: "6",
      title: "What is a Simple Church?",
      description: "Exploring the essence of simple church ministry and authentic Christian community.",
      thumbnail: "https://img.youtube.com/vi/uMC3tBGqPmI/maxresdefault.jpg",
      duration: "35:20",
      views: "76",
      publishedAt: "February 2025",
      embedId: "uMC3tBGqPmI"
    }
  ]

  const worship: VideoItem[] = [
    {
      id: "7",
      title: "Glory Is The Highest Form Of Honor",
      description: "Pastor Lee's message about glory and honor in worship from Sunday service.",
      thumbnail: "https://img.youtube.com/vi/yhrZfWcUtr4/maxresdefault.jpg",
      duration: "35:45",
      views: "83",
      publishedAt: "June 2022",
      embedId: "yhrZfWcUtr4"
    },
    {
      id: "8", 
      title: "Power From On High",
      description: "Pastor Ken's message about receiving power from God in worship and ministry.",
      thumbnail: "https://img.youtube.com/vi/F5gn2nwywYE/maxresdefault.jpg",
      duration: "25:30",
      views: "21",
      publishedAt: "June 2022",
      embedId: "F5gn2nwywYE"
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
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background pb-20 pt-16">
      {/* Header */}
      <div className="p-6">
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="sermons">Sermons</TabsTrigger>
            <TabsTrigger value="worship">Worship</TabsTrigger>
          </TabsList>
          
          <TabsContent value="featured" className="mt-6">
            <div className="space-y-4">
              <h2 className="font-playfair text-xl font-semibold text-foreground">
                Featured Content
              </h2>
              <div className="grid gap-4">
                {featuredVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sermons" className="mt-6">
            <div className="space-y-4">
              <h2 className="font-playfair text-xl font-semibold text-foreground">
                Sermons & Teaching
              </h2>
              <div className="grid gap-4">
                {sermons.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="worship" className="mt-6">
            <div className="space-y-4">
              <h2 className="font-playfair text-xl font-semibold text-foreground">
                Worship & Music
              </h2>
              <div className="grid gap-4">
                {worship.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
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