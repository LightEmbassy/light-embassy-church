import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Calendar,
  Users
} from "lucide-react"

interface VideoContent {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  views: string
  publishedAt: string
  embedId: string
  category: 'featured' | 'sermons' | 'worship'
  isActive: boolean
}

export function VideoManagement() {
  const { toast } = useToast()
  const [videos, setVideos] = useState<VideoContent[]>([])
  const [loading, setLoading] = useState(true)
  const [editingVideo, setEditingVideo] = useState<VideoContent | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Sample data - in a real app, this would come from your database
  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    // Mock data - replace with actual database calls
    const mockVideos: VideoContent[] = [
      {
        id: "1",
        title: "Step out of your boat - Joakim Lundqvist",
        description: "Incredible stories of God at work through Eastern Europe, including the humanitarian refugee crisis.",
        thumbnail: "https://img.youtube.com/vi/dQbISDDbt_A/maxresdefault.jpg",
        duration: "45:30",
        views: "2.1K",
        publishedAt: "March 2022",
        embedId: "dQbISDDbt_A",
        category: "featured",
        isActive: true
      },
      {
        id: "2",
        title: "The Power To See - Pastor Wilberforce Bezudde",
        description: "Pastor Wilberforce teaches the importance of using your faith to see.",
        thumbnail: "https://img.youtube.com/vi/K0BPLdZQu8E/maxresdefault.jpg",
        duration: "32:15",
        views: "136",
        publishedAt: "June 2023",
        embedId: "K0BPLdZQu8E",
        category: "sermons",
        isActive: true
      }
    ]
    setVideos(mockVideos)
    setLoading(false)
  }

  const handleSaveVideo = async (videoData: Partial<VideoContent>) => {
    try {
      if (editingVideo) {
        // Update existing video
        setVideos(prev => 
          prev.map(video => 
            video.id === editingVideo.id 
              ? { ...video, ...videoData }
              : video
          )
        )
        toast({
          title: "Video updated",
          description: "Video content has been successfully updated."
        })
      } else {
        // Add new video
        const newVideo: VideoContent = {
          id: Date.now().toString(),
          ...videoData as VideoContent
        }
        setVideos(prev => [...prev, newVideo])
        toast({
          title: "Video added",
          description: "New video has been successfully added."
        })
      }
      setIsDialogOpen(false)
      setEditingVideo(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save video. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    try {
      setVideos(prev => prev.filter(video => video.id !== videoId))
      toast({
        title: "Video deleted",
        description: "Video has been successfully removed."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete video. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleToggleActive = async (videoId: string) => {
    try {
      setVideos(prev =>
        prev.map(video =>
          video.id === videoId
            ? { ...video, isActive: !video.isActive }
            : video
        )
      )
      toast({
        title: "Video status updated",
        description: "Video visibility has been changed."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update video status.",
        variant: "destructive"
      })
    }
  }

  const VideoForm = ({ video }: { video: VideoContent | null }) => {
    const [formData, setFormData] = useState({
      title: video?.title || "",
      description: video?.description || "",
      thumbnail: video?.thumbnail || "",
      duration: video?.duration || "",
      embedId: video?.embedId || "",
      category: video?.category || "featured" as const,
      isActive: video?.isActive ?? true
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      handleSaveVideo(formData)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Video Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="embedId">YouTube Video ID</Label>
            <Input
              id="embedId"
              placeholder="dQbISDDbt_A"
              value={formData.embedId}
              onChange={(e) => setFormData({ ...formData, embedId: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              placeholder="45:30"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="sermons">Sermons</SelectItem>
              <SelectItem value="worship">Worship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">
            {video ? "Update Video" : "Add Video"}
          </Button>
        </div>
      </form>
    )
  }

  if (loading) {
    return <div className="text-center py-8">Loading videos...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-2xl font-semibold text-foreground">
            Video Management
          </h2>
          <p className="text-muted-foreground">
            Manage sermons, teachings, and video content
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingVideo(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? "Edit Video" : "Add New Video"}
              </DialogTitle>
            </DialogHeader>
            <VideoForm video={editingVideo} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-1">
                        {video.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {video.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={video.isActive ? "default" : "secondary"}>
                        {video.isActive ? "Active" : "Hidden"}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {video.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {video.publishedAt}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {video.views} views
                    </span>
                    <span>{video.duration}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(video.id)}
                    >
                      {video.isActive ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Show
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingVideo(video)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={`https://www.youtube.com/watch?v=${video.embedId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </a>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteVideo(video.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}