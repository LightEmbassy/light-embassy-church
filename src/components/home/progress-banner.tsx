import { Trophy } from "lucide-react"

interface ProgressBannerProps {
  onNavigate?: (tab: string) => void
}

export function ProgressBanner({ onNavigate }: ProgressBannerProps) {
  return (
    <button
      onClick={() => onNavigate?.('progress')}
      className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 py-6 px-4 hover:from-purple-700 hover:via-pink-600 hover:to-rose-600 transition-all cursor-pointer"
    >
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-1">
          <Trophy className="h-6 w-6 text-yellow-300 animate-bounce" />
          <h3 className="font-playfair text-xl md:text-2xl font-bold text-white">
            My Progress
          </h3>
          <Trophy className="h-6 w-6 text-yellow-300 animate-bounce" />
        </div>
        <p className="text-white/90 text-sm">
          Track your spiritual journey & celebrate milestones
        </p>
      </div>
    </button>
  )
}
