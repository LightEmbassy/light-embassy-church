import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type AppRole = Database['public']['Enums']['app_role']

export function useUserRole() {
  const { user, loading: authLoading } = useAuth()
  const [role, setRole] = useState<AppRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) {
          console.error('Error fetching user role:', error)
          setRole(null)
        } else {
          setRole(data?.role ?? null)
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
        setRole(null)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchUserRole()
    }
  }, [user, authLoading])

  const hasAdminAccess = role && ['admin', 'moderator', 'staff'].includes(role)
  const isAdmin = role === 'admin'

  return { role, loading: loading || authLoading, hasAdminAccess, isAdmin }
}
