import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MessageSquare, Plus, Eye, Clock, Pin, Search, ArrowLeft, Send } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface ForumTopic {
  id: string
  user_id: string
  title: string
  content: string
  status: string
  is_pinned: boolean
  views_count: number
  replies_count: number
  created_at: string
  profile?: {
    username: string
    avatar_url: string | null
  }
}

interface ForumReply {
  id: string
  topic_id: string
  user_id: string
  content: string
  status: string
  created_at: string
  profile?: {
    username: string
    avatar_url: string | null
  }
}

export function ForumSection() {
  const { user } = useAuth()
  const [topics, setTopics] = useState<ForumTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null)
  const [replies, setReplies] = useState<ForumReply[]>([])
  const [newReply, setNewReply] = useState("")
  const [repliesLoading, setRepliesLoading] = useState(false)

  useEffect(() => {
    fetchTopics()
    
    const channel = supabase
      .channel('forum-topics-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'forum_topics' },
        () => fetchTopics()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch profiles for topics
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(t => t.user_id))]
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, avatar_url')
          .in('user_id', userIds)

        const topicsWithProfiles = data.map(topic => ({
          ...topic,
          profile: profiles?.find(p => p.user_id === topic.user_id)
        }))
        setTopics(topicsWithProfiles)
      } else {
        setTopics([])
      }
    } catch (error) {
      console.error('Error fetching topics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReplies = async (topicId: string) => {
    setRepliesLoading(true)
    try {
      const { data, error } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(r => r.user_id))]
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, avatar_url')
          .in('user_id', userIds)

        const repliesWithProfiles = data.map(reply => ({
          ...reply,
          profile: profiles?.find(p => p.user_id === reply.user_id)
        }))
        setReplies(repliesWithProfiles)
      } else {
        setReplies([])
      }
    } catch (error) {
      console.error('Error fetching replies:', error)
    } finally {
      setRepliesLoading(false)
    }
  }

  const handleCreateTopic = async () => {
    if (!user) {
      toast.error("Please sign in to create a topic")
      return
    }

    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('forum_topics')
        .insert({
          user_id: user.id,
          title: newTitle.trim(),
          content: newContent.trim()
        })

      if (error) throw error

      toast.success("Topic submitted! It will appear after moderation.")
      setNewTitle("")
      setNewContent("")
      setIsDialogOpen(false)
      fetchTopics()
    } catch (error: any) {
      console.error('Error creating topic:', error)
      toast.error("Failed to create topic")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReply = async () => {
    if (!user) {
      toast.error("Please sign in to reply")
      return
    }

    if (!newReply.trim() || !selectedTopic) {
      toast.error("Please enter a reply")
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('forum_replies')
        .insert({
          topic_id: selectedTopic.id,
          user_id: user.id,
          content: newReply.trim()
        })

      if (error) throw error

      toast.success("Reply submitted! It will appear after moderation.")
      setNewReply("")
      fetchReplies(selectedTopic.id)
    } catch (error: any) {
      console.error('Error creating reply:', error)
      toast.error("Failed to submit reply")
    } finally {
      setSubmitting(false)
    }
  }

  const openTopic = async (topic: ForumTopic) => {
    setSelectedTopic(topic)
    fetchReplies(topic.id)
    
    // Increment view count
    await supabase
      .from('forum_topics')
      .update({ views_count: topic.views_count + 1 })
      .eq('id', topic.id)
  }

  const getInitials = (username?: string) => {
    if (!username) return "?"
    return username.slice(0, 2).toUpperCase()
  }

  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (selectedTopic) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedTopic(null)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Forum
        </Button>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(selectedTopic.profile?.username)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{selectedTopic.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    by {selectedTopic.profile?.username || "Anonymous"} • {formatDistanceToNow(new Date(selectedTopic.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              {selectedTopic.is_pinned && (
                <Badge variant="secondary" className="gap-1">
                  <Pin className="h-3 w-3" />
                  Pinned
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-foreground whitespace-pre-wrap">{selectedTopic.content}</p>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Replies ({replies.length})
              </h3>

              {repliesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading replies...</div>
              ) : replies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No replies yet. Be the first to respond!
                </div>
              ) : (
                <div className="space-y-4">
                  {replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(reply.profile?.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {reply.profile?.username || "Anonymous"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {user ? (
                <div className="mt-6 flex gap-2">
                  <Textarea
                    placeholder="Write your reply..."
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button 
                    onClick={handleSubmitReply} 
                    disabled={submitting || !newReply.trim()}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-muted-foreground">
                    <a href="/auth" className="text-primary hover:underline">Sign in</a> to reply to this topic
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Topic
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Start a New Discussion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {!user && (
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-muted-foreground">
                    Please <a href="/auth" className="text-primary hover:underline">sign in</a> to create a topic
                  </p>
                </div>
              )}
              <div>
                <Input
                  placeholder="Topic title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  disabled={!user}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Share your thoughts, questions, or insights..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="min-h-[150px]"
                  disabled={!user}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your topic will be reviewed by moderators before being published.
              </p>
              <Button 
                onClick={handleCreateTopic} 
                disabled={submitting || !user || !newTitle.trim() || !newContent.trim()}
                className="w-full"
              >
                {submitting ? "Submitting..." : "Submit Topic"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-5 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTopics.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Topics Yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to start a discussion!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTopics.map((topic) => (
            <Card 
              key={topic.id} 
              className="hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => openTopic(topic)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(topic.profile?.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {topic.is_pinned && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </Badge>
                      )}
                      <h3 className="font-semibold text-foreground truncate">
                        {topic.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {topic.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{topic.profile?.username || "Anonymous"}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {topic.replies_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {topic.views_count}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}