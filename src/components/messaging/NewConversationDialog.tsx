import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const formSchema = z.object({
  title: z.string().min(1, 'Subject is required').max(100, 'Subject must be less than 100 characters'),
  category: z.string().min(1, 'Category is required'),
  message: z.string().min(1, 'Message is required'),
  priority: z.number().min(1).max(4).default(1),
})

type FormData = z.infer<typeof formSchema>

interface NewConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const categories = [
  { value: 'general', label: 'General Support' },
  { value: 'counselling', label: 'Counselling' },
  { value: 'prayer', label: 'Prayer Request' },
  { value: 'spiritual', label: 'Spiritual Guidance' },
  { value: 'pastoral', label: 'Pastoral Care' },
  { value: 'technical', label: 'Technical Support' },
]

const priorities = [
  { value: 1, label: 'Low' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'High' },
  { value: 4, label: 'Urgent' },
]

export function NewConversationDialog({ open, onOpenChange, onSuccess }: NewConversationDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      category: '',
      message: '',
      priority: 1,
    },
  })

  const onSubmit = async (data: FormData) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      // Create conversation
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          subject: data.title,
          status: 'open'
        } as any)
        .select()
        .single()

      if (conversationError) throw conversationError

      // Create initial message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: data.message,
        })

      if (messageError) throw messageError

      // Close immediately on success
      onOpenChange(false)
      form.reset()

      toast({
        title: 'Message sent',
        description: "Thanks for reaching out — we'll respond soon.",
      })

      onSuccess?.()
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast({
        title: 'Error',
        description: 'Failed to create conversation. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (isSubmitting) return // Prevent closing while submitting
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl relative">
        {/* Loading overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Sending message...</p>
            </div>
          </div>
        )}
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
          <DialogDescription>
            Send a message to connect with our counsellors and support staff
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of your request" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value.toString()}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your request or question in detail..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
