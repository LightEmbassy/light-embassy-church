import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { BarChart3, Users, Heart, MessageSquare, Video, Headphones } from "lucide-react"

interface Stats {
  totalUsers: number
  totalPrayers: number
  totalMessages: number
  totalFavoriteVerses: number
  newUsersThisWeek: number
  prayersThisWeek: number
}

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPrayers: 0,
    totalMessages: 0,
    totalFavoriteVerses: 0,
    newUsersThisWeek: 0,
    prayersThisWeek: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      // Get total counts
      const [
        { count: totalUsers },
        { count: totalPrayers },
        { count: totalMessages },
        { count: totalFavoriteVerses },
        { count: newUsersThisWeek },
        { count: prayersThisWeek }
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("prayer_requests").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase.from("favorite_verses").select("*", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", oneWeekAgo.toISOString()),
        supabase
          .from("prayer_requests")
          .select("*", { count: "exact", head: true })
          .gte("created_at", oneWeekAgo.toISOString())
      ])

      setStats({
        totalUsers: totalUsers || 0,
        totalPrayers: totalPrayers || 0,
        totalMessages: totalMessages || 0,
        totalFavoriteVerses: totalFavoriteVerses || 0,
        newUsersThisWeek: newUsersThisWeek || 0,
        prayersThisWeek: prayersThisWeek || 0
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      change: `+${stats.newUsersThisWeek} this week`,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Prayer Requests",
      value: stats.totalPrayers,
      change: `+${stats.prayersThisWeek} this week`,
      icon: Heart,
      color: "text-red-600"
    },
    {
      title: "Messages",
      value: stats.totalMessages,
      change: "All conversations",
      icon: MessageSquare,
      color: "text-green-600"
    },
    {
      title: "Favorite Verses",
      value: stats.totalFavoriteVerses,
      change: "Saved by users",
      icon: BarChart3,
      color: "text-purple-600"
    },
    {
      title: "Video Content",
      value: "12",
      change: "Sermons & teachings",
      icon: Video,
      color: "text-orange-600"
    },
    {
      title: "Podcast Episodes",
      value: "1",
      change: "Published episodes",
      icon: Headphones,
      color: "text-indigo-600"
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-semibold text-foreground mb-2">
          Analytics Overview
        </h2>
        <p className="text-muted-foreground">
          Monitor your community engagement and content performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-divine transition-divine">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Heart className="h-4 w-4 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New prayer request</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registration</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New message</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Most Popular Video</span>
                <span className="text-sm font-medium">Step out of your boat</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Most Shared Verse</span>
                <span className="text-sm font-medium">Philippians 4:13</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Prayer Requests</span>
                <span className="text-sm font-medium">{stats.totalPrayers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Weekly Engagement</span>
                <span className="text-sm font-medium text-green-600">+15%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}