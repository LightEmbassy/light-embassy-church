import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share, Send, LogIn } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"

interface CommunityPost {
  id: string
  user_id: string
  content: string
  likes_count: number
  comments_count: number
  created_at: string
  profile?: {
    username: string
  }
}

export function CommunityFeed() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [newPost, setNewPost] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [likingPosts, setLikingPosts] = useState<Set<string>>(new Set())
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchPosts()

    // Subscribe to realtime updates
    const channel = supabase
      .channel('community-posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts'
        },
        () => {
          fetchPosts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchUserLikes()
    } else {
      setLikedPosts(new Set())
    }
  }, [user])

  const fetchUserLikes = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)

      if (error) throw error

      const likedIds = new Set(data?.map(like => like.post_id) || [])
      setLikedPosts(likedIds)
    } catch (error) {
      console.error('Error fetching user likes:', error)
    }
  }

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (postsError) throw postsError
      
      if (!postsData || postsData.length === 0) {
        setPosts([])
        return
      }

      // Fetch profiles separately
      const userIds = [...new Set(postsData.map(p => p.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', userIds)

      const postsWithProfiles: CommunityPost[] = postsData.map(post => ({
        ...post,
        profile: profiles?.find(p => p.user_id === post.user_id)
      }))

      setPosts(postsWithProfiles)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error("Please sign in to post")
      return
    }

    if (!newPost.trim()) {
      toast.error("Please enter a message")
      return
    }

    if (newPost.length > 500) {
      toast.error("Message must be less than 500 characters")
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          content: newPost.trim()
        })

      if (error) throw error

      setNewPost("")
      toast.success("Posted successfully!")
    } catch (error) {
      console.error('Error posting:', error)
      toast.error("Failed to post. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) {
      toast.error("Please sign in to like posts")
      navigate('/auth')
      return
    }

    if (likingPosts.has(postId)) return

    setLikingPosts(prev => new Set(prev).add(postId))
    const isLiked = likedPosts.has(postId)

    // Optimistic update
    setLikedPosts(prev => {
      const newSet = new Set(prev)
      if (isLiked) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1
        }
      }
      return post
    }))

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          })

        if (error) throw error
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      // Revert optimistic update
      setLikedPosts(prev => {
        const newSet = new Set(prev)
        if (isLiked) {
          newSet.add(postId)
        } else {
          newSet.delete(postId)
        }
        return newSet
      })
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes_count: isLiked ? post.likes_count + 1 : post.likes_count - 1
          }
        }
        return post
      }))
      toast.error("Failed to update like")
    } finally {
      setLikingPosts(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    }
  }

  const getInitials = (username?: string) => {
    if (!username) return "U"
    return username.slice(0, 2).toUpperCase()
  }

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return "Just now"
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="font-playfair text-2xl font-semibold text-foreground">
        Community
      </h2>

      {/* Post Form */}
      <Card className="border-0 shadow-gentle bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4">
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Textarea
                placeholder="Share what's on your heart..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[80px] resize-none bg-background border-border/50 focus:border-primary"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {newPost.length}/500 characters
                </span>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !newPost.trim()}
                  size="sm"
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-3">
                Sign in to share with the community
              </p>
              <Button 
                onClick={() => navigate('/auth')}
                variant="default"
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In to Post
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <Card className="border-0 shadow-gentle">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No posts yet. Be the first to share!
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => {
            const isLiked = likedPosts.has(post.id)
            const isLiking = likingPosts.has(post.id)
            
            return (
              <Card key={post.id} className="border-0 shadow-gentle">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                        {getInitials(post.profile?.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-inter font-medium text-foreground">
                        {post.profile?.username || "Community Member"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(post.created_at)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground leading-relaxed font-inter whitespace-pre-wrap">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center gap-4 pt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`transition-divine ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'}`}
                      onClick={() => handleLike(post.id)}
                      disabled={isLiking}
                    >
                      <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                      {post.likes_count}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-divine">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {post.comments_count}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-divine">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
