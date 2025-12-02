import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PrayerRequestForm } from '@/components/prayers/PrayerRequestForm'
import { PrayerEditForm } from '@/components/prayers/PrayerEditForm'
import { PrayerWall } from '@/components/prayers/PrayerWall'
import { Button } from '@/components/ui/button'
import { Plus, ArrowLeft, Shield } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

interface PrayerRequest {
  id: string
  title: string
  description: string
  category: string
  is_anonymous: boolean
  request_pastoral_counselling: boolean
  created_at: string
  user_id: string
}

interface PrayersProps {
  onBack?: () => void
}

export default function Prayers({ onBack }: PrayersProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingPrayer, setEditingPrayer] = useState<PrayerRequest | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false)
        return
      }
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'moderator', 'staff'])
        .maybeSingle()
      setIsAdmin(!!data)
    }
    checkAdminRole()
  }, [user])

  const handleAdminClick = () => {
    if (user && isAdmin) {
      navigate('/admin')
    } else {
      navigate('/auth')
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
  }

  const handleEditSuccess = () => {
    setIsEditOpen(false)
    setEditingPrayer(null)
  }

  const handleEditCancel = () => {
    setIsEditOpen(false)
    setEditingPrayer(null)
  }

  const handleEditPrayer = (prayer: PrayerRequest) => {
    setEditingPrayer(prayer)
    setIsEditOpen(true)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {onBack && (
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        )}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Prayer Requests</h1>
            <p className="text-muted-foreground">
              Share your prayer requests and lift up others in our community
            </p>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Submit Prayer Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit a Prayer Request</DialogTitle>
                <DialogDescription>
                  Share your prayer request with our community. It will be reviewed before being posted.
                </DialogDescription>
              </DialogHeader>
              <PrayerRequestForm onSuccess={handleFormSuccess} />
            </DialogContent>
          </Dialog>
        </div>

        <PrayerWall onEdit={handleEditPrayer} />

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Prayer Request</DialogTitle>
            </DialogHeader>
            {editingPrayer && (
              <PrayerEditForm
                prayerId={editingPrayer.id}
                onSuccess={handleEditSuccess}
                onCancel={handleEditCancel}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin Login Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleAdminClick}
        className="fixed bottom-24 right-4 z-40 gap-1.5 text-xs text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 transition-opacity"
      >
        <Shield className="h-3 w-3" />
        {user && isAdmin ? 'Admin' : 'Admin Login'}
      </Button>
    </div>
  )
}