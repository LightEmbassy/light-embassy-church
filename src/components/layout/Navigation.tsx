import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { User } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Navigation() {
  const { user, signOut } = useAuth()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-playfair text-xl font-bold text-foreground">
          Light Embassy
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-inter">{user.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="font-inter"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="font-inter">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}