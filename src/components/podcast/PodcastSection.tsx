import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { ShareDialog } from "@/components/sharing/ShareDialog"
import { Play, Clock, ExternalLink, Headphones, Share2, ArrowLeft } from "lucide-react"

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
  const episodes: Episode[] = [
    {
      id: "1",
      title: "Welcome to Light Embassy Church Podcast",
      description: "Revealing the Bible, discovering the truth, living the best life! Join us as we begin this journey together.",
      artwork: "https://pbcdn1.podbean.com/imglogo/image-logo/16660439/LEC_csvbaz.jpg",
      duration: "25:30",
      publishedAt: "Aug 02, 2023",
      audioUrl: "https://lightembassychurch.podbean.com/e/welcome-to-light-embassy-church-podcast/"
    }
  ]

  const EpisodeCard = ({ episode }: { episode: Episode }) => (
    <Card className="group cursor-pointer hover:shadow-divine transition-divine">
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
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-divine">
                <div className="bg-white/90 rounded-full p-2 backdrop-blur-sm">
                  <Play className="h-4 w-4 text-primary fill-primary" />
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
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </ShareDialog>
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
          <div className="space-y-3">
            {episodes.map((episode) => (
              <EpisodeCard key={episode.id} episode={episode} />
            ))}
          </div>
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
    </div>
  )
}