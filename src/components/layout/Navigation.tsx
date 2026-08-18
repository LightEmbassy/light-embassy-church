import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Settings, Sparkles, LogIn, LogOut, User, Shield, Trash2, FileText } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useFirstTimeUser } from '@/hooks/useFirstTimeUser'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function Navigation() {
  const { resetWelcome } = useFirstTimeUser()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleShowWelcome = () => {
    resetWelcome()
    window.location.reload()
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const handleDeleteData = async () => {
    setDeleting(true)
    try {
      const { error } = await supabase.functions.invoke('delete-user-data')
      if (error) throw error
      toast({
        title: 'Account deleted',
        description: 'All your data has been permanently erased.',
      })
      await supabase.auth.signOut()
      navigate('/')
    } catch (e: any) {
      toast({
        title: 'Deletion failed',
        description: e.message ?? 'Please try again or contact support.',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link to="/" className="font-playfair text-lg sm:text-xl font-bold text-foreground">
          Light Embassy
        </Link>

        <div className="flex items-center gap-2">
          <AuthStatusBadge />

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
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/privacy" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                <span>Privacy Policy</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/release-notes" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                <span>Release Notes</span>
              </Link>
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
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setConfirmOpen(true)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Erase My Data</span>
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

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Erase all your data?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes your account and every piece of data we've
              collected — profile, prayers, messages, achievements, quiz results
              and history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteData}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Erasing…' : 'Yes, erase everything'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  )
}
