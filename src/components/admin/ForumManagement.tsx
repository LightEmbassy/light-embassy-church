import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, X, Pin, PinOff, Trash2, Eye, MessageSquare } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface ForumTopic {
  id: string
  user_id: string | null
  guest_name: string | null
  title: string
  content: string
  status: string
  is_pinned: boolean
  views_count: number
  replies_count: number
  created_at: string
  profile?: {
    username: string
  }
}

interface ForumReply {
  id: string
  topic_id: string
  user_id: string | null
  guest_name: string | null
  content: string
  status: string
  created_at: string
  topic_title?: string
  profile?: {
    username: string
  }
}

const getDisplayName = (item: ForumTopic | ForumReply) => {
  if (item.profile?.username) return item.profile.username
  if (item.guest_name) return item.guest_name
  return "Anonymous"
}

export function ForumManagement() {
  const [topics, setTopics] = useState<ForumTopic[]>([])
  const [replies, setReplies] = useState<ForumReply[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending-topics")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch topics
      const { data: topicsData, error: topicsError } = await supabase
        .from('forum_topics')
        .select('*')
        .order('created_at', { ascending: false })

      if (topicsError) throw topicsError

      // Fetch replies
      const { data: repliesData, error: repliesError } = await supabase
        .from('forum_replies')
        .select('*')
        .order('created_at', { ascending: false })

      if (repliesError) throw repliesError

      // Fetch profiles for items with user_id
      const allUserIds = [...new Set([
        ...(topicsData?.filter(t => t.user_id).map(t => t.user_id) || []),
        ...(repliesData?.filter(r => r.user_id).map(r => r.user_id) || [])
      ])]

      let profiles: any[] = []
      if (allUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, username')
          .in('user_id', allUserIds)
        profiles = profilesData || []
      }

      // Map profiles to topics
      const topicsWithProfiles = topicsData?.map(topic => ({
        ...topic,
        profile: profiles?.find(p => p.user_id === topic.user_id)
      })) || []

      // Map profiles and topic titles to replies
      const repliesWithData = repliesData?.map(reply => ({
        ...reply,
        profile: profiles?.find(p => p.user_id === reply.user_id),
        topic_title: topicsData?.find(t => t.id === reply.topic_id)?.title
      })) || []

      setTopics(topicsWithProfiles)
      setReplies(repliesWithData)
    } catch (error) {
      console.error('Error fetching forum data:', error)
      toast.error("Failed to load forum data")
    } finally {
      setLoading(false)
    }
  }

  const updateTopicStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('forum_topics')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      toast.success(`Topic ${status === 'approved' ? 'approved' : 'rejected'}`)
      fetchData()
    } catch (error) {
      console.error('Error updating topic:', error)
      toast.error("Failed to update topic")
    }
  }

  const updateReplyStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('forum_replies')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      toast.success(`Reply ${status === 'approved' ? 'approved' : 'rejected'}`)
      fetchData()
    } catch (error) {
      console.error('Error updating reply:', error)
      toast.error("Failed to update reply")
    }
  }

  const togglePinTopic = async (id: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_pinned: !currentPinned })
        .eq('id', id)

      if (error) throw error

      toast.success(currentPinned ? "Topic unpinned" : "Topic pinned")
      fetchData()
    } catch (error) {
      console.error('Error toggling pin:', error)
      toast.error("Failed to update pin status")
    }
  }

  const deleteTopic = async (id: string) => {
    if (!confirm("Delete this topic and all its replies?")) return
    
    try {
      const { error } = await supabase
        .from('forum_topics')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success("Topic deleted")
      fetchData()
    } catch (error) {
      console.error('Error deleting topic:', error)
      toast.error("Failed to delete topic")
    }
  }

  const deleteReply = async (id: string) => {
    if (!confirm("Delete this reply?")) return
    
    try {
      const { error } = await supabase
        .from('forum_replies')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success("Reply deleted")
      fetchData()
    } catch (error) {
      console.error('Error deleting reply:', error)
      toast.error("Failed to delete reply")
    }
  }

  const pendingTopics = topics.filter(t => t.status === 'pending')
  const approvedTopics = topics.filter(t => t.status === 'approved')
  const pendingReplies = replies.filter(r => r.status === 'pending')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading forum data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pendingTopics.length}</div>
            <div className="text-sm text-muted-foreground">Pending Topics</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pendingReplies.length}</div>
            <div className="text-sm text-muted-foreground">Pending Replies</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{approvedTopics.length}</div>
            <div className="text-sm text-muted-foreground">Active Topics</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending-topics" className="gap-2">
            Pending Topics
            {pendingTopics.length > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingTopics.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending-replies" className="gap-2">
            Pending Replies
            {pendingReplies.length > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingReplies.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all-topics">All Topics</TabsTrigger>
        </TabsList>

        <TabsContent value="pending-topics" className="space-y-4 mt-4">
          {pendingTopics.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending topics to review
              </CardContent>
            </Card>
          ) : (
            pendingTopics.map(topic => (
              <Card key={topic.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{topic.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        by {getDisplayName(topic)} • {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {getStatusBadge(topic.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm whitespace-pre-wrap">{topic.content}</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => updateTopicStatus(topic.id, 'approved')}
                      className="gap-1"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => updateTopicStatus(topic.id, 'rejected')}
                      className="gap-1"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pending-replies" className="space-y-4 mt-4">
          {pendingReplies.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending replies to review
              </CardContent>
            </Card>
          ) : (
            pendingReplies.map(reply => (
              <Card key={reply.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Reply to: <span className="font-medium text-foreground">{reply.topic_title}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        by {getDisplayName(reply)} • {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {getStatusBadge(reply.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => updateReplyStatus(reply.id, 'approved')}
                      className="gap-1"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => updateReplyStatus(reply.id, 'rejected')}
                      className="gap-1"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteReply(reply.id)}
                      className="gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all-topics" className="space-y-4 mt-4">
          {topics.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No forum topics yet
              </CardContent>
            </Card>
          ) : (
            topics.map(topic => (
              <Card key={topic.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {topic.is_pinned && (
                          <Badge variant="secondary" className="gap-1">
                            <Pin className="h-3 w-3" />
                            Pinned
                          </Badge>
                        )}
                        {getStatusBadge(topic.status)}
                        <span className="font-medium">{topic.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {topic.content}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{getDisplayName(topic)}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {topic.views_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {topic.replies_count}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => togglePinTopic(topic.id, topic.is_pinned)}
                        title={topic.is_pinned ? "Unpin" : "Pin"}
                      >
                        {topic.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteTopic(topic.id)}
                        className="text-destructive hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}