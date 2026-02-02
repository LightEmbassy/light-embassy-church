import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"

export interface UserStats {
  totalVideos: number
  totalPodcasts: number
  totalContent: number
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
  unlockedBadges: number
  nextMilestoneIn: number
  currentMilestone: number
}

export function useUserStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats>({
    totalVideos: 0,
    totalPodcasts: 0,
    totalContent: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    unlockedBadges: 0,
    nextMilestoneIn: 3,
    currentMilestone: 0,
  })
  const [loading, setLoading] = useState(true)

  const calculateStreak = (dates: string[]): { current: number; longest: number } => {
    if (dates.length === 0) return { current: 0, longest: 0 }

    // Get unique dates (only date part, no time)
    const uniqueDates = [...new Set(dates.map(d => d.split('T')[0]))].sort().reverse()
    
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 1
    
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    // Check if user was active today or yesterday for current streak
    const isActiveRecently = uniqueDates[0] === today || uniqueDates[0] === yesterday
    
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = new Date(uniqueDates[i])
      const next = new Date(uniqueDates[i + 1])
      const diffDays = Math.floor((current.getTime() - next.getTime()) / 86400000)
      
      if (diffDays === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak)
    currentStreak = isActiveRecently ? tempStreak : 0
    
    // If only active today, streak is 1
    if (uniqueDates[0] === today && uniqueDates.length === 1) {
      currentStreak = 1
    }
    
    return { current: currentStreak, longest: longestStreak }
  }

  const fetchStats = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      // Fetch media history
      const { data: historyData } = await supabase
        .from('media_history')
        .select('media_type, watched_at')
        .eq('user_id', user.id)
        .order('watched_at', { ascending: false })

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id)

      const history = historyData || []
      const achievements = achievementsData || []

      const totalVideos = history.filter(h => h.media_type === 'video').length
      const totalPodcasts = history.filter(h => h.media_type === 'podcast').length
      const totalContent = history.length

      // Calculate streaks
      const watchDates = history.map(h => h.watched_at)
      const { current, longest } = calculateStreak(watchDates)

      setStats({
        totalVideos,
        totalPodcasts,
        totalContent,
        currentStreak: current,
        longestStreak: longest,
        lastActiveDate: history.length > 0 ? history[0].watched_at : null,
        unlockedBadges: achievements.length,
        nextMilestoneIn: 3 - (totalContent % 3) || 3,
        currentMilestone: Math.floor(totalContent / 3),
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, refetch: fetchStats }
}
