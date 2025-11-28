import { MessageCenter } from '@/components/messaging/MessageCenter'

interface MessagesProps {
  onBack?: () => void
}

export default function Messages({ onBack }: MessagesProps) {
  return <MessageCenter onBack={onBack} />
}