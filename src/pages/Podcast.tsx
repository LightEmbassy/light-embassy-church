import { PodcastSection } from "@/components/podcast/PodcastSection"

interface PodcastProps {
  onBack?: () => void
}

export default function Podcast({ onBack }: PodcastProps) {
  return <PodcastSection onBack={onBack} />
}