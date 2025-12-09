import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Hand, Search, Edit, Trash2, MoreVertical } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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

interface PrayerWallProps {
  onEdit?: (prayer: PrayerRequest) => void
}

export function PrayerWall({ onEdit }: PrayerWallProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [prayers, setPrayers] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [prayerToDelete, setPrayerToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchPrayers()
    setupRealtimeSubscription()
  }, [selectedCategory, searchQuery])

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('prayer-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prayer_requests'
        },
        () => {
          fetchPrayers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const fetchPrayers = async () => {
    try {
      // Only select non-sensitive columns - exclude contact_name, contact_email, contact_phone
      let query = supabase
        .from('prayer_requests')
        .select('id, title, description, category, is_anonymous, is_public, request_pastoral_counselling, status, created_at, updated_at, user_id')
        .order('created_at', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory as PrayerCategory)
      }

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      const { data: prayerData, error: prayerError } = await query

      if (prayerError) throw prayerError

      // Fetch user profiles separately
      const userIds = prayerData?.map(p => p.user_id) || []

      // Get profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', userIds)

      // Combine the data
      const prayersWithData = prayerData?.map(prayer => ({
        ...prayer,
        profiles: profiles?.find(p => p.user_id === prayer.user_id) || null
      })) || []

      setPrayers(prayersWithData as unknown as PrayerRequest[])
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

  const handleDeletePrayer = async () => {
    // Disabled in public mode
    toast({
      title: 'Not available',
      description: 'Authentication required for this action.',
      variant: 'destructive',
    })
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
      {/* Search and Filter Section */}
      <div className="space-y-4">
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
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search prayer requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
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
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-lg">{prayer.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        By {prayer.is_anonymous ? 'Anonymous' : prayer.profiles?.username || 'Unknown'}
                      </span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(prayer.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={categoryColors[prayer.category as keyof typeof categoryColors]}>
                      {categoryLabels[prayer.category as keyof typeof categoryLabels]}
                    </Badge>
                    {user?.id === prayer.user_id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit?.(prayer)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setPrayerToDelete(prayer.id)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">
                  {prayer.description}
                </p>
                
                {prayer.request_pastoral_counselling && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      📞 This person has requested pastoral counselling
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prayer Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this prayer request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPrayerToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePrayer}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}