import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Phone, Sparkles, X, CheckCircle } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export function SignupBanner() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email && !phone) {
      toast.error("Please enter an email or phone number")
      return
    }

    // Basic validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    if (phone && !/^[\d\s\-+()]{7,}$/.test(phone)) {
      toast.error("Please enter a valid phone number")
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('signups')
        .insert({
          email: email || null,
          phone: phone || null
        })

      if (error) throw error

      setIsSubmitted(true)
      toast.success("Thank you for signing up!")
    } catch (error) {
      console.error('Signup error:', error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isDismissed) return null

  if (isSubmitted) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-primary/80 py-6 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjLTIgMC00IDItNCAyczIgNCA0IDRjMiAwIDQtMiA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative flex items-center justify-center gap-3 text-primary-foreground">
          <CheckCircle className="h-6 w-6" />
          <p className="font-playfair text-lg font-semibold">
            You're all set! We'll keep you updated.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-primary/80 py-6 px-4">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjLTIgMC00IDItNCAyczIgNCA0IDRjMiAwIDQtMiA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
      
      {/* Sparkle decorations */}
      <Sparkles className="absolute top-2 left-4 h-5 w-5 text-primary-foreground/40 animate-pulse" />
      <Sparkles className="absolute bottom-2 right-8 h-4 w-4 text-primary-foreground/30 animate-pulse delay-150" />
      
      {/* Dismiss button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-2 right-2 p-1 text-primary-foreground/60 hover:text-primary-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="font-playfair text-xl md:text-2xl font-bold text-primary-foreground mb-1">
            Stay Connected with Light Embassy
          </h3>
          <p className="text-primary-foreground/80 text-sm">
            Get updates on events, sermons, and community news
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-background/95 border-0 shadow-lg"
            />
          </div>
          
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="tel"
              placeholder="Phone number (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-10 bg-background/95 border-0 shadow-lg"
            />
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-background text-primary hover:bg-background/90 shadow-lg font-semibold px-8"
          >
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-primary-foreground/60 text-xs mt-3">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </div>
  )
}
