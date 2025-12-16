import { Radio } from "lucide-react"

export function RadioBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3">
          <Radio className="h-6 w-6 text-white animate-pulse" />
          <h3 className="font-playfair text-xl md:text-2xl font-bold text-white">
            Radio in Your Area
          </h3>
          <Radio className="h-6 w-6 text-white animate-pulse" />
        </div>
      </div>
    </div>
  )
}
