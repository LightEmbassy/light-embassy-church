import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageSquare, Plus, Search, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ConversationView } from './ConversationView'
import { NewConversationDialog } from './NewConversationDialog'

interface Conversation {
  id: string
  title: string
  status: string
  priority: number
  category: string
  created_at: string
  last_message_at: string
  user_id: string
  staff_id?: string
  profiles?: {
    username: string
  } | null
  staff_profile?: {
    username: string
  } | null
  unread_count?: number
}

export function MessageCenter() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [newConversationOpen, setNewConversationOpen] = useState(false)

  useEffect(() => {
    fetchConversations()
    setupRealtimeSubscription()
  }, [statusFilter])

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          fetchConversations()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const fetchConversations = async () => {
    if (!user) return

    try {
      let query = supabase
        .from('conversations')
        .select('*')
        .or(`user_id.eq.${user.id},staff_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as any)
      }

      if (searchQuery.trim()) {
        query = query.ilike('title', `%${searchQuery}%`)
      }

      const { data: conversationData, error: conversationError } = await query

      if (conversationError) throw conversationError

      // Get user profiles separately
      const userIds = conversationData?.map(c => c.user_id).filter(Boolean) || []
      const staffIds = conversationData?.map(c => c.staff_id).filter(Boolean) || []
      const allUserIds = [...new Set([...userIds, ...staffIds])]

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', allUserIds)

      // Get unread message counts for each conversation
      const conversationsWithCounts = (conversationData || []).map(conv => ({
        ...conv,
        profiles: profiles?.find(p => p.user_id === conv.user_id) || null,
        staff_profile: profiles?.find(p => p.user_id === conv.staff_id) || null,
        unread_count: 0
      }))

      setConversations(conversationsWithCounts as unknown as Conversation[])
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast({
        title: 'Error',
        description: 'Failed to load conversations.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 4: return 'bg-red-100 text-red-800'
      case 3: return 'bg-orange-100 text-orange-800'
      case 2: return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 4: return 'Urgent'
      case 3: return 'High'
      case 2: return 'Medium'
      default: return 'Low'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending_moderation': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'escalated': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <MessageSquare className="h-4 w-4 text-gray-600" />
    }
  }

  const handleNewConversation = () => {
    setNewConversationOpen(false)
    fetchConversations()
  }

  if (selectedConversation) {
    return (
      <ConversationView
        conversationId={selectedConversation}
        onBack={() => setSelectedConversation(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Messages</h1>
            <p className="text-muted-foreground">
              Connect with our counsellors and support staff
            </p>
          </div>
          
          <Button onClick={() => setNewConversationOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Message
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conversations</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending_moderation">Pending Review</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Conversations List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
              <p className="text-muted-foreground mb-4">
                Start a conversation with our support team
              </p>
              <Button onClick={() => setNewConversationOpen(true)}>
                Start New Conversation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Card 
                key={conversation.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(conversation.status)}
                        <h3 className="font-medium">{conversation.title}</h3>
                        {conversation.unread_count > 0 && (
                          <Badge variant="destructive" className="rounded-full px-2 py-1 text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>Category: {conversation.category}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}</span>
                      </div>

                      {conversation.staff_profile && (
                        <p className="text-sm text-muted-foreground">
                          Assigned to: {conversation.staff_profile.username}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getPriorityColor(conversation.priority)}>
                        {getPriorityLabel(conversation.priority)}
                      </Badge>
                      <Badge variant="outline">
                        {conversation.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <NewConversationDialog
          open={newConversationOpen}
          onOpenChange={setNewConversationOpen}
          onSuccess={handleNewConversation}
        />
      </div>
    </div>
  )
}