import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Send, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  sender_id: string
  is_from_staff: boolean
  status: string
  created_at: string
  profiles?: {
    username: string
  }
}

interface Conversation {
  id: string
  title: string
  status: string
  priority: number
  category: string
  created_at: string
  user_id: string
  staff_id?: string
  profiles?: {
    username: string
  }
  staff_profile?: {
    username: string
  }
}

interface ConversationViewProps {
  conversationId: string
  onBack: () => void
}

export function ConversationView({ conversationId, onBack }: ConversationViewProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchConversation()
    fetchMessages()
    markMessagesAsRead()
    setupRealtimeSubscription()
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          fetchMessages()
          markMessagesAsRead()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          profiles:user_id (username),
          staff_profile:staff_id (username)
        `)
        .eq('id', conversationId)
        .single()

      if (error) throw error
      setConversation(data as unknown as Conversation)
    } catch (error) {
      console.error('Error fetching conversation:', error)
      toast({
        title: 'Error',
        description: 'Failed to load conversation.',
        variant: 'destructive',
      })
    }
  }

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:sender_id (username)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data as unknown as Message[])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const markMessagesAsRead = async () => {
    if (!user) return

    try {
      await supabase
        .from('message_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('conversation_id', conversationId)
        .eq('is_read', false)
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return

    setSending(true)
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage.trim(),
          is_from_staff: false,
        })

      if (error) throw error

      setNewMessage('')
      toast({
        title: 'Message sent',
        description: 'Your message has been delivered.',
      })
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending_moderation': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'escalated': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return null
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

  if (!conversation && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Conversation not found</h3>
          <Button onClick={onBack}>Back to Messages</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-4 mb-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold">{conversation?.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {conversation && getStatusIcon(conversation.status)}
                <span>Category: {conversation?.category}</span>
                {conversation?.staff_profile && (
                  <>
                    <span>•</span>
                    <span>Assigned to: {conversation.staff_profile.username}</span>
                  </>
                )}
              </div>
            </div>
            {conversation && (
              <Badge className={getPriorityColor(conversation.priority)}>
                {getPriorityLabel(conversation.priority)}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[70%] rounded-lg p-3',
                    message.sender_id === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <div className="space-y-1">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className={cn(
                      'text-xs flex items-center justify-between',
                      message.sender_id === user?.id
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    )}>
                      <span>
                        {message.is_from_staff ? 'Staff' : message.profiles?.username || 'You'}
                      </span>
                      <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t bg-card p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="min-h-[60px] resize-none"
              disabled={conversation?.status === 'closed'}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim() || sending || conversation?.status === 'closed'}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {conversation?.status === 'closed' && (
            <p className="text-sm text-muted-foreground mt-2">
              This conversation has been closed. Contact support to reopen if needed.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}