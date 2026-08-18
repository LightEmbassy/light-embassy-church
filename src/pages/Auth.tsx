import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import sunriseHero from '@/assets/sunrise-hero.jpg'

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [mode, setMode] = useState<'auth' | 'forgot' | 'sent'>('auth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signUp, signIn, resetPassword } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
      return
    }
    setMode('sent')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (isSignUp) {
        result = await signUp(email, password, username)
      } else {
        result = await signIn(email, password)
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive"
        })
      } else {
        if (isSignUp) {
          toast({
            title: "Welcome to Light Embassy",
            description: "Your account has been created"
          })
        }
        navigate('/')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${sunriseHero})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-primary/40" />
      
      {/* Content */}
      <Card className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-divine">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="font-playfair text-2xl text-foreground">
            {mode === 'forgot' ? 'Reset your password' : mode === 'sent' ? 'Check your email' : isSignUp ? 'Join Light Embassy' : 'Welcome Back'}
          </CardTitle>
          <p className="text-muted-foreground font-inter">
            {mode === 'forgot'
              ? "Enter your email and we'll send you a secure link to set a new password"
              : mode === 'sent'
                ? `If an account exists for ${email}, a password reset link is on its way. The link expires shortly and can only be used once.`
                : isSignUp
                  ? 'Create your account to access all our content'
                  : 'Sign in to continue your spiritual journey'
            }
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {mode === 'sent' && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground font-inter">
                Didn't receive it? Check your spam folder, or try again in a minute.
              </p>
              <Button className="w-full" onClick={() => setMode('auth')}>Back to sign in</Button>
            </div>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="font-inter">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="font-inter"
                  placeholder="your@email.com"
                />
              </div>
              <Button type="submit" className="w-full transition-divine" disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
              <Button type="button" variant="link" className="w-full font-inter text-primary" onClick={() => setMode('auth')}>
                Back to sign in
              </Button>
            </form>
          )}

          {mode === 'auth' && (
          <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-inter">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="font-inter"
                placeholder="your@email.com"
              />
            </div>
            
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="username" className="font-inter">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="font-inter"
                  placeholder="Choose a username"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password" className="font-inter">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="font-inter"
                placeholder="Enter your password"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full transition-divine" 
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          {!isSignUp && (
            <div className="text-center -mt-2">
              <Button
                variant="link"
                onClick={() => setMode('forgot')}
                className="p-0 h-auto font-inter text-sm text-muted-foreground hover:text-primary"
              >
                Forgot your password?
              </Button>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-muted-foreground font-inter">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="p-0 h-auto font-inter text-primary hover:text-primary/80"
            >
              {isSignUp ? 'Sign in here' : 'Create one here'}
            </Button>
          </div>
          </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}