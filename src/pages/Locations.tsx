import { LocationsSection } from "@/components/locations/LocationsSection"

interface LocationsProps {
  onBack?: () => void
}

export default function Locations({ onBack }: LocationsProps) {
  return <LocationsSection onBack={onBack} />
}