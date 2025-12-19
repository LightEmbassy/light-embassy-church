import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export type AchievementType = 
  | 'first_video'
  | 'first_podcast'
  | 'videos_10'
  | 'videos_25'
  | 'videos_50'
  | 'podcasts_10'
  | 'podcasts_25'
  | 'podcasts_50'
  | 'total_100'
  | 'weekly_streak'
  | 'early_bird'

export interface Achievement {
  id: string
  user_id: string
  achievement: AchievementType
  unlocked_at: string
}

export interface AchievementInfo {
  type: AchievementType
  name: string
  description: string
  icon: string
  color: string
  bgColor: string
}

export const ACHIEVEMENTS: Record<AchievementType, Omit<AchievementInfo, 'type'>> = {
  first_video: {
    name: "First Watch",
    description: "Watched your first video",
    icon: "🎬",
    color: "text-red-500",
    bgColor: "bg-red-500/20"
  },
  first_podcast: {
    name: "First Listen",
    description: "Listened to your first podcast",
    icon: "🎧",
    color: "text-green-500",
    bgColor: "bg-green-500/20"
  },
  videos_10: {
    name: "Video Explorer",
    description: "Watched 10 videos",
    icon: "📺",
    color: "text-blue-500",
    bgColor: "bg-blue-500/20"
  },
  videos_25: {
    name: "Video Enthusiast",
    description: "Watched 25 videos",
    icon: "🎥",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/20"
  },
  videos_50: {
    name: "Video Master",
    description: "Watched 50 videos",
    icon: "🏆",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/20"
  },
  podcasts_10: {
    name: "Podcast Explorer",
    description: "Listened to 10 podcasts",
    icon: "🎙️",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/20"
  },
  podcasts_25: {
    name: "Podcast Enthusiast",
    description: "Listened to 25 podcasts",
    icon: "🎶",
    color: "text-teal-500",
    bgColor: "bg-teal-500/20"
  },
  podcasts_50: {
    name: "Podcast Master",
    description: "Listened to 50 podcasts",
    icon: "👑",
    color: "text-amber-500",
    bgColor: "bg-amber-500/20"
  },
  total_100: {
    name: "Century Club",
    description: "Consumed 100 pieces of content",
    icon: "💯",
    color: "text-purple-500",
    bgColor: "bg-purple-500/20"
  },
  weekly_streak: {
    name: "Weekly Warrior",
    description: "Active 7 days in a row",
    icon: "🔥",
    color: "text-orange-500",
    bgColor: "bg-orange-500/20"
  },
  early_bird: {
    name: "Early Bird",
    description: "Watched content before 7 AM",
    icon: "🌅",
    color: "text-pink-500",
    bgColor: "bg-pink-500/20"
  }
}

export function useAchievements() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [newAchievement, setNewAchievement] = useState<AchievementType | null>(null)

  const fetchAchievements = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false })

    if (!error && data) {
      setAchievements(data as Achievement[])
    }
    setLoading(false)
  }, [user])

  const checkForNewAchievements = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .rpc('check_and_award_achievements', { p_user_id: user.id })

    if (!error && data && data.length > 0) {
      // New achievements were unlocked!
      const newOnes = data as { new_achievement: AchievementType }[]
      
      for (const achievement of newOnes) {
        const info = ACHIEVEMENTS[achievement.new_achievement]
        setNewAchievement(achievement.new_achievement)
        
        toast({
          title: `🎉 Achievement Unlocked!`,
          description: `${info.icon} ${info.name} - ${info.description}`,
        })
      }
      
      // Refresh achievements list
      await fetchAchievements()
    }
  }, [user, toast, fetchAchievements])

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  const clearNewAchievement = () => setNewAchievement(null)

  const hasAchievement = (type: AchievementType) => {
    return achievements.some(a => a.achievement === type)
  }

  const getUnlockedAchievements = () => {
    return achievements.map(a => ({
      ...a,
      info: ACHIEVEMENTS[a.achievement]
    }))
  }

  const getAllAchievements = () => {
    return Object.entries(ACHIEVEMENTS).map(([type, info]) => ({
      type: type as AchievementType,
      ...info,
      unlocked: hasAchievement(type as AchievementType),
      unlockedAt: achievements.find(a => a.achievement === type)?.unlocked_at
    }))
  }

  return {
    achievements,
    loading,
    newAchievement,
    clearNewAchievement,
    checkForNewAchievements,
    hasAchievement,
    getUnlockedAchievements,
    getAllAchievements,
    fetchAchievements
  }
}
