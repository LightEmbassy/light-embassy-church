import { HeroSection } from "@/components/home/hero-section"
import { PromotionalBanner } from "@/components/home/promotional-banner"
import { GetAppBanner } from "@/components/home/get-app-banner"
import { SignupBanner } from "@/components/home/signup-banner"
import { RadioBanner } from "@/components/home/radio-banner"
import { ProgressBanner } from "@/components/home/progress-banner"
import { QuickActions } from "@/components/home/quick-actions"
import { DailyInspiration } from "@/components/home/daily-inspiration"
import { LatestConversations } from "@/components/home/latest-conversations"
import { WelcomeScreen } from "@/components/welcome/WelcomeScreen"
import { IntroVideo } from "@/components/welcome/IntroVideo"
import { useFirstTimeUser } from "@/hooks/useFirstTimeUser"
import { useIntroVideo } from "@/hooks/useIntroVideo"

interface HomeProps {
  onNavigate?: (tab: string) => void
}

export default function Home({ onNavigate }: HomeProps) {
  const { isFirstTime, isLoading, markWelcomeSeen } = useFirstTimeUser()
  const { hasSeen: hasSeenIntro, markSeen: markIntroSeen } = useIntroVideo()

  if (isLoading || hasSeenIntro === null) {
    return null
  }

  if (!hasSeenIntro) {
    return <IntroVideo onComplete={markIntroSeen} />
  }

  if (isFirstTime) {
    return <WelcomeScreen onComplete={markWelcomeSeen} onNavigate={onNavigate} />
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <GetAppBanner />
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