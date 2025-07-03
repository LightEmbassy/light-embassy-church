import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { 
  Heart, 
  MessageSquare, 
  Eye, 
  Trash2, 
  Calendar,
  User,
  Filter
} from "lucide-react"
import { Tables } from "@/integrations/supabase/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type PrayerRequest = Tables<"prayer_requests"> & {
  profiles: {
    username: string
  } | null
}

export function PrayerManagement() {
  const { toast } = useToast()
  const [prayers, setPrayers] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    fetchPrayers()
  }, [])

  const fetchPrayers = async () => {
    try {
      const { data, error } = await supabase
        .from("prayer_requests")
        .select(`
          *,
          profiles!prayer_requests_user_id_fkey (
            username
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      setPrayers((data as any) || [])
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

  const filteredPrayers = prayers.filter(prayer => {
    if (filter === "all") return true
    if (filter === "counselling") return prayer.request_pastoral_counselling
    return prayer.category === filter
  })

  if (loading) {
    return <div className="text-center py-8">Loading prayer requests...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-2xl font-semibold text-foreground">
            Prayer Management
          </h2>
          <p className="text-muted-foreground">
            Monitor and manage community prayer requests
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prayers</SelectItem>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="text-center">
              <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{prayers.length}</p>
              <p className="text-sm text-muted-foreground">Total Prayers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="text-center">
              <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {prayers.filter(p => p.request_pastoral_counselling).length}
              </p>
              <p className="text-sm text-muted-foreground">Need Counselling</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="text-center">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {prayers.filter(p => {
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return new Date(p.created_at) > weekAgo
                }).length}
              </p>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {filteredPrayers.map((prayer) => (
          <Card key={prayer.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {prayer.title}
                      </h3>
                      <Badge 
                        variant="secondary" 
                        className={`capitalize ${getCategoryColor(prayer.category)}`}
                      >
                        {prayer.category}
                      </Badge>
                      {prayer.request_pastoral_counselling && (
                        <Badge variant="destructive">
                          Needs Counselling
                        </Badge>
                      )}
                      {prayer.is_anonymous && (
                        <Badge variant="outline">
                          Anonymous
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-3 line-clamp-3">
                      {prayer.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {prayer.is_anonymous ? "Anonymous" : prayer.profiles?.username || "Unknown"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(prayer.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Navigate to prayer details or open in new tab
                        console.log("View prayer details:", prayer.id)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePrayer(prayer.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredPrayers.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No prayer requests found</h3>
              <p className="text-muted-foreground">
                {filter === "all" 
                  ? "No prayer requests have been submitted yet."
                  : `No prayer requests match the selected filter: ${filter}`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}