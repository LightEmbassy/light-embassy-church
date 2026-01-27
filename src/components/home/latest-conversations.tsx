import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Clock, ArrowRight } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { formatDistanceToNow } from "date-fns"

interface Conversation {
  id: string
  subject: string
  created_at: string
  status: string
}

interface LatestConversationsProps {
  onNavigate?: (tab: string) => void
}

export function LatestConversations({ onNavigate }: LatestConversationsProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()

    // Subscribe to realtime updates
    const channel = supabase
      .channel('conversations-updates')
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
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, subject, created_at, status')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setConversations(data || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
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
      <div className="flex items-center justify-between">
        <h2 className="font-playfair text-2xl font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Latest Conversations
        </h2>
        {onNavigate && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate('messages')}
            className="text-primary hover:text-primary/80"
          >
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-gentle bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                No conversations yet. Start a conversation with our team!
              </p>
              {onNavigate && (
                <Button onClick={() => onNavigate('messages')}>
                  Start a Conversation
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onNavigate?.('messages')}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {conversation.subject}
                    </h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(conversation.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
