import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Star, Crown, Play, Headphones, Calendar } from "lucide-react"
import { format } from "date-fns"
import { Confetti } from "@/components/quiz/Confetti"

interface MediaHistoryItem {
  id: string
  media_type: 'video' | 'podcast'
  media_title: string
  watched_at: string
}

const milestoneIcons = [
  { icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/20" },
  { icon: Medal, color: "text-blue-500", bg: "bg-blue-500/20" },
  { icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/20" },
  { icon: Crown, color: "text-purple-500", bg: "bg-purple-500/20" },
  { icon: Award, color: "text-rose-500", bg: "bg-rose-500/20" },
]

export default function Progress() {
  const { user } = useAuth()
  const [history, setHistory] = useState<MediaHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [celebratedMilestone, setCelebratedMilestone] = useState<number | null>(null)

  useEffect(() => {
    if (user) {
      fetchHistory()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('media_history')
      .select('*')
      .eq('user_id', user?.id)
      .order('watched_at', { ascending: false })

    if (!error && data) {
      setHistory(data as MediaHistoryItem[])
      // Check for milestone celebration
      const totalItems = data.length
      if (totalItems > 0 && totalItems % 3 === 0) {
        triggerCelebration(totalItems)
      }
    }
    setLoading(false)
  }

  const triggerCelebration = (milestone: number) => {
    setCelebratedMilestone(milestone)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 5000)
  }

  const getMilestoneForIndex = (index: number) => {
    // Every 3rd item (indices 2, 5, 8...) gets a milestone badge
    const itemNumber = history.length - index
    if (itemNumber % 3 === 0) {
      const milestoneLevel = Math.floor(itemNumber / 3) - 1
      return milestoneIcons[milestoneLevel % milestoneIcons.length]
    }
    return null
  }

  const totalVideos = history.filter(h => h.media_type === 'video').length
  const totalPodcasts = history.filter(h => h.media_type === 'podcast').length
  const currentMilestone = Math.floor(history.length / 3)
  const nextMilestoneIn = 3 - (history.length % 3)

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 pb-24 pt-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
            <h1 className="font-playfair text-3xl font-bold text-white mb-4">
              My Progress
            </h1>
            <p className="text-white/80 text-lg">
              Sign in to track your spiritual journey and earn achievement badges!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 pb-24 pt-4">
      {showConfetti && <Confetti />}
      
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with celebration style */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Trophy className="h-10 w-10 text-yellow-400 animate-pulse" />
            <h1 className="font-playfair text-4xl font-bold text-white">
              My Progress
            </h1>
            <Trophy className="h-10 w-10 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-white/80 text-lg">
            Celebrating your spiritual journey at Light Embassy Church
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <Play className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{totalVideos}</div>
              <div className="text-white/70 text-sm">Videos</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <Headphones className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{totalPodcasts}</div>
              <div className="text-white/70 text-sm">Podcasts</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <Medal className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{currentMilestone}</div>
              <div className="text-white/70 text-sm">Milestones</div>
            </CardContent>
          </Card>
        </div>

        {/* Milestone Progress */}
        {history.length > 0 && (
          <Card className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-sm border-yellow-500/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Star className="h-8 w-8 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                  <div>
                    <h3 className="font-bold text-white text-lg">Next Milestone</h3>
                    <p className="text-white/70">
                      {nextMilestoneIn === 3 ? "You just hit a milestone!" : `${nextMilestoneIn} more to go!`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full ${
                        i < (3 - nextMilestoneIn) ? 'bg-yellow-400' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Celebration Banner for milestone */}
        {celebratedMilestone && (
          <Card className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 backdrop-blur-sm border-green-500/50 mb-8 animate-pulse">
            <CardContent className="p-6 text-center">
              <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-3 animate-bounce" />
              <h2 className="font-playfair text-2xl font-bold text-white mb-2">
                🎉 Congratulations! 🎉
              </h2>
              <p className="text-white/90">
                You've reached {celebratedMilestone} items! Keep up the amazing work!
              </p>
            </CardContent>
          </Card>
        )}

        {/* History List */}
        <div className="space-y-4">
          <h2 className="font-playfair text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Watch & Listen History
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-white/30 border-t-white rounded-full mx-auto" />
            </div>
          ) : history.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-8 text-center">
                <Play className="h-12 w-12 text-white/50 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">No history yet</h3>
                <p className="text-white/70">
                  Start watching videos or listening to podcasts to track your progress!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {history.map((item, index) => {
                const milestone = getMilestoneForIndex(index)
                const MilestoneIcon = milestone?.icon
                
                return (
                  <Card 
                    key={item.id} 
                    className={`bg-white/10 backdrop-blur-sm border-white/20 transition-all hover:bg-white/15 ${
                      milestone ? 'ring-2 ring-yellow-500/50' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${
                          item.media_type === 'video' ? 'bg-red-500/20' : 'bg-green-500/20'
                        }`}>
                          {item.media_type === 'video' ? (
                            <Play className="h-5 w-5 text-red-400" />
                          ) : (
                            <Headphones className="h-5 w-5 text-green-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">
                            {item.media_title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="secondary" 
                              className={`${
                                item.media_type === 'video' 
                                  ? 'bg-red-500/20 text-red-300' 
                                  : 'bg-green-500/20 text-green-300'
                              }`}
                            >
                              {item.media_type === 'video' ? 'Video' : 'Podcast'}
                            </Badge>
                            <span className="text-white/60 text-sm">
                              {format(new Date(item.watched_at), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                        </div>
                        {milestone && MilestoneIcon && (
                          <div className={`p-2 rounded-full ${milestone.bg} animate-pulse`}>
                            <MilestoneIcon className={`h-6 w-6 ${milestone.color}`} />
                          </div>
                        )}
                      </div>
                      
                      {/* Celebration message for every 3rd item */}
                      {milestone && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-yellow-300 text-sm font-medium flex items-center gap-2">
                            🎉 Milestone reached! {history.length - index} items completed!
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
