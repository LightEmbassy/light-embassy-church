import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, ExternalLink, Play, Headphones } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import heroLightEmbassy from '@/assets/hero-light-embassy.jpg'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  order_number: number
  podcast_url?: string
  podcast_title?: string
}

interface SignupQuizProps {
  onComplete: () => void
}

export function SignupQuiz({ onComplete }: SignupQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')

      if (error) throw error

      const formattedQuestions = data?.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string)
      })) || []

      // Shuffle questions randomly
      const shuffled = formattedQuestions.sort(() => Math.random() - 0.5).slice(0, 5)
      setQuestions(shuffled)
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast({
        title: "Error",
        description: "Failed to load quiz questions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      submitQuiz()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const submitQuiz = async () => {
    setSubmitting(true)
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('No user found')

      let correctAnswers = 0

      // Submit individual responses
      for (const question of questions) {
        const selectedAnswer = selectedAnswers[question.id]
        const isCorrect = selectedAnswer === question.correct_answer
        
        if (isCorrect) correctAnswers++

        await supabase
          .from('user_quiz_responses')
          .insert({
            user_id: user.id,
            question_id: question.id,
            selected_answer: selectedAnswer,
            is_correct: isCorrect
          })
      }

      // Submit completion record
      await supabase
        .from('user_quiz_completion')
        .insert({
          user_id: user.id,
          score: correctAnswers,
          total_questions: questions.length
        } as any)

      // Update profile to mark quiz as completed
      await supabase
        .from('profiles')
        .update({ quiz_completed: true })
        .eq('user_id', user.id)

      setScore(correctAnswers)
      setShowResults(true)

      toast({
        title: "Quiz Complete!",
        description: `You scored ${correctAnswers} out of ${questions.length}`
      })

    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast({
        title: "Error",
        description: "Failed to submit quiz responses",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleFinish = () => {
    onComplete()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground font-inter">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <p className="text-muted-foreground">No quiz questions available</p>
            <Button onClick={onComplete} className="mt-4">Continue</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroLightEmbassy})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-primary/40" />
      
      {/* Content */}
      <Card className="relative z-10 w-full max-w-2xl bg-white/95 backdrop-blur-sm border-0 shadow-divine">
        {showResults ? (
          <div className="p-8 text-center space-y-6">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-playfair text-3xl font-bold text-foreground">
                Welcome to Light Embassy!
              </h2>
              <p className="text-lg text-muted-foreground font-inter">
                You scored {score} out of {questions.length} questions correctly
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-playfair text-xl font-semibold">Your Results:</h3>
              <div className="space-y-2">
                {questions.map((question, index) => {
                  const selectedAnswer = selectedAnswers[question.id]
                  const isCorrect = selectedAnswer === question.correct_answer
                  
                  return (
                    <div key={question.id} className="flex items-center justify-between gap-3 p-3 bg-background/50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        )}
                        <span className="text-sm font-inter truncate">{question.podcast_title || `Question ${index + 1}`}</span>
                      </div>
                      {question.podcast_url && (
                        <a 
                          href={question.podcast_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-full text-xs text-primary font-inter transition-colors flex-shrink-0"
                        >
                          <Play className="w-3 h-3" fill="currentColor" />
                          Listen
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            
            <Button 
              onClick={handleFinish}
              size="lg"
              className="w-full transition-divine"
            >
              Continue to App
            </Button>
          </div>
        ) : (
          <>
            <CardHeader className="text-center space-y-4">
              <div className="space-y-2">
                <CardTitle className="font-playfair text-2xl text-foreground">
                  Welcome Quiz
                </CardTitle>
                <p className="text-muted-foreground font-inter">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
              <Progress value={progress} className="w-full" />
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Podcast Episode Source */}
              {currentQuestion.podcast_title && currentQuestion.podcast_url && (
                <a 
                  href={currentQuestion.podcast_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 hover:from-primary/20 hover:to-primary/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-inter flex items-center gap-1">
                        <Headphones className="w-3 h-3" /> Listen to the episode
                      </p>
                      <p className="text-sm font-semibold text-foreground font-inter group-hover:text-primary transition-colors">
                        {currentQuestion.podcast_title}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              )}
              
              <div className="space-y-4">
                <h3 className="font-playfair text-xl font-semibold text-center">
                  {currentQuestion.question}
                </h3>
                
                <RadioGroup
                  value={selectedAnswers[currentQuestion.id]?.toString() || ''}
                  onValueChange={(value) => handleAnswerSelect(currentQuestion.id, parseInt(value))}
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label 
                        htmlFor={`option-${index}`} 
                        className="flex-1 font-inter cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="font-inter"
                >
                  Previous
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={selectedAnswers[currentQuestion.id] === undefined || submitting}
                  className="font-inter transition-divine"
                >
                  {submitting ? 'Submitting...' : 
                   currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next'}
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}