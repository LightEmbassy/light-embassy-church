import { useToast } from "@/hooks/use-toast"

export interface ShareContent {
  title: string
  text: string
  url?: string
  image?: string
}

export const useSharing = () => {
  const { toast } = useToast()

  const shareToWhatsApp = (content: ShareContent) => {
    const text = `${content.title}\n\n${content.text}${content.url ? `\n\n${content.url}` : ''}`
    const encodedText = encodeURIComponent(text)
    const url = `https://wa.me/?text=${encodedText}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const shareToFacebook = (content: ShareContent) => {
    const url = content.url || window.location.href
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(content.text)}`
    window.open(fbUrl, '_blank', 'noopener,noreferrer')
  }

  const shareToTwitter = (content: ShareContent) => {
    const text = `${content.title}\n\n${content.text}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}${content.url ? `&url=${encodeURIComponent(content.url)}` : ''}`
    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
  }

  const shareToInstagram = (content: ShareContent) => {
    // Instagram doesn't have direct web sharing, so we'll copy to clipboard with instructions
    const text = `${content.title}\n\n${content.text}${content.url ? `\n\n${content.url}` : ''}`
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        toast({
          title: "Copied to clipboard!",
          description: "Content copied. You can now paste it in Instagram.",
        })
      })
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      
      toast({
        title: "Copied to clipboard!",
        description: "Content copied. You can now paste it in Instagram.",
      })
    }
  }

  const shareToEmail = (content: ShareContent) => {
    const subject = encodeURIComponent(content.title)
    const body = encodeURIComponent(`${content.text}${content.url ? `\n\n${content.url}` : ''}`)
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`
    window.location.href = mailtoUrl
  }

  const shareViaWebAPI = async (content: ShareContent) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: content.text,
          url: content.url || window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
        toast({
          title: "Sharing failed",
          description: "Please try using the individual platform buttons.",
          variant: "destructive"
        })
      }
    } else {
      toast({
        title: "Native sharing not available",
        description: "Please use the platform-specific buttons below.",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = async (content: ShareContent) => {
    const text = `${content.title}\n\n${content.text}${content.url ? `\n\n${content.url}` : ''}`
    
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text)
        toast({
          title: "Copied to clipboard!",
          description: "Content ready to share anywhere.",
        })
      } catch (error) {
        console.error('Failed to copy:', error)
        fallbackCopyToClipboard(text)
      }
    } else {
      fallbackCopyToClipboard(text)
    }
  }

  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      toast({
        title: "Copied to clipboard!",
        description: "Content ready to share anywhere.",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please manually copy the content.",
        variant: "destructive"
      })
    }
    document.body.removeChild(textArea)
  }

  return {
    shareToWhatsApp,
    shareToFacebook,
    shareToTwitter,
    shareToInstagram,
    shareToEmail,
    shareViaWebAPI,
    copyToClipboard,
  }
}