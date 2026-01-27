import { Radio } from "lucide-react"

interface RadioBannerProps {
  onNavigate?: (tab: string) => void
}

export function RadioBanner({ onNavigate }: RadioBannerProps) {
  return (
    <button
      onClick={() => onNavigate('radio')}
      className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 py-6 px-4 hover:from-amber-700 hover:via-amber-600 hover:to-orange-600 transition-all cursor-pointer"
    >
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-1">
          <Radio className="h-6 w-6 text-white animate-pulse" />
          <h3 className="font-playfair text-xl md:text-2xl font-bold text-white">
            Live Radio
          </h3>
          <Radio className="h-6 w-6 text-white animate-pulse" />
        </div>
        <p className="text-white/90 text-sm">
          Listen to free radio on your device
        </p>
      </div>
    </button>
  )
}
