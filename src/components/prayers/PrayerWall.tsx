import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Hand } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

type PrayerCategory = 'healing' | 'finance' | 'family' | 'guidance' | 'thanksgiving' | 'salvation' | 'protection' | 'other'

interface PrayerRequest {
  id: string
  title: string
  description: string
  category: PrayerCategory
  is_anonymous: boolean
  request_pastoral_counselling: boolean
  created_at: string
  user_id: string
  profiles?: {
    username: string
  } | null
  prayer_interactions: {
    id: string
    user_id: string
  }[]
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

const categoryColors = {
  healing: 'bg-green-100 text-green-800',
  finance: 'bg-blue-100 text-blue-800',
  family: 'bg-purple-100 text-purple-800',
  guidance: 'bg-yellow-100 text-yellow-800',
  thanksgiving: 'bg-orange-100 text-orange-800',
  salvation: 'bg-red-100 text-red-800',
  protection: 'bg-gray-100 text-gray-800',
  other: 'bg-slate-100 text-slate-800'
}

export function PrayerWall() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [prayers, setPrayers] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchPrayers()
  }, [selectedCategory])

  const fetchPrayers = async () => {
    try {
      let query = supabase
        .from('prayer_requests')
        .select(`
          *,
          profiles:user_id (username),
          prayer_interactions (id, user_id)
        `)
        .order('created_at', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory as PrayerCategory)
      }

      const { data, error } = await query

      if (error) throw error

      setPrayers(data as unknown as PrayerRequest[] || [])
    } catch (error) {
      console.error('Error fetching prayers:', error)
      toast({
        title: 'Error',
        description: 'Failed to load prayer requests.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePrayedFor = async (prayerId: string) => {
    if (!user) return

    try {
      // Check if user already prayed for this request
      const existingInteraction = prayers
        .find(p => p.id === prayerId)
        ?.prayer_interactions?.find(i => i.user_id === user.id)

      if (existingInteraction) {
        // Remove the prayer interaction
        const { error } = await supabase
          .from('prayer_interactions')
          .delete()
          .eq('id', existingInteraction.id)

        if (error) throw error

        toast({
          title: 'Prayer removed',
          description: 'Your prayer has been removed.',
        })
      } else {
        // Add new prayer interaction
        const { error } = await supabase
          .from('prayer_interactions')
          .insert({
            prayer_request_id: prayerId,
            user_id: user.id,
            interaction_type: 'prayed_for'
          })

        if (error) throw error

        toast({
          title: 'Prayer recorded',
          description: 'Thank you for praying!',
        })
      }

      // Refresh the prayers list
      fetchPrayers()
    } catch (error) {
      console.error('Error updating prayer interaction:', error)
      toast({
        title: 'Error',
        description: 'Failed to update prayer status.',
        variant: 'destructive',
      })
    }
  }

  const getUserHasPrayed = (prayer: PrayerRequest) => {
    return prayer.prayer_interactions?.some(i => i.user_id === user?.id) || false
  }

  const getPrayerCount = (prayer: PrayerRequest) => {
    return prayer.prayer_interactions?.length || 0
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Community Prayer Wall</h2>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {prayers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No prayer requests found. Be the first to share a prayer request!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {prayers.map((prayer) => (
            <Card key={prayer.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{prayer.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        By {prayer.is_anonymous ? 'Anonymous' : prayer.profiles?.username || 'Unknown'}
                      </span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(prayer.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <Badge className={categoryColors[prayer.category as keyof typeof categoryColors]}>
                    {categoryLabels[prayer.category as keyof typeof categoryLabels]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">
                  {prayer.description}
                </p>
                
                {prayer.request_pastoral_counselling && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      📞 This person has requested pastoral counselling
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hand className="h-4 w-4" />
                    <span>{getPrayerCount(prayer)} people have prayed</span>
                  </div>
                  
                  <Button
                    variant={getUserHasPrayed(prayer) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePrayedFor(prayer.id)}
                    className="flex items-center gap-2"
                  >
                    <Hand className="h-4 w-4" />
                    {getUserHasPrayed(prayer) ? "Prayed ✓" : "I've prayed for this"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}