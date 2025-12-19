import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, User, Loader2, RotateCcw, ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { LightGuideIcon } from "./LightGuideIcon"

const MAX_PREVIEW_LENGTH = 300
const IDLE_TIMEOUT_MS = 30000 // 30 seconds
const RESPONSE_TIMEOUT_MS = 15000 // 15 seconds to respond to continue prompt

// Core profanity list - only words that should be blocked as standalone
const PROFANITY_EXACT = [
  // Severe profanity (exact match only)
  'fuck', 'fucker', 'fucking', 'fucked', 'fucks',
  'shit', 'shits', 'shitting', 'shitty',
  'bitch', 'bitches', 'bitching',
  'cunt', 'cunts',
  'cock', 'cocks',
  'dick', 'dicks',
  'pussy', 'pussies',
  'asshole', 'assholes', 'arsehole',
  'bastard', 'bastards',
  'whore', 'whores',
  'slut', 'sluts',
  // Compound profanity
  'motherfucker', 'motherfucking', 'motherfuckers',
  'bullshit', 'horseshit',
  'jackass', 'dumbass', 'smartass', 'badass',
  // Slurs (always block)
  'nigger', 'niggers', 'nigga', 'niggas',
  'faggot', 'faggots',
  'retard', 'retards', 'retarded',
  'spic', 'spics',
  'chink', 'chinks',
  'kike', 'kikes',
  // Other explicit
  'wanker', 'wankers', 'twat', 'twats',
  'douche', 'douchebag', 'douchebags',
  'bollocks',
]

// Abbreviated/leetspeak variations (exact match)
const PROFANITY_ABBREVIATIONS = [
  'wtf', 'stfu', 'gtfo', 'lmfao', 'ffs',
  'fck', 'fuk', 'phuck', 'phuk',
  'sht', 'sh1t',
  'b1tch', 'biatch',
  'd1ck', 'c0ck',
  'n1gger', 'n1gga',
]

// Phrases that should be blocked
const PROFANITY_PHRASES = [
  'screw you',
  'fuck you',
  'fuck off',
  'piss off',
  'go to hell',
]

