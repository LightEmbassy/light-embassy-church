import { useState } from 'react'
import { PrayerRequestForm } from '@/components/prayers/PrayerRequestForm'
import { PrayerWall } from '@/components/prayers/PrayerWall'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function Prayers() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleFormSuccess = () => {
    setIsFormOpen(false)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
              </DialogHeader>
              <PrayerRequestForm onSuccess={handleFormSuccess} />
            </DialogContent>
          </Dialog>
        </div>

        <PrayerWall />
      </div>
    </div>
  )
}