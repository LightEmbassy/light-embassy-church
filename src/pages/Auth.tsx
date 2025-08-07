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
  const [isResetPassword, setIsResetPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signUp, signIn, resetPassword } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (isResetPassword) {
        result = await resetPassword(email)
      } else if (isSignUp) {
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
        if (isResetPassword) {
          toast({
            title: "Reset Email Sent",
            description: "Please check your email for password reset instructions"
          })
          setIsResetPassword(false)
        } else if (isSignUp) {
          toast({
            title: "Success",
            description: "Please check your email to confirm your account"
          })
        } else {
          navigate('/')
        }
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
            {isResetPassword ? 'Reset Password' : (isSignUp ? 'Join Light Embassy' : 'Welcome Back')}
          </CardTitle>
          <p className="text-muted-foreground font-inter">
            {isResetPassword 
              ? 'Enter your email to receive password reset instructions'
              : (isSignUp 
                ? 'Create your account to access all our content' 
                : 'Sign in to continue your spiritual journey'
              )
            }
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
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
            
            {isSignUp && !isResetPassword && (
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
            
            {!isResetPassword && (
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
            )}
            
            <Button 
              type="submit" 
              className="w-full transition-divine" 
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isResetPassword ? 'Send Reset Email' : (isSignUp ? 'Create Account' : 'Sign In'))}
            </Button>
          </form>
          
          {!isResetPassword && (
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
          )}
          
          {!isSignUp && !isResetPassword && (
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setIsResetPassword(true)}
                className="p-0 h-auto font-inter text-muted-foreground hover:text-primary text-sm"
              >
                Forgot your password?
              </Button>
            </div>
          )}
          
          {isResetPassword && (
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => {
                  setIsResetPassword(false)
                  setIsSignUp(false)
                }}
                className="p-0 h-auto font-inter text-primary hover:text-primary/80"
              >
                Back to sign in
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}