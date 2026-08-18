import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { MessageSquare, Plus, Eye, Clock, Pin, Search, ArrowLeft, Send, ShieldCheck, Star, TrendingUp } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { SignInRequired } from "@/components/auth/SignInRequired"
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
    avatar_url: string | null
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
  profile?: {
    username: string
    avatar_url: string | null
  }
}

// Simple math captcha questions
const generateCaptcha = () => {
  const num1 = Math.floor(Math.random() * 10) + 1
  const num2 = Math.floor(Math.random() * 10) + 1
  return { question: `What is ${num1} + ${num2}?`, answer: num1 + num2 }
}

interface ForumSectionProps {
  selectedTopic?: string
  prefillTitle?: string
  onPrefillUsed?: () => void
}

export function ForumSection({ selectedTopic: topicFilter = "all", prefillTitle, onPrefillUsed }: ForumSectionProps) {
  const { user } = useAuth()
  const [topics, setTopics] = useState<ForumTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [guestName, setGuestName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null)
  const [replies, setReplies] = useState<ForumReply[]>([])
  const [newReply, setNewReply] = useState("")
  const [replyGuestName, setReplyGuestName] = useState("")
  const [repliesLoading, setRepliesLoading] = useState(false)
  
  // Spam protection state
  const [captcha, setCaptcha] = useState(generateCaptcha())
  const [captchaAnswer, setCaptchaAnswer] = useState("")
  const [replyCaptcha, setReplyCaptcha] = useState(generateCaptcha())
  const [replyCaptchaAnswer, setReplyCaptchaAnswer] = useState("")
  const [honeypot, setHoneypot] = useState("")
  const [humanVerified, setHumanVerified] = useState(false)
  const [replyHumanVerified, setReplyHumanVerified] = useState(false)
  const formOpenTime = useRef<number>(0)

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

  // Handle prefill title from parent
  useEffect(() => {
    if (prefillTitle) {
      setNewTitle(prefillTitle)
      setIsDialogOpen(true)
      onPrefillUsed?.()
    }
  }, [prefillTitle, onPrefillUsed])

  // Reset captcha when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      setCaptcha(generateCaptcha())
      setCaptchaAnswer("")
      setHumanVerified(false)
      formOpenTime.current = Date.now()
    }
  }, [isDialogOpen])

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch profiles for topics with user_id
      if (data && data.length > 0) {
        const userIds = [...new Set(data.filter(t => t.user_id).map(t => t.user_id))]
        let profiles: any[] = []
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .rpc('get_public_profiles', { _user_ids: userIds as string[] })
          profiles = profilesData || []
        }

        const topicsWithProfiles = data.map(topic => ({
          ...topic,
          profile: topic.user_id ? profiles.find(p => p.user_id === topic.user_id) : undefined
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
    setReplyCaptcha(generateCaptcha())
    setReplyCaptchaAnswer("")
    setReplyHumanVerified(false)
    try {
      const { data, error } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        const userIds = [...new Set(data.filter(r => r.user_id).map(r => r.user_id))]
        let profiles: any[] = []
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .rpc('get_public_profiles', { _user_ids: userIds as string[] })
          profiles = profilesData || []
        }

        const repliesWithProfiles = data.map(reply => ({
          ...reply,
          profile: reply.user_id ? profiles.find(p => p.user_id === reply.user_id) : undefined
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

  const validateSpamProtection = (answer: string, captchaObj: typeof captcha, verified: boolean) => {
    // Check honeypot (should be empty)
    if (honeypot) {
      console.log('Honeypot triggered')
      return false
    }
    
    // Check if human verification checkbox is checked
    if (!verified) {
      toast.error("Please verify you're human")
      return false
    }
    
    // Check captcha answer
    if (parseInt(answer) !== captchaObj.answer) {
      toast.error("Incorrect answer. Please try again.")
      return false
    }
    
    // Check timing (must take at least 3 seconds)
    const timeTaken = Date.now() - formOpenTime.current
    if (timeTaken < 3000) {
      toast.error("Please take your time filling out the form")
      return false
    }
    
    return true
  }

  const handleCreateTopic = async () => {
    if (!user) {
      toast.error("Please sign in to start a discussion")
      return
    }

    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Please fill in all fields")
      return
    }


    if (!validateSpamProtection(captchaAnswer, captcha, humanVerified)) {
      return
    }

    setSubmitting(true)
    try {
      const insertData: any = {
        title: newTitle.trim(),
        content: newContent.trim()
      }

      if (user) {
        insertData.user_id = user.id
      } else {
        insertData.guest_name = guestName.trim()
      }

      const { error } = await supabase
        .from('forum_topics')
        .insert(insertData)

      if (error) throw error

      toast.success("Topic submitted! It will appear after moderation.")
      setNewTitle("")
      setNewContent("")
      setGuestName("")
      setCaptchaAnswer("")
      setHumanVerified(false)
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


    if (!validateSpamProtection(replyCaptchaAnswer, replyCaptcha, replyHumanVerified)) {
      return
    }

    setSubmitting(true)
    try {
      const insertData: any = {
        topic_id: selectedTopic.id,
        content: newReply.trim()
      }

      if (user) {
        insertData.user_id = user.id
      } else {
        insertData.guest_name = replyGuestName.trim()
      }

      const { error } = await supabase
        .from('forum_replies')
        .insert(insertData)

      if (error) throw error

      toast.success("Reply submitted! It will appear after moderation.")
      setNewReply("")
      setReplyGuestName("")
      setReplyCaptchaAnswer("")
      setReplyHumanVerified(false)
      setReplyCaptcha(generateCaptcha())
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
    formOpenTime.current = Date.now()
    fetchReplies(topic.id)
    
    // Increment view count
    await supabase
      .from('forum_topics')
      .update({ views_count: topic.views_count + 1 })
      .eq('id', topic.id)
  }

  const getDisplayName = (topic: ForumTopic | ForumReply) => {
    if (topic.profile?.username) return topic.profile.username
    if (topic.guest_name) return topic.guest_name
    return "Anonymous"
  }

  const getInitials = (topic: ForumTopic | ForumReply) => {
    const name = getDisplayName(topic)
    if (name === "Anonymous") return "?"
    return name.slice(0, 2).toUpperCase()
  }

  // Topic keywords for filtering
  const topicKeywords: Record<string, string[]> = {
    healing: ['healing', 'heal', 'health', 'sick', 'disease', 'miracle'],
    faith: ['faith', 'believe', 'trust', 'abraham', 'promise'],
    love: ['love', 'loving', 'compassion', 'grace'],
    purpose: ['purpose', 'busy', 'life', 'calling', 'destiny'],
    bible: ['bible', 'scripture', 'word', 'misunderstood', 'interpretation'],
    community: ['community', 'church', 'fellowship', 'together', 'serve']
  }

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (topicFilter === "all") return matchesSearch
    
    const keywords = topicKeywords[topicFilter] || []
    const matchesTopic = keywords.some(keyword => 
      topic.title.toLowerCase().includes(keyword) ||
      topic.content.toLowerCase().includes(keyword)
    )
    
    return matchesSearch && matchesTopic
  })

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
                  {selectedTopic.profile?.avatar_url && (<AvatarImage src={selectedTopic.profile.avatar_url} alt={`${selectedTopic.profile?.username || "Member"} profile photo`} />)}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(selectedTopic)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{selectedTopic.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    by {getDisplayName(selectedTopic)} • {formatDistanceToNow(new Date(selectedTopic.created_at), { addSuffix: true })}
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
                        {reply.profile?.avatar_url && (<AvatarImage src={reply.profile.avatar_url} alt={`${reply.profile?.username || "Member"} profile photo`} />)}
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(reply)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {getDisplayName(reply)}
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

              <div className="mt-6 space-y-4">
                <h4 className="font-medium text-sm">Add a Reply</h4>

                {!user ? (
                  <SignInRequired
                    compact
                    description="Sign in to reply to this discussion."
                  />
                ) : (
                <>

                
                <Textarea
                  placeholder="Write your reply..."
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  className="min-h-[80px]"
                />

                {/* Honeypot field - hidden from users */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ position: 'absolute', left: '-9999px' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Human verification</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="reply-human" 
                      checked={replyHumanVerified}
                      onCheckedChange={(checked) => setReplyHumanVerified(checked === true)}
                    />
                    <Label htmlFor="reply-human" className="text-sm">I am not a robot</Label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Label className="text-sm whitespace-nowrap">{replyCaptcha.question}</Label>
                    <Input
                      type="number"
                      placeholder="Answer"
                      value={replyCaptchaAnswer}
                      onChange={(e) => setReplyCaptchaAnswer(e.target.value)}
                      className="w-24"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSubmitReply} 
                  disabled={submitting || !newReply.trim()}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Submit Reply
                </Button>
                </>
                )}
              </div>
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
                <div>
                  <Label htmlFor="guest-name">Your Name</Label>
                  <Input
                    id="guest-name"
                    placeholder="Enter your name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="topic-title">Topic Title</Label>
                <Input
                  id="topic-title"
                  placeholder="What do you want to discuss?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="topic-content">Your Message</Label>
                <Textarea
                  id="topic-content"
                  placeholder="Share your thoughts, questions, or insights..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              {/* Honeypot field - hidden from users */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ position: 'absolute', left: '-9999px' }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Human verification</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="topic-human" 
                    checked={humanVerified}
                    onCheckedChange={(checked) => setHumanVerified(checked === true)}
                  />
                  <Label htmlFor="topic-human" className="text-sm">I am not a robot</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Label className="text-sm whitespace-nowrap">{captcha.question}</Label>
                  <Input
                    type="number"
                    placeholder="Answer"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className="w-24"
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Your topic will be reviewed by moderators before being published.
              </p>
              
              <Button 
                onClick={handleCreateTopic} 
                disabled={submitting || !newTitle.trim() || !newContent.trim() || (!user && !guestName.trim())}
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
        <>
          {/* Featured Discussions Section */}
          {topicFilter === "all" && (
            (() => {
              const pinnedTopics = filteredTopics.filter(t => t.is_pinned)
              const popularTopics = filteredTopics
                .filter(t => !t.is_pinned && t.views_count >= 5)
                .sort((a, b) => b.views_count - a.views_count)
                .slice(0, 3)
              
              const featuredTopics = [...pinnedTopics, ...popularTopics]
              
              if (featuredTopics.length === 0) return null
              
              return (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-4 w-4 text-amber-500" />
                    <h3 className="font-semibold text-sm text-foreground">Featured Discussions</h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {featuredTopics.slice(0, 4).map((topic) => (
                      <Card 
                        key={topic.id}
                        className="hover:border-primary/50 transition-colors cursor-pointer bg-gradient-to-br from-primary/5 to-transparent border-primary/20"
                        onClick={() => openTopic(topic)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-2 mb-2">
                            {topic.is_pinned ? (
                              <Badge variant="secondary" className="gap-1 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                <Pin className="h-3 w-3" />
                                Pinned
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                <TrendingUp className="h-3 w-3" />
                                Popular
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium text-sm text-foreground line-clamp-2 mb-2">
                            {topic.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {topic.replies_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {topic.views_count}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })()
          )}

          {/* All Discussions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm text-foreground">
                {topicFilter === "all" ? "All Discussions" : "Discussions"}
              </h3>
              <span className="text-xs text-muted-foreground">({filteredTopics.length})</span>
            </div>
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
                        {topic.profile?.avatar_url && (<AvatarImage src={topic.profile.avatar_url} alt={`${topic.profile?.username || "Member"} profile photo`} />)}
                  <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(topic)}
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
                          <span>{getDisplayName(topic)}</span>
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
          </div>
        </>
      )}
    </div>
  )
}