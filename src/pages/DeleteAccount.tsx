import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Trash2, ShieldAlert } from 'lucide-react'

export default function DeleteAccount() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [deleting, setDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleDelete = async () => {
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
        description: e.message ?? 'Please try again or email pete@lightembassy.org.',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="h-7 w-7 text-destructive" />
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold">
              Delete Your Account & Data
            </h1>
          </div>

          <p className="text-muted-foreground mb-4">
            You can permanently delete your Light Embassy account and all
            associated data at any time. This page satisfies Google Play and
            Apple App Store account-deletion requirements.
          </p>

          <h2 className="font-semibold mt-6 mb-2">What gets deleted</h2>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1 mb-4">
            <li>Your profile, email, and login credentials</li>
            <li>Prayer requests, messages, and conversations</li>
            <li>Quiz results, achievements, and media history</li>
            <li>Community posts, forum topics, and likes</li>
          </ul>

          <h2 className="font-semibold mt-6 mb-2">How to delete</h2>
          <p className="text-muted-foreground mb-4">
            <strong>In the app:</strong> Sign in, open Settings (top-right gear
            icon), then tap <em>Erase My Data</em>.
          </p>
          <p className="text-muted-foreground mb-6">
            <strong>Or right here:</strong> sign in below and confirm deletion.
            You can also email{' '}
            <a
              href="mailto:pete@lightembassy.org?subject=Account%20deletion%20request"
              className="text-primary underline"
            >
              pete@lightembassy.org
            </a>{' '}
            and we'll erase your account within 30 days.
          </p>

          {user ? (
            <div className="border border-destructive/30 rounded-lg p-4 bg-destructive/5">
              <p className="text-sm mb-3">
                Signed in as <strong>{user.email}</strong>. Type{' '}
                <code className="px-1 py-0.5 bg-muted rounded">DELETE</code> to
                confirm.
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full mb-3 px-3 py-2 border rounded-md bg-background"
                placeholder="Type DELETE"
              />
              <Button
                variant="destructive"
                disabled={deleting || confirmText !== 'DELETE'}
                onClick={handleDelete}
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting ? 'Erasing…' : 'Permanently delete my account'}
              </Button>
            </div>
          ) : (
            <Button asChild className="w-full">
              <Link to="/auth">Sign in to delete your account</Link>
            </Button>
          )}

          <p className="text-xs text-muted-foreground mt-6">
            Data retention: deletion is immediate. Backup copies are purged
            within 30 days. See our{' '}
            <Link to="/privacy" className="underline">
              Privacy Policy
            </Link>{' '}
            for details.
          </p>
        </Card>
      </div>
    </div>
  )
}
