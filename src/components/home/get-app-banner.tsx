import { useEffect, useState } from "react"
import { Smartphone, X, Apple } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isNative } from "@/lib/native"

// Update these URLs once the apps are live in the stores.
const ANDROID_URL =
  "https://play.google.com/store/apps/details?id=app.lovable.55bd5653424a4578b8f35ca91a34b86b"
const IOS_URL = "https://apps.apple.com/app/light-embassy/id0000000000"

const DISMISS_KEY = "light-embassy-get-app-dismissed"

type Platform = "ios" | "android" | null

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return null
  const ua = navigator.userAgent || ""
  if (/android/i.test(ua)) return "android"
  if (/iphone|ipad|ipod/i.test(ua)) return "ios"
  return null
}

export function GetAppBanner() {
  const [visible, setVisible] = useState(false)
  const [platform, setPlatform] = useState<Platform>(null)

  useEffect(() => {
    if (isNative()) return // already in the native app
    if (localStorage.getItem(DISMISS_KEY)) return
    const p = detectPlatform()
    if (!p) return
    setPlatform(p)
    setVisible(true)
  }, [])

  if (!visible || !platform) return null

  const url = platform === "ios" ? IOS_URL : ANDROID_URL
  const label = platform === "ios" ? "App Store" : "Google Play"

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1")
    setVisible(false)
  }

  return (
    <div className="mx-4 mt-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary via-primary to-accent p-4 text-primary-foreground shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          {platform === "ios" ? (
            <Apple className="h-6 w-6" />
          ) : (
            <Smartphone className="h-6 w-6" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Upgrade to the app</p>
          <p className="text-xs opacity-90 truncate">
            Faster, offline-ready, push notifications & more.
          </p>
        </div>
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="shrink-0 font-semibold"
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            Get on {label}
          </a>
        </Button>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="ml-1 rounded-full p-1 opacity-80 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
