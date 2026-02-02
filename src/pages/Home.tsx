import { HeroSection } from "@/components/home/hero-section"
import { PromotionalBanner } from "@/components/home/promotional-banner"
import { SignupBanner } from "@/components/home/signup-banner"
import { RadioBanner } from "@/components/home/radio-banner"
import { ProgressBanner } from "@/components/home/progress-banner"
import { QuickActions } from "@/components/home/quick-actions"
import { DailyInspiration } from "@/components/home/daily-inspiration"
import { LatestConversations } from "@/components/home/latest-conversations"
import { WelcomeScreen } from "@/components/welcome/WelcomeScreen"
import { useFirstTimeUser } from "@/hooks/useFirstTimeUser"

interface HomeProps {
  onNavigate?: (tab: string) => void
}

export default function Home({ onNavigate }: HomeProps) {
  const { isFirstTime, isLoading, markWelcomeSeen } = useFirstTimeUser()

  if (isLoading) {
    return null
  }

  if (isFirstTime) {
    return <WelcomeScreen onComplete={markWelcomeSeen} onNavigate={onNavigate} />
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PromotionalBanner onNavigate={onNavigate} />
      <HeroSection />
      <SignupBanner />
      <RadioBanner onNavigate={onNavigate} />
      <ProgressBanner onNavigate={onNavigate} />
      <QuickActions onNavigate={onNavigate} />
      <DailyInspiration />
      <LatestConversations onNavigate={onNavigate} />
    </div>
  )
}