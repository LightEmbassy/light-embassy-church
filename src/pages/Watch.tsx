import { WatchSection } from "@/components/watch/WatchSection"
import { useNavigate } from "react-router-dom"

interface WatchProps {
  onBack?: () => void
}

export default function Watch({ onBack }: WatchProps) {
  const navigate = useNavigate()
  
  // Use provided onBack or default to navigate home
  const handleBack = onBack || (() => navigate('/'))
  
  return <WatchSection onBack={handleBack} />
}
