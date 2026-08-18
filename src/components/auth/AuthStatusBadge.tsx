import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'

export function AuthStatusBadge() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const navigate = useNavigate()

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/auth')}
        className="gap-1.5 h-8"
      >
        <LogIn className="h-3.5 w-3.5" />
        Sign In
      </Button>
    )
  }

  const name = profile?.username || user.email?.split('@')[0] || 'Member'

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 pl-1 pr-3 py-1"
      aria-label={`Signed in as ${name}`}
    >
      <Avatar className="h-6 w-6">
        {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={`${name} profile photo`} />}
        <AvatarFallback className="text-[10px]">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="hidden sm:inline text-xs font-medium text-foreground max-w-[120px] truncate">
        {name}
      </span>
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
    </div>
  )
}
