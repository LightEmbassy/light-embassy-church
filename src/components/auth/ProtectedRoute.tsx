
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'
import { SignupQuiz } from '@/components/quiz/SignupQuiz'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  const [showQuiz, setShowQuiz] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true })
      return
    }

    if (!authLoading && !profileLoading && user && profile) {
      // Show quiz if user hasn't completed it yet
      setShowQuiz(!profile.quiz_completed)
    }
  }, [user, profile, authLoading, profileLoading, navigate])

  const handleQuizComplete = () => {
    setShowQuiz(false)
  }

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground font-inter">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (showQuiz) {
    return <SignupQuiz onComplete={handleQuizComplete} />
  }

  return <>{children}</>
}
