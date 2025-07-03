import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Share2, MessageCircle, Instagram, Facebook, Twitter, Mail, Copy, Smartphone } from "lucide-react"
import { useSharing, ShareContent } from "@/hooks/useSharing"

interface ShareDialogProps {
  content: ShareContent
  children?: React.ReactNode
  triggerClassName?: string
}

export function ShareDialog({ content, children, triggerClassName }: ShareDialogProps) {
  const {
    shareToWhatsApp,
    shareToFacebook,
    shareToTwitter,
    shareToInstagram,
    shareToEmail,
    shareViaWebAPI,
    copyToClipboard,
  } = useSharing()

  const defaultTrigger = (
    <Button variant="outline" size="sm" className={triggerClassName}>
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Content
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="font-semibold text-sm mb-1">{content.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-3">{content.text}</p>
          </div>

          <div className="space-y-3">
            {/* Native Web Share API */}
            <Button 
              onClick={() => shareViaWebAPI(content)}
              className="w-full justify-start"
              variant="outline"
            >
              <Smartphone className="h-4 w-4 mr-3" />
              Quick Share (Native)
            </Button>

            {/* Social Media Platforms */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => shareToWhatsApp(content)}
                variant="outline"
                className="justify-start"
              >
                <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                WhatsApp
              </Button>

              <Button 
                onClick={() => shareToFacebook(content)}
                variant="outline"
                className="justify-start"
              >
                <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                Facebook
              </Button>

              <Button 
                onClick={() => shareToTwitter(content)}
                variant="outline"
                className="justify-start"
              >
                <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                Twitter/X
              </Button>

              <Button 
                onClick={() => shareToInstagram(content)}
                variant="outline"
                className="justify-start"
              >
                <Instagram className="h-4 w-4 mr-2 text-pink-600" />
                Instagram
              </Button>
            </div>

            {/* Other Options */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => shareToEmail(content)}
                variant="outline"
                className="justify-start"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>

              <Button 
                onClick={() => copyToClipboard(content)}
                variant="outline"
                className="justify-start"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Text
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
