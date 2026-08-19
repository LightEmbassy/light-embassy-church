import { useState, useEffect } from 'react'

const WELCOME_SEEN_KEY = 'light-embassy-welcome-seen'

export function useFirstTimeUser() {
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem(WELCOME_SEEN_KEY)
    setIsFirstTime(!hasSeenWelcome)
    setIsLoading(false)
  }, [])

  const markWelcomeSeen = () => {
    sessionStorage.setItem(WELCOME_SEEN_KEY, 'true')
    setIsFirstTime(false)
  }

  const resetWelcome = () => {
    sessionStorage.removeItem(WELCOME_SEEN_KEY)
    setIsFirstTime(true)
  }

  return {
    isFirstTime,
    isLoading,
    markWelcomeSeen,
    resetWelcome
  }
}
