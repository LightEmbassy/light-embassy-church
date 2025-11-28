import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export type UserRole = 'user' | 'counsellor' | 'staff' | 'moderator' | 'admin'

interface UserRoleData {
  role: UserRole | null
  loading: boolean
  hasRole: (role: UserRole) => boolean
  isStaff: () => boolean
  refetch: () => Promise<void>
}

export function useUserRole(): UserRoleData {
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchRole = async () => {
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
        .order('role', { ascending: false }) // Gets highest privilege role first
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching user role:', error)
      }

      setRole(data?.role as UserRole || 'user')
    } catch (error) {
      console.error('Error fetching user role:', error)
      setRole('user')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRole()
  }, [user])

  const hasRole = (checkRole: UserRole): boolean => {
    if (!role) return false
    const hierarchy: Record<UserRole, number> = {
      user: 0,
      counsellor: 1,
      staff: 2,
      moderator: 3,
      admin: 4
    }
    return hierarchy[role] >= hierarchy[checkRole]
  }

  const isStaff = (): boolean => {
    return role ? ['staff', 'counsellor', 'moderator', 'admin'].includes(role) : false
  }

  return { role, loading, hasRole, isStaff, refetch: fetchRole }
}
