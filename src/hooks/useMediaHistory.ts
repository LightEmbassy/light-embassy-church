import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useAchievements } from "./useAchievements"

type MediaType = 'video' | 'podcast'

export function useMediaHistory() {
  const { user } = useAuth()
  const { checkForNewAchievements } = useAchievements()

  const trackMedia = async (mediaType: MediaType, mediaId: string, mediaTitle: string) => {
    if (!user) return

    try {
      await supabase
        .from('media_history')
        .insert({
          user_id: user.id,
          media_type: mediaType,
          media_id: mediaId,
          media_title: mediaTitle,
        })
      
      // Check for new achievements after tracking
      await checkForNewAchievements()
    } catch (error) {
      console.error('Error tracking media:', error)
    }
  }

  return { trackMedia }
}
