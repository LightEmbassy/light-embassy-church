import { HeroSection } from "@/components/home/hero-section"
import { QuickActions } from "@/components/home/quick-actions"
import { DailyInspiration } from "@/components/home/daily-inspiration"
import { CommunityFeed } from "@/components/home/community-feed"

export default function Home() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <HeroSection />
      <QuickActions />
      <DailyInspiration />
      <CommunityFeed />
    </div>
  )
}