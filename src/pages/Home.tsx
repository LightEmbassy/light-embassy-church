import { HeroSection } from "@/components/home/hero-section"
import { QuickActions } from "@/components/home/quick-actions"
import { DailyInspiration } from "@/components/home/daily-inspiration"
import { CommunityFeed } from "@/components/home/community-feed"

interface HomeProps {
  onNavigate?: (tab: string) => void
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <HeroSection />
      <QuickActions onNavigate={onNavigate} />
      <DailyInspiration />
      <CommunityFeed />
    </div>
  )
}