const containsProfanity = (text: string): boolean => {
  const lowerText = text.toLowerCase().trim()
  
  // Check exact phrases first
  for (const phrase of PROFANITY_PHRASES) {
    if (lowerText.includes(phrase)) return true
  }
  
  // Normalize leetspeak for checking
  const leetMap: Record<string, string> = {
    '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's'
  }
  const normalizedText = lowerText.split('').map(char => leetMap[char] || char).join('')
  
  // Check for exact word matches (with word boundaries)
  const allExactWords = [...PROFANITY_EXACT, ...PROFANITY_ABBREVIATIONS]
  
  for (const word of allExactWords) {
    // Create regex with word boundaries
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    if (regex.test(lowerText) || regex.test(normalizedText)) {
      return true
    }
  }
  
  // Check for obfuscated versions (f.u.c.k, f-u-c-k, f_u_c_k) - only for longer words
  const longProfanity = PROFANITY_EXACT.filter(w => w.length >= 4)
  const textWithoutSeparators = lowerText.replace(/[\s\-_.]/g, '')
  const normalizedWithoutSeparators = normalizedText.replace(/[\s\-_.]/g, '')
  
  for (const word of longProfanity) {
    // Check if letters appear consecutively after removing separators
    // but only if the original had separators between letters
    const obfuscatedPattern = word.split('').join('[\\s\\-_.*]*')
    const obfuscatedRegex = new RegExp(`\\b${obfuscatedPattern}\\b`, 'i')
    
    if (obfuscatedRegex.test(lowerText) || obfuscatedRegex.test(normalizedText)) {
      return true
    }
  }
  
  return false
}

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Light Guide, your spiritual companion. I'm here to help you with questions about faith, the Bible, and Light Embassy Church. How can I assist you today?",
      role: 'assistant',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set())
  const [isChatClosed, setIsChatClosed] = useState(false)
  const [isWaitingForContinueResponse, setIsWaitingForContinueResponse] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const continueResponseTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const toggleExpanded = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const closeChat = useCallback(() => {
    // Clear all timers
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    if (continueResponseTimerRef.current) clearTimeout(continueResponseTimerRef.current)
    
    const closingMessage: Message = {
      id: Date.now().toString(),
      content: 'Thank you for chatting with us! Feel free to start a new conversation anytime by clicking "Start New Chat" below. God bless you! 🙏',
      role: 'assistant',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, closingMessage])
    setIsChatClosed(true)
    setIsWaitingForContinueResponse(false)
  }, [])

  const askToContinue = useCallback(() => {
    if (isChatClosed || isWaitingForContinueResponse) return
    
    const continueMessage: Message = {
      id: Date.now().toString(),
      content: 'Are you still there? Would you like to continue our conversation? Please respond within 15 seconds or the chat will close.',
      role: 'assistant',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, continueMessage])
    setIsWaitingForContinueResponse(true)
    
    // Start timer for response
    continueResponseTimerRef.current = setTimeout(() => {
      closeChat()
    }, RESPONSE_TIMEOUT_MS)
  }, [isChatClosed, isWaitingForContinueResponse, closeChat])

  const resetIdleTimer = useCallback(() => {
    if (isChatClosed) return
    
    // Clear existing timers
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    if (continueResponseTimerRef.current) clearTimeout(continueResponseTimerRef.current)
    
    // If we were waiting for continue response and user responded, cancel that
    if (isWaitingForContinueResponse) {
      setIsWaitingForContinueResponse(false)
    }
    
    // Start new idle timer
    idleTimerRef.current = setTimeout(() => {
      askToContinue()
    }, IDLE_TIMEOUT_MS)
  }, [isChatClosed, isWaitingForContinueResponse, askToContinue])

  // Reset idle timer on user activity
  useEffect(() => {
    if (messages.length > 1 && !isChatClosed) {
      resetIdleTimer()
    }
    
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (continueResponseTimerRef.current) clearTimeout(continueResponseTimerRef.current)
    }
  }, [messages, isChatClosed, resetIdleTimer])

  // Reset timer when user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    if (!isChatClosed) {
      resetIdleTimer()
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || isChatClosed) return

    // Check for profanity
    if (containsProfanity(input)) {
      toast({
        title: "Message blocked",
        description: "Please keep the conversation respectful. Inappropriate language is not allowed.",
        variant: "destructive",
      })
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    }

    // Build conversation history excluding the initial greeting (id='1')
    // and include all actual conversation messages
    const conversationHistory = messages
      .filter(m => m.id !== '1') // Exclude static greeting
      .map(m => ({
        role: m.role,
        content: m.content
      }))

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    resetIdleTimer()

    try {
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          message: input,
          conversation: conversationHistory
        }
      })

      if (error) throw error

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      toast({
        title: "Error",
        description: "Failed to get response from assistant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startNewChat = () => {
    // Clear all timers
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    if (continueResponseTimerRef.current) clearTimeout(continueResponseTimerRef.current)
    
    setMessages([
      {
        id: '1',
        content: "Hello! I'm Light Guide, your spiritual companion. I'm here to help you with questions about faith, the Bible, and Light Embassy Church. How can I assist you today?",
        role: 'assistant',
        timestamp: new Date()
      }
    ])
    setIsChatClosed(false)
    setIsWaitingForContinueResponse(false)
  }

  const clearConversation = () => {
    startNewChat()
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
              <LightGuideIcon className="text-white" size="sm" />
            </div>
            Light Guide
          </CardTitle>
          {messages.length > 1 && !isChatClosed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1 p-4 gap-4">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => {
              const isLong = message.content.length > MAX_PREVIEW_LENGTH
              const isExpanded = expandedMessages.has(message.id)
              const displayContent = isLong && !isExpanded 
                ? message.content.slice(0, MAX_PREVIEW_LENGTH) + '...'
                : message.content

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 mt-1 flex-shrink-0 bg-gradient-to-br from-amber-400 to-orange-500">
                      <AvatarFallback className="bg-transparent">
                        <LightGuideIcon className="text-white" size="sm" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{displayContent}</p>
                    {isLong && (
                      <button
                        onClick={() => toggleExpanded(message.id)}
                        className={`text-xs flex items-center gap-1 mt-1 ${
                          message.role === 'user' 
                            ? 'text-primary-foreground/80 hover:text-primary-foreground' 
                            : 'text-primary hover:text-primary/80'
                        }`}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" />
                            Read more
                          </>
                        )}
                      </button>
                    )}
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                      <AvatarFallback className="bg-muted">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              )
            })}
            
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 mt-1 bg-gradient-to-br from-amber-400 to-orange-500">
                  <AvatarFallback className="bg-transparent">
                    <LightGuideIcon className="text-white" size="sm" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {isChatClosed ? (
          <Button onClick={startNewChat} className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Start New Chat
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Ask me about faith, the Bible, or Light Embassy Church..."
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
