import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Headphones, ExternalLink } from "lucide-react"

export function PodcastManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-semibold text-foreground">
          Podcast Management
        </h2>
        <p className="text-muted-foreground">
          Manage podcast episodes and settings
        </p>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <Headphones className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Podcast Management</h3>
          <p className="text-muted-foreground mb-4">
            Podcast content is currently managed through Podbean. Episodes are automatically synced from your Podbean account.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://lightembassychurch.podbean.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Manage on Podbean
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Episode Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Episodes</span>
                <span className="text-sm font-medium">1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Latest Episode</span>
                <span className="text-sm font-medium">Aug 02, 2023</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Platform</span>
                <span className="text-sm font-medium">Podbean</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Apple Podcasts</span>
                <span className="text-xs text-green-600">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Spotify</span>
                <span className="text-xs text-green-600">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Podbean</span>
                <span className="text-xs text-green-600">Primary</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}