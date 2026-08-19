import { useState, useEffect } from 'react'

const INTRO_VIDEO_SEEN_KEY = 'light-embassy-intro-video-seen'

export function useIntroVideo() {
  const [hasSeen, setHasSeen] = useState<boolean | null>(null)

  useEffect(() => {
    setHasSeen(!!sessionStorage.getItem(INTRO_VIDEO_SEEN_KEY))
  }, [])

  const markSeen = () => {
    sessionStorage.setItem(INTRO_VIDEO_SEEN_KEY, 'true')
    setHasSeen(true)
  }

  const reset = () => {
    sessionStorage.removeItem(INTRO_VIDEO_SEEN_KEY)
    setHasSeen(false)
  }

  return { hasSeen, markSeen, reset }
}
