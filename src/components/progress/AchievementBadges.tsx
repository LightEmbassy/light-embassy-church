import { Card, CardContent } from "@/components/ui/card"
import { useAchievements, ACHIEVEMENTS, AchievementType } from "@/hooks/useAchievements"
import { format } from "date-fns"
import { Lock, Sparkles } from "lucide-react"
import { Confetti } from "@/components/quiz/Confetti"

export function AchievementBadges() {
  const { getAllAchievements, loading, newAchievement, clearNewAchievement } = useAchievements()
  
  const allAchievements = getAllAchievements()
  const unlockedCount = allAchievements.filter(a => a.unlocked).length
  const totalCount = allAchievements.length

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="font-playfair text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-400" />
          Achievement Badges
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 bg-white/10 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {newAchievement && <Confetti />}
      
      <div className="flex items-center justify-between">
        <h2 className="font-playfair text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-400" />
          Achievement Badges
        </h2>
        <span className="text-white/70 text-sm">
          {unlockedCount}/{totalCount} unlocked
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {allAchievements.map((achievement) => (
          <Card
            key={achievement.type}
            className={`relative overflow-hidden transition-all ${
              achievement.unlocked
                ? `${achievement.bgColor} border-white/30 hover:scale-105`
                : 'bg-white/5 border-white/10 opacity-60'
            } ${
              newAchievement === achievement.type
                ? 'ring-2 ring-yellow-400 animate-pulse'
                : ''
            }`}
            onClick={() => newAchievement === achievement.type && clearNewAchievement()}
          >
            <CardContent className="p-3 text-center">
              <div className="text-3xl mb-2">
                {achievement.unlocked ? achievement.icon : <Lock className="h-8 w-8 mx-auto text-white/30" />}
              </div>
              <h3 className={`font-semibold text-xs ${achievement.unlocked ? 'text-white' : 'text-white/50'}`}>
                {achievement.name}
              </h3>
              {achievement.unlocked && achievement.unlockedAt && (
                <p className="text-white/60 text-[10px] mt-1">
                  {format(new Date(achievement.unlockedAt), 'MMM d')}
                </p>
              )}
              {!achievement.unlocked && (
                <p className="text-white/40 text-[10px] mt-1 line-clamp-2">
                  {achievement.description}
                </p>
              )}
            </CardContent>
            
            {/* Shine effect for new achievements */}
            {newAchievement === achievement.type && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
