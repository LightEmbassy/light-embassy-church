import { WatchSection } from "@/components/watch/WatchSection"

interface WatchProps {
  onBack?: () => void
}

export default function Watch({ onBack }: WatchProps) {
  return <WatchSection onBack={onBack} />
}