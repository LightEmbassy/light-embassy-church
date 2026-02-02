import { LogIn, UserPlus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface AuthPromptBoxProps {
  title?: string
  description?: string
  variant?: "banner" | "card" | "inline"
  onNavigate?: (tab: string) => void
}

export function AuthPromptBox({ 
  title = "Join the Community",
  description = "Sign in or create an account to unlock all features",
  variant = "card",
  onNavigate
}: AuthPromptBoxProps) {
  const handleAuth = () => {
    onNavigate?.('auth')
  }

  if (variant === "banner") {
    return (
      <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-xl p-4 border border-primary/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-2 rounded-full bg-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAuth}
              className="gap-1.5"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
            <Button 
              size="sm" 
              onClick={handleAuth}
              className="gap-1.5 bg-primary hover:bg-primary/90"
            >
              <UserPlus className="h-4 w-4" />
              Register
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 py-4">
        <span className="text-muted-foreground text-sm">{description}</span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAuth}
            className="gap-1.5"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
          <Button 
            size="sm" 
            onClick={handleAuth}
            className="gap-1.5"
          >
            <UserPlus className="h-4 w-4" />
            Register
          </Button>
        </div>
      </div>
    )
  }

  // Default card variant
  return (
    <Card className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-primary/20 overflow-hidden">
      <CardContent className="p-6 text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/20 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-playfair text-xl font-bold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline" 
            onClick={handleAuth}
            className="gap-2"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
          <Button 
            onClick={handleAuth}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4" />
            Create Account
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
