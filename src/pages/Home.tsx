import { HeroSection } from "@/components/home/hero-section"
import { PromotionalBanner } from "@/components/home/promotional-banner"
import { SignupBanner } from "@/components/home/signup-banner"
import { RadioBanner } from "@/components/home/radio-banner"
import { ProgressBanner } from "@/components/home/progress-banner"
import { QuickActions } from "@/components/home/quick-actions"
import { DailyInspiration } from "@/components/home/daily-inspiration"
import { LatestConversations } from "@/components/home/latest-conversations"

interface HomeProps {
  onNavigate?: (tab: string) => void
}

export default function Home({ onNavigate }: HomeProps) {
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