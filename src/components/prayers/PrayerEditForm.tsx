import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['healing', 'finance', 'family', 'guidance', 'thanksgiving', 'salvation', 'protection', 'other']),
  is_anonymous: z.boolean().default(false),
  request_pastoral_counselling: z.boolean().default(false),
})

type FormData = z.infer<typeof formSchema>

interface PrayerEditFormProps {
  prayerId: string
  onSuccess?: () => void
  onCancel?: () => void
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

export function PrayerEditForm({ prayerId, onSuccess, onCancel }: PrayerEditFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      is_anonymous: false,
      request_pastoral_counselling: false,
    },
  })

  useEffect(() => {
    fetchPrayerRequest()
  }, [prayerId])

  const fetchPrayerRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .eq('id', prayerId)
        .eq('user_id', user?.id)
        .single()

      if (error) throw error

      form.reset({
        title: data.title,
        description: data.description,
        category: data.category as any,
        is_anonymous: data.is_anonymous,
        request_pastoral_counselling: data.request_pastoral_counselling,
      })
    } catch (error) {
      console.error('Error fetching prayer request:', error)
      toast({
        title: 'Error',
        description: 'Failed to load prayer request.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('prayer_requests')
        .update({
          title: data.title,
          description: data.description,
          category: data.category,
          is_anonymous: data.is_anonymous,
          request_pastoral_counselling: data.request_pastoral_counselling,
        })
        .eq('id', prayerId)
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: 'Prayer Request Updated',
        description: 'Your prayer request has been updated successfully.',
      })

      onSuccess?.()
    } catch (error) {
      console.error('Error updating prayer request:', error)
      toast({
        title: 'Error',
        description: 'Failed to update prayer request. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Prayer Request</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prayer Request Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief title for your prayer request" {...field} />
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
                      className="min-h-[120px]"
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                    <FormLabel>Submit anonymously</FormLabel>
                  </div>
                </FormItem>
              )}
            />

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
                    <FormLabel>Request pastoral counselling</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Updating...' : 'Update Prayer Request'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}