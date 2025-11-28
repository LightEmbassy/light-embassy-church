import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  Shield, 
  Calendar,
  Search,
  MoreHorizontal,
  UserCheck
} from "lucide-react"
import { Tables } from "@/integrations/supabase/types"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Profile = Tables<"profiles">
type UserRole = 'user' | 'counsellor' | 'staff' | 'moderator' | 'admin'

interface ProfileWithRole extends Profile {
  role?: UserRole
}

export function UserManagement() {
  const { toast } = useToast()
  const [profiles, setProfiles] = useState<ProfileWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (profilesError) throw profilesError

      // Fetch roles for each profile
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")

      if (rolesError) throw rolesError

      // Merge profiles with roles
      const profilesWithRoles = (profilesData || []).map(profile => {
        const userRole = rolesData?.find(r => r.user_id === profile.user_id)
        return {
          ...profile,
          role: (userRole?.role as UserRole) || 'user'
        }
      })

      setProfiles(profilesWithRoles)
    } catch (error) {
      console.error("Error fetching profiles:", error)
      toast({
        title: "Error",
        description: "Failed to load user profiles.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      // Delete existing role
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)

      // Insert new role
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: newRole })

      if (error) throw error

      setProfiles(prev =>
        prev.map(profile =>
          profile.user_id === userId
            ? { ...profile, role: newRole }
            : profile
        )
      )

      toast({
        title: "Role updated",
        description: "User role has been successfully updated."
      })
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role. You may not have permission.",
        variant: "destructive"
      })
    }
  }

  const getRoleColor = (role?: UserRole) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-800",
      moderator: "bg-orange-100 text-orange-800",
      staff: "bg-blue-100 text-blue-800",
      counsellor: "bg-purple-100 text-purple-800",
      user: "bg-gray-100 text-gray-800"
    }
    return colors[role || 'user'] || colors.user
  }

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || profile.role === roleFilter
    return matchesSearch && matchesRole
  })

  const roleStats = {
    total: profiles.length,
    admin: profiles.filter(p => p.role === "admin").length,
    moderator: profiles.filter(p => p.role === "moderator").length,
    staff: profiles.filter(p => p.role === "staff").length,
    counsellor: profiles.filter(p => p.role === "counsellor").length,
    user: profiles.filter(p => p.role === "user").length
  }

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-2xl font-semibold text-foreground">
            User Management
          </h2>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="text-xl font-bold">{roleStats.total}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-6 w-6 mx-auto mb-2 text-red-600" />
            <p className="text-xl font-bold">{roleStats.admin}</p>
            <p className="text-xs text-muted-foreground">Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserCheck className="h-6 w-6 mx-auto mb-2 text-orange-600" />
            <p className="text-xl font-bold">{roleStats.moderator}</p>
            <p className="text-xs text-muted-foreground">Moderators</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="text-xl font-bold">{roleStats.staff}</p>
            <p className="text-xs text-muted-foreground">Staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserCheck className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <p className="text-xl font-bold">{roleStats.counsellor}</p>
            <p className="text-xs text-muted-foreground">Counsellors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-gray-600" />
            <p className="text-xl font-bold">{roleStats.user}</p>
            <p className="text-xs text-muted-foreground">Regular Users</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="counsellor">Counsellor</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User List */}
      <div className="space-y-4">
        {filteredProfiles.map((profile) => (
          <Card key={profile.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <Users className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {profile.username}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Joined {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="secondary"
                    className={`capitalize ${getRoleColor(profile.role)}`}
                  >
                    {profile.role || 'user'}
                  </Badge>
                  
                  {profile.quiz_completed && (
                    <Badge variant="outline" className="text-green-600">
                      Quiz Completed
                    </Badge>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(profile.user_id, "admin")}
                        disabled={profile.role === "admin"}
                      >
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(profile.user_id, "moderator")}
                        disabled={profile.role === "moderator"}
                      >
                        Make Moderator
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(profile.user_id, "staff")}
                        disabled={profile.role === "staff"}
                      >
                        Make Staff
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(profile.user_id, "counsellor")}
                        disabled={profile.role === "counsellor"}
                      >
                        Make Counsellor
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(profile.user_id, "user")}
                        disabled={profile.role === "user"}
                      >
                        Make Regular User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredProfiles.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No users found</h3>
              <p className="text-muted-foreground">
                No users match your current search and filter criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
