import React, { createContext, useContext, useState, useCallback } from 'react'

interface NavigationState {
  tab: string
  data?: any
}

interface NavigationContextType {
  currentTab: string
  navigationHistory: NavigationState[]
  navigateTo: (tab: string, data?: any) => void
  goBack: () => boolean
  canGoBack: boolean
  clearHistory: () => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [navigationHistory, setNavigationHistory] = useState<NavigationState[]>([
    { tab: 'home' }
  ])
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentTab = navigationHistory[currentIndex]?.tab || 'home'
  const canGoBack = currentIndex > 0

  const navigateTo = useCallback((tab: string, data?: any) => {
    setNavigationHistory(prev => {
      // Remove any forward history
      const newHistory = prev.slice(0, currentIndex + 1)
      // Add new state
      return [...newHistory, { tab, data }]
    })
    setCurrentIndex(prev => prev + 1)
  }, [currentIndex])

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      return true
    }
    return false
  }, [currentIndex])

  const clearHistory = useCallback(() => {
    setNavigationHistory([{ tab: 'home' }])
    setCurrentIndex(0)
  }, [])

  return (
    <NavigationContext.Provider
      value={{
        currentTab,
        navigationHistory,
        navigateTo,
        goBack,
        canGoBack,
        clearHistory
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}
