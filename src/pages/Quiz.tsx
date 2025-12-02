import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { CheckCircle, XCircle, ArrowLeft, Trophy, BookOpen, RotateCcw, Mail, Play, Headphones, ExternalLink } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
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

interface QuizPageProps {
  onBack?: () => void
}

export default function Quiz({ onBack }: QuizPageProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [quizStarted, setQuizStarted] = useState(false)
  const [email, setEmail] = useState('')
  const [submittingEmail, setSubmittingEmail] = useState(false)

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
      const shuffled = formattedQuestions.sort(() => Math.random() - 0.5)
      setQuestions(shuffled)
    } catch (error) {
      console.error('Error fetching questions:', error)
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
      calculateScore()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const calculateScore = () => {
    let correctAnswers = 0
    for (const question of questions) {
      const selectedAnswer = selectedAnswers[question.id]
      if (selectedAnswer === question.correct_answer) {
        correctAnswers++
      }
    }
    setScore(correctAnswers)
    setShowResults(true)
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setShowResults(false)
    setScore(0)
    setQuizStarted(false)
  }

  const handleStartQuiz = async () => {
    const trimmedEmail = email.trim()
    
    // If email is provided, validate and save it
    if (trimmedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmedEmail)) {
        toast.error('Please enter a valid email address')
        return
      }

      setSubmittingEmail(true)
      try {
        const { error } = await supabase
          .from('quiz_entries')
          .insert({ email: trimmedEmail.toLowerCase() })

        if (error) throw error
      } catch (error) {
        console.error('Error saving email:', error)
        // Don't block quiz start if email save fails
      } finally {
        setSubmittingEmail(false)
      }
    }
    
    setQuizStarted(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8 space-y-4">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">No Quiz Available</h2>
            <p className="text-muted-foreground">Quiz questions are being prepared. Please check back later!</p>
            {onBack && (
              <Button onClick={onBack} variant="outline" className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Welcome screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroLightEmbassy})` }}
        />
        <div className="fixed inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-primary/40" />
        
        <Card className="relative z-10 w-full max-w-lg bg-card/95 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-8 text-center space-y-6">
            {onBack && (
              <Button 
                onClick={onBack} 
                variant="ghost" 
                size="sm"
                className="absolute top-4 left-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Bible Knowledge Quiz</h1>
              <p className="text-muted-foreground">
                Test your knowledge of Scripture with {questions.length} questions about the Bible
              </p>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{questions.length}</strong> Questions
              </p>
              <p className="text-sm text-muted-foreground">
                No time limit • Learn as you go
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter email to win a prize (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleStartQuiz()}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Enter your email to be eligible for prizes and updates
              </p>
            </div>
            
            <Button 
              onClick={handleStartQuiz}
              size="lg"
              className="w-full"
              disabled={submittingEmail}
            >
              {submittingEmail ? 'Starting...' : 'Start Quiz'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  // Results screen
  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100)
    
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroLightEmbassy})` }}
        />
        <div className="fixed inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-primary/40" />
        
        <Card className="relative z-10 w-full max-w-2xl bg-card/95 backdrop-blur-sm border-0 shadow-xl max-h-[90vh] overflow-y-auto">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">
                Quiz Complete!
              </h2>
              <div className="space-y-1">
                <p className="text-4xl font-bold text-primary">{percentage}%</p>
                <p className="text-lg text-muted-foreground">
                  You scored {score} out of {questions.length} questions correctly
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-center">Your Results:</h3>
              <div className="space-y-2">
                {questions.map((question, index) => {
                  const selectedAnswer = selectedAnswers[question.id]
                  const isCorrect = selectedAnswer === question.correct_answer
                  
                  return (
                    <div key={question.id} className="p-4 bg-background/50 rounded-lg space-y-3">
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">Q{index + 1}: {question.question}</p>
                          {!isCorrect && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Correct answer: {question.options[question.correct_answer]}
                            </p>
                          )}
                        </div>
                      </div>
                      {question.podcast_url && question.podcast_title && (
                        <a 
                          href={question.podcast_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 ml-8 px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors group"
                        >
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="w-3 h-3 text-primary-foreground ml-0.5" fill="currentColor" />
                          </div>
                          <span className="text-xs font-medium text-primary group-hover:underline truncate">
                            {question.podcast_title}
                          </span>
                          <ExternalLink className="w-3 h-3 text-primary/60 flex-shrink-0" />
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleRestart}
                variant="outline"
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              {onBack && (
                <Button 
                  onClick={onBack}
                  className="flex-1"
                >
                  Back to Home
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Quiz questions screen
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroLightEmbassy})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-primary/40" />
      
      <Card className="relative z-10 w-full max-w-2xl bg-card/95 backdrop-blur-sm border-0 shadow-xl">
        {onBack && (
          <Button 
            onClick={onBack} 
            variant="ghost" 
            size="sm"
            className="absolute top-4 left-4 z-10"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Exit
          </Button>
        )}
        
        <CardHeader className="text-center space-y-4 pt-12">
          <div className="space-y-2">
            <CardTitle className="text-2xl text-foreground">
              Bible Knowledge Quiz
            </CardTitle>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        
        <CardContent className="space-y-6 pb-8">
          {/* Podcast Episode Link */}
          {currentQuestion.podcast_title && currentQuestion.podcast_url && (
            <a 
              href={currentQuestion.podcast_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-sacred-gold/20 rounded-xl border-2 border-sacred-gold/40 hover:bg-sacred-gold/30 transition-all group"
            >
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground/70 font-medium flex items-center gap-1">
                  <Headphones className="w-3 h-3" /> Based on podcast episode:
                </p>
                <p className="text-sm font-bold text-primary group-hover:underline truncate">
                  {currentQuestion.podcast_title}
                </p>
              </div>
              <ExternalLink className="w-5 h-5 text-primary flex-shrink-0" />
            </a>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center px-4">
              {currentQuestion.question}
            </h3>
            
            <RadioGroup
              value={selectedAnswers[currentQuestion.id]?.toString() || ''}
              onValueChange={(value) => handleAnswerSelect(currentQuestion.id, parseInt(value))}
            >
              {currentQuestion.options.map((option, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion.id] === undefined}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
