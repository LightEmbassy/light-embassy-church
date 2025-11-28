import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoManagement } from "@/components/admin/VideoManagement"
import { PodcastManagement } from "@/components/admin/PodcastManagement"
import { PrayerManagement } from "@/components/admin/PrayerManagement"
import { UserManagement } from "@/components/admin/UserManagement"
import { QuizManagement } from "@/components/admin/QuizManagement"
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard"
import { 
  Settings, 
  Users, 
  Video, 
  Headphones, 
  Heart, 
  HelpCircle, 
  BarChart3,
  Shield,
  ArrowLeft
} from "lucide-react"

interface AdminProps {
  onBack?: () => void
}

export default function Admin({ onBack }: AdminProps) {
  const { user } = useAuth()
  const { profile, loading } = useProfile()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Check if user has admin/moderator/staff permissions
  const hasAdminAccess = profile && ['admin', 'moderator', 'staff'].includes((profile as any).role)

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-16 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-playfair text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access the admin dashboard.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-16">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-playfair text-4xl font-bold text-primary">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage content and users for Light Embassy Church
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span className="capitalize">{(profile as any)?.role || 'user'}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="podcasts" className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              Podcasts
            </TabsTrigger>
            <TabsTrigger value="prayers" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Prayers
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Quiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="videos">
            <VideoManagement />
          </TabsContent>

          <TabsContent value="podcasts">
            <PodcastManagement />
          </TabsContent>

          <TabsContent value="prayers">
            <PrayerManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="quiz">
            <QuizManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}