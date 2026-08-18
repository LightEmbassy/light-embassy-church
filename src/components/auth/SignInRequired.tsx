import { useNavigate } from 'react-router-dom'
import { LogIn, UserPlus, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface SignInRequiredProps {
  title?: string
  description?: string
  compact?: boolean
}

export function SignInRequired({
  title = 'Sign in to join the conversation',
  description = 'Create a free account to post, reply and message our team.',
  compact = false,
}: SignInRequiredProps) {
  const navigate = useNavigate()
  const go = () => navigate('/auth')

  const buttons = (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Button variant="outline" onClick={go} className="gap-2">
        <LogIn className="h-4 w-4" />
        Sign In
      </Button>
      <Button onClick={go} className="gap-2">
        <UserPlus className="h-4 w-4" />
        Create Account
      </Button>
    </div>
  )

  if (compact) {
    return (
      <div className="rounded-lg border border-primary/20 bg-muted/30 p-4 space-y-3 text-center">
        <p className="text-sm text-muted-foreground">{description}</p>
        {buttons}
      </div>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-primary/20">
      <CardContent className="p-6 text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/20 mb-4">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <h3 className="font-playfair text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>
        {buttons}
      </CardContent>
    </Card>
  )
}
