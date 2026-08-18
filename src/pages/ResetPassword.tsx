import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, KeyRound, ShieldAlert } from 'lucide-react'
import sunriseHero from '@/assets/sunrise-hero.jpg'

type Status = 'checking' | 'ready' | 'invalid' | 'done'

export default function ResetPassword() {
  const [status, setStatus] = useState<Status>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    let settled = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        settled = true
        setStatus((s) => (s === 'done' ? s : 'ready'))
      }
    })

    // Handle both hash (implicit) and PKCE (?code=) recovery links
    const run = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          settled = true
          setStatus('ready')
          return
        }
      }

      const { data } = await supabase.auth.getSession()
      if (data.session) {
        settled = true
        setStatus('ready')
        return
      }

      setTimeout(() => {
        if (!settled) setStatus('invalid')
      }, 1500)
    }
    run()

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      toast({ title: 'Password too short', description: 'Use at least 8 characters.', variant: 'destructive' })
      return
    }
    if (password !== confirm) {
      toast({ title: 'Passwords do not match', description: 'Please re-enter your new password.', variant: 'destructive' })
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      toast({ title: 'Could not update password', description: error.message, variant: 'destructive' })
      return
    }

    setStatus('done')
    toast({ title: 'Password updated', description: 'You can now sign in with your new password.' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${sunriseHero})` }} />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-primary/40" />

      <Card className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-divine">
        <CardHeader className="text-center space-y-3">
          <CardTitle className="font-playfair text-2xl text-foreground">
            {status === 'done' ? 'Password updated' : 'Set a new password'}
          </CardTitle>
          <p className="text-muted-foreground font-inter text-sm">
            {status === 'invalid'
              ? 'This reset link is invalid or has expired.'
              : status === 'done'
                ? 'Your password has been changed successfully.'
                : 'Choose a new password for your Light Embassy account.'}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {status === 'checking' && (
            <p className="text-center text-sm text-muted-foreground font-inter">Verifying your reset link…</p>
          )}

          {status === 'invalid' && (
            <div className="space-y-4 text-center">
              <ShieldAlert className="h-10 w-10 mx-auto text-destructive" aria-hidden="true" />
              <p className="text-sm text-muted-foreground font-inter">
                Reset links can only be used once and expire after a short time. Request a new one to continue.
              </p>
              <Button className="w-full" onClick={() => navigate('/auth')}>Request a new link</Button>
            </div>
          )}

          {status === 'done' && (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="h-10 w-10 mx-auto text-primary" aria-hidden="true" />
              <Button className="w-full" onClick={() => navigate('/')}>Continue to the app</Button>
            </div>
          )}

          {status === 'ready' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="font-inter">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="font-inter"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="font-inter">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  className="font-inter"
                />
              </div>
              <Button type="submit" className="w-full transition-divine" disabled={loading}>
                <KeyRound className="h-4 w-4 mr-2" aria-hidden="true" />
                {loading ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
