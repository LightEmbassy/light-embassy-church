import { Trophy, Flame, Play, Headphones, Sparkles, ChevronRight, Star } from "lucide-react"
import { useUserStats } from "@/hooks/useUserStats"
import { useAuth } from "@/contexts/AuthContext"
import { Progress } from "@/components/ui/progress"

interface ProgressBannerProps {
  onNavigate?: (tab: string) => void
}

export function ProgressBanner({ onNavigate }: ProgressBannerProps) {
  const { user } = useAuth()
  const { stats, loading } = useUserStats()

  // For non-logged-in users, show a teaser
  if (!user) {
    return (
      <button
        onClick={() => onNavigate?.('progress')}
        className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 py-6 px-4 hover:from-purple-700 hover:via-pink-600 hover:to-rose-600 transition-all cursor-pointer"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <Trophy className="h-6 w-6 text-yellow-300 animate-bounce" />
            <h3 className="font-playfair text-xl md:text-2xl font-bold text-white">
              Track Your Spiritual Journey
            </h3>
            <Trophy className="h-6 w-6 text-yellow-300 animate-bounce" />
          </div>
          <p className="text-white/90 text-sm">
            Sign in to earn badges, track streaks & celebrate milestones!
          </p>
        </div>
      </button>
    )
  }

  const progressToNextMilestone = ((3 - stats.nextMilestoneIn) / 3) * 100

  return (
    <button
      onClick={() => onNavigate?.('progress')}
      className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 py-4 px-4 hover:from-purple-700 hover:via-pink-600 hover:to-rose-600 transition-all cursor-pointer group"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-300" />
            <h3 className="font-playfair text-lg font-bold text-white">
              My Progress
            </h3>
          </div>
          <div className="flex items-center gap-1 text-white/80 text-sm group-hover:text-white transition-colors">
            <span>View All</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {loading ? (
          <div className="h-16 flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-white/30 border-t-white rounded-full" />
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {/* Videos */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <Play className="h-4 w-4 text-red-300 mx-auto mb-0.5" />
                <div className="text-lg font-bold text-white">{stats.totalVideos}</div>
                <div className="text-[10px] text-white/70">Videos</div>
              </div>

              {/* Podcasts */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <Headphones className="h-4 w-4 text-green-300 mx-auto mb-0.5" />
                <div className="text-lg font-bold text-white">{stats.totalPodcasts}</div>
                <div className="text-[10px] text-white/70">Podcasts</div>
              </div>

              {/* Streak */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center relative overflow-hidden">
                {stats.currentStreak > 0 && (
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-500/30 to-transparent" />
                )}
                <Flame className={`h-4 w-4 mx-auto mb-0.5 ${stats.currentStreak > 0 ? 'text-orange-400 animate-pulse' : 'text-orange-300/50'}`} />
                <div className="text-lg font-bold text-white relative">{stats.currentStreak}</div>
                <div className="text-[10px] text-white/70 relative">Day Streak</div>
              </div>

              {/* Badges */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <Sparkles className="h-4 w-4 text-purple-300 mx-auto mb-0.5" />
                <div className="text-lg font-bold text-white">{stats.unlockedBadges}</div>
                <div className="text-[10px] text-white/70">Badges</div>
              </div>
            </div>

            {/* Next Milestone Progress */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-yellow-300" />
                  <span className="text-xs text-white/90 font-medium">
                    Next Milestone
                  </span>
                </div>
                <span className="text-xs text-yellow-300 font-bold">
                  {stats.nextMilestoneIn === 3 
                    ? "🎉 Just reached!" 
                    : `${stats.nextMilestoneIn} more to go!`
                  }
                </span>
              </div>
              <Progress 
                value={progressToNextMilestone} 
                className="h-2 bg-white/20"
              />
            </div>

            {/* Motivational Message */}
            {stats.totalContent === 0 && (
              <p className="text-center text-white/80 text-xs mt-2">
                🌟 Start your journey by watching a video or listening to a podcast!
              </p>
            )}
            {stats.currentStreak >= 3 && (
              <p className="text-center text-yellow-300 text-xs mt-2 font-medium animate-pulse">
                🔥 Amazing! {stats.currentStreak} day streak - keep it up!
              </p>
            )}
          </>
        )}
      </div>
    </button>
  )
}
