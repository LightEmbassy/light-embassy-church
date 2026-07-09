import { Link } from 'react-router-dom'
import { Settings, Sparkles, LogIn, LogOut, User, Shield } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useFirstTimeUser } from '@/hooks/useFirstTimeUser'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export function Navigation() {
  const { resetWelcome } = useFirstTimeUser()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleShowWelcome = () => {
    resetWelcome()
    window.location.reload()
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link to="/" className="font-playfair text-lg sm:text-xl font-bold text-foreground">
          Light Embassy
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleShowWelcome} className="cursor-pointer">
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Show Welcome Screen</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user ? (
              <>
                <DropdownMenuItem disabled className="text-muted-foreground">
                  <User className="mr-2 h-4 w-4" />
                  <span className="truncate">{user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={() => navigate('/auth')} className="cursor-pointer">
                <LogIn className="mr-2 h-4 w-4" />
                <span>Sign In</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}