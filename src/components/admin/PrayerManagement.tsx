import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { 
  Heart, 
  MessageSquare, 
  Trash2, 
  Calendar,
  User,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Mail,
  Phone
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PrayerRequest {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  is_anonymous: boolean
  is_public: boolean
  request_pastoral_counselling: boolean
  status: string
  created_at: string
  updated_at: string
  wants_contact?: boolean
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  profile?: {
    username: string
  }
}

export function PrayerManagement() {
  const { toast } = useToast()
  const [prayers, setPrayers] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerRequest | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPrayers()
  }, [])

  const fetchPrayers = async () => {
    try {
      const { data: prayersData, error: prayersError } = await supabase
        .from("prayer_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (prayersError) throw prayersError

      if (!prayersData || prayersData.length === 0) {
        setPrayers([])
        return
      }

      // Fetch profiles separately
      const userIds = [...new Set(prayersData.map(p => p.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', userIds)

      const prayersWithProfiles: PrayerRequest[] = prayersData.map(prayer => ({
        ...prayer,
        profile: profiles?.find(p => p.user_id === prayer.user_id)
      }))

      setPrayers(prayersWithProfiles)
    } catch (error) {
      console.error("Error fetching prayer requests:", error)
      toast({
        title: "Error",
        description: "Failed to load prayer requests.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (prayerId: string, newStatus: string) => {
    setProcessingId(prayerId)
    try {
      const { error } = await supabase
        .from("prayer_requests")
        .update({ status: newStatus })
        .eq("id", prayerId)

      if (error) throw error

      setPrayers(prev => prev.map(prayer => 
        prayer.id === prayerId ? { ...prayer, status: newStatus } : prayer
      ))
      
      toast({
        title: `Prayer ${newStatus}`,
        description: `The prayer request has been ${newStatus}.`
      })
    } catch (error) {
      console.error("Error updating prayer status:", error)
      toast({
        title: "Error",
        description: "Failed to update prayer status.",
        variant: "destructive"
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleDeletePrayer = async (prayerId: string) => {
    if (!confirm("Are you sure you want to delete this prayer request?")) {
      return
    }

    try {
      const { error } = await supabase
        .from("prayer_requests")
        .delete()
        .eq("id", prayerId)

      if (error) throw error

      setPrayers(prev => prev.filter(prayer => prayer.id !== prayerId))
      toast({
        title: "Prayer request deleted",
        description: "The prayer request has been removed."
      })
    } catch (error) {
      console.error("Error deleting prayer request:", error)
      toast({
        title: "Error",
        description: "Failed to delete prayer request.",
        variant: "destructive"
      })
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      healing: "bg-red-100 text-red-800",
      finance: "bg-green-100 text-green-800",
      family: "bg-blue-100 text-blue-800",
      guidance: "bg-purple-100 text-purple-800",
      thanksgiving: "bg-yellow-100 text-yellow-800",
      salvation: "bg-orange-100 text-orange-800",
      protection: "bg-indigo-100 text-indigo-800",
      other: "bg-gray-100 text-gray-800"
    }
    return colors[category] || colors.other
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filterByStatus = (status: string) => {
    let filtered = prayers.filter(p => p.status === status)
    if (categoryFilter !== "all") {
      if (categoryFilter === "counselling") {
        filtered = filtered.filter(p => p.request_pastoral_counselling)
      } else {
        filtered = filtered.filter(p => p.category === categoryFilter)
      }
    }
    return filtered
  }

  const pendingPrayers = filterByStatus('pending')
  const approvedPrayers = filterByStatus('approved')
  const rejectedPrayers = filterByStatus('rejected')

  if (loading) {
    return <div className="text-center py-8">Loading prayer requests...</div>
  }

  const PrayerCard = ({ prayer }: { prayer: PrayerRequest }) => (
    <Card key={prayer.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="font-semibold text-foreground truncate">
                  {prayer.title}
                </h3>
                {getStatusBadge(prayer.status)}
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                <Badge 
                  variant="secondary" 
                  className={`capitalize text-xs ${getCategoryColor(prayer.category)}`}
                >
                  {prayer.category}
                </Badge>
                {prayer.request_pastoral_counselling && (
                  <Badge variant="destructive" className="text-xs">
                    Needs Counselling
                  </Badge>
                )}
                {prayer.wants_contact && (
                  <Badge className="text-xs bg-blue-100 text-blue-800">
                    Contact Requested
                  </Badge>
                )}
                {prayer.is_anonymous && (
                  <Badge variant="outline" className="text-xs">
                    Anonymous
                  </Badge>
                )}
                {!prayer.is_public && (
                  <Badge variant="outline" className="text-xs">
                    Private
                  </Badge>
                )}
              </div>
              
              <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                {prayer.description}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {prayer.is_anonymous ? "Anonymous" : prayer.profile?.username || "Unknown"}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(prayer.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedPrayer(prayer)}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            
            {prayer.status === 'pending' && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleUpdateStatus(prayer.id, 'approved')}
                  disabled={processingId === prayer.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus(prayer.id, 'rejected')}
                  disabled={processingId === prayer.id}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Reject
                </Button>
              </>
            )}
            
            {prayer.status === 'approved' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateStatus(prayer.id, 'rejected')}
                disabled={processingId === prayer.id}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Reject
              </Button>
            )}
            
            {prayer.status === 'rejected' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateStatus(prayer.id, 'approved')}
                disabled={processingId === prayer.id}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Approve
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeletePrayer(prayer.id)}
              className="text-destructive hover:text-destructive ml-auto"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-playfair text-2xl font-semibold text-foreground">
            Prayer Moderation
          </h2>
          <p className="text-muted-foreground">
            Review and moderate community prayer requests
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="counselling">Needs Counselling</SelectItem>
              <SelectItem value="healing">Healing</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="guidance">Guidance</SelectItem>
              <SelectItem value="thanksgiving">Thanksgiving</SelectItem>
              <SelectItem value="salvation">Salvation</SelectItem>
              <SelectItem value="protection">Protection</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="text-center">
              <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-yellow-700">{prayers.filter(p => p.status === 'pending').length}</p>
              <p className="text-xs text-yellow-600">Pending Review</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="text-center">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-700">{prayers.filter(p => p.status === 'approved').length}</p>
              <p className="text-xs text-green-600">Approved</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="text-center">
              <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-700">{prayers.filter(p => p.status === 'rejected').length}</p>
              <p className="text-xs text-red-600">Rejected</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-center">
              <MessageSquare className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-700">{prayers.filter(p => p.request_pastoral_counselling).length}</p>
              <p className="text-xs text-blue-600">Need Counselling</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different statuses */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingPrayers.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({approvedPrayers.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({rejectedPrayers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <div className="space-y-3">
            {pendingPrayers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No pending prayers</h3>
                  <p className="text-muted-foreground">All prayer requests have been reviewed.</p>
                </CardContent>
              </Card>
            ) : (
              pendingPrayers.map(prayer => <PrayerCard key={prayer.id} prayer={prayer} />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          <div className="space-y-3">
            {approvedPrayers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No approved prayers</h3>
                  <p className="text-muted-foreground">Approved prayers will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              approvedPrayers.map(prayer => <PrayerCard key={prayer.id} prayer={prayer} />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          <div className="space-y-3">
            {rejectedPrayers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No rejected prayers</h3>
                  <p className="text-muted-foreground">Rejected prayers will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              rejectedPrayers.map(prayer => <PrayerCard key={prayer.id} prayer={prayer} />)
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Prayer Detail Dialog */}
      <Dialog open={!!selectedPrayer} onOpenChange={() => setSelectedPrayer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedPrayer?.title}</DialogTitle>
          </DialogHeader>
          {selectedPrayer && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(selectedPrayer.status)}
                <Badge className={`capitalize ${getCategoryColor(selectedPrayer.category)}`}>
                  {selectedPrayer.category}
                </Badge>
                {selectedPrayer.request_pastoral_counselling && (
                  <Badge variant="destructive">Needs Counselling</Badge>
                )}
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-foreground whitespace-pre-wrap">{selectedPrayer.description}</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {selectedPrayer.is_anonymous ? "Anonymous" : selectedPrayer.profile?.username || "Unknown"}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedPrayer.created_at).toLocaleString()}
                </div>
              </div>

              {/* Contact Details Section */}
              {selectedPrayer.wants_contact && (selectedPrayer.contact_name || selectedPrayer.contact_email || selectedPrayer.contact_phone) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contact Requested
                  </p>
                  <div className="space-y-1 text-sm">
                    {selectedPrayer.contact_name && (
                      <div className="flex items-center gap-2 text-blue-700">
                        <User className="h-3 w-3" />
                        {selectedPrayer.contact_name}
                      </div>
                    )}
                    {selectedPrayer.contact_email && (
                      <div className="flex items-center gap-2 text-blue-700">
                        <Mail className="h-3 w-3" />
                        <a href={`mailto:${selectedPrayer.contact_email}`} className="hover:underline">
                          {selectedPrayer.contact_email}
                        </a>
                      </div>
                    )}
                    {selectedPrayer.contact_phone && (
                      <div className="flex items-center gap-2 text-blue-700">
                        <Phone className="h-3 w-3" />
                        <a href={`tel:${selectedPrayer.contact_phone}`} className="hover:underline">
                          {selectedPrayer.contact_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4 border-t">
                {selectedPrayer.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => {
                        handleUpdateStatus(selectedPrayer.id, 'approved')
                        setSelectedPrayer(null)
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleUpdateStatus(selectedPrayer.id, 'rejected')
                        setSelectedPrayer(null)
                      }}
                      className="text-red-600"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  onClick={() => setSelectedPrayer(null)}
                  className="ml-auto"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
