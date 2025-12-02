import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Send, User, Mail, Phone } from 'lucide-react'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  category: z.enum(['healing', 'finance', 'family', 'guidance', 'thanksgiving', 'salvation', 'protection', 'other']),
  is_anonymous: z.boolean().default(true),
  request_pastoral_counselling: z.boolean().default(false),
  wants_contact: z.boolean().default(false),
  contact_name: z.string().max(100, 'Name must be less than 100 characters').optional(),
  contact_email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  contact_phone: z.string().max(20, 'Phone must be less than 20 characters').optional(),
})

type FormData = z.infer<typeof formSchema>

interface PrayerRequestFormProps {
  onSuccess?: () => void
}

const categoryLabels = {
  healing: 'Healing',
  finance: 'Financial',
  family: 'Family',
  guidance: 'Guidance',
  thanksgiving: 'Thanksgiving',
  salvation: 'Salvation',
  protection: 'Protection',
  other: 'Other'
}

export function PrayerRequestForm({ onSuccess }: PrayerRequestFormProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      is_anonymous: true,
      request_pastoral_counselling: false,
      wants_contact: false,
      contact_name: '',
      contact_email: '',
      contact_phone: '',
    },
  })

  const wantsContact = form.watch('wants_contact')

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const userId = user?.id || '00000000-0000-0000-0000-000000000000'
      
      const { error } = await supabase
        .from('prayer_requests')
        .insert({
          user_id: userId,
          title: data.title,
          description: data.description,
          category: data.category,
          is_anonymous: data.is_anonymous,
          request_pastoral_counselling: data.request_pastoral_counselling,
          is_public: true,
          status: 'pending',
          wants_contact: data.wants_contact,
          contact_name: data.wants_contact ? data.contact_name || null : null,
          contact_email: data.wants_contact ? data.contact_email || null : null,
          contact_phone: data.wants_contact ? data.contact_phone || null : null,
        })

      if (error) throw error

      setIsSubmitted(true)
      form.reset()
    } catch (error) {
      console.error('Error submitting prayer request:', error)
      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitAnother = () => {
    setIsSubmitted(false)
    form.reset()
  }

  if (isSubmitted) {
    return (
      <Card className="border-0 shadow-none">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Prayer Request Received
              </h3>
              <p className="text-muted-foreground">
                Thank you for sharing your prayer request. Our team will review it shortly, and it will be shared with the community once approved.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p>
                💬 If you requested to be contacted, a member of our team will reach out to you soon.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={handleSubmitAnother}
                variant="outline"
                className="flex-1"
              >
                Submit Another Request
              </Button>
              <Button 
                onClick={onSuccess}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prayer Request Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Brief title for your prayer request" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your prayer request in detail..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Privacy & Contact Options */}
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-medium text-foreground">Privacy & Contact Options</p>
              
              <FormField
                control={form.control}
                name="is_anonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-normal">Post anonymously</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Your name won't be shown publicly
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wants_contact"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-normal">I'd like someone to contact me</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Provide your details below so we can reach out
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {/* Contact Details (shown when wants_contact is checked) */}
              {wantsContact && (
                <div className="ml-6 space-y-3 p-4 bg-muted/30 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">
                    Please provide at least one way to contact you:
                  </p>
                  
                  <FormField
                    control={form.control}
                    name="contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Your Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="Your name" 
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="email"
                              placeholder="your@email.com" 
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="tel"
                              placeholder="+1 234 567 8900" 
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="request_pastoral_counselling"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-normal">Request pastoral counselling</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        A pastor will reach out to pray with you personally
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Prayer Request'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Your prayer request will be reviewed by our team before being shared with the community.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
