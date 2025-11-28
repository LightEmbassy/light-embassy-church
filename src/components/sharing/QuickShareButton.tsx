import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { useSharing, ShareContent } from "@/hooks/useSharing"

interface QuickShareButtonProps {
  content: ShareContent
  platform: 'whatsapp' | 'facebook' | 'twitter' | 'instagram' | 'email' | 'copy' | 'native'
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}

export function QuickShareButton({ 
  content, 
  platform, 
  size = 'sm', 
  variant = 'outline',
  className 
}: QuickShareButtonProps) {
  const {
    shareToWhatsApp,
    shareToFacebook,
    shareToTwitter,
    shareToInstagram,
    shareToEmail,
    shareViaWebAPI,
    copyToClipboard,
  } = useSharing()

  const handleShare = () => {
    switch (platform) {
      case 'whatsapp':
        shareToWhatsApp(content)
        break
      case 'facebook':
        shareToFacebook(content)
        break
      case 'twitter':
        shareToTwitter(content)
        break
      case 'instagram':
        shareToInstagram(content)
        break
      case 'email':
        shareToEmail(content)
        break
      case 'copy':
        copyToClipboard(content)
        break
      case 'native':
        shareViaWebAPI(content)
        break
    }
  }

  const getPlatformLabel = () => {
    switch (platform) {
      case 'whatsapp': return 'WhatsApp'
      case 'facebook': return 'Facebook'
      case 'twitter': return 'Twitter'
      case 'instagram': return 'Instagram'
      case 'email': return 'Email'
      case 'copy': return 'Copy'
      case 'native': return 'Share'
    }
  }

  return (
    <Button 
      onClick={handleShare}
      size={size}
      variant={variant}
      className={className}
      title={`Share to ${getPlatformLabel()}`}
    >
      <Share2 className="h-3 w-3" />
      <span className="sr-only">Share to {getPlatformLabel()}</span>
    </Button>
  )
}