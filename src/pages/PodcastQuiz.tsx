import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle, XCircle, Headphones, Trophy, RotateCcw } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { Confetti } from "@/components/quiz/Confetti"
import quizBg from "@/assets/quiz-bg.jpg"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  podcast_url?: string
  podcast_title?: string
}

interface PodcastQuizProps {
  onBack?: () => void
}

const PodcastQuiz = ({ onBack }: PodcastQuizProps) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [correctMap, setCorrectMap] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [quizStarted, setQuizStarted] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions_public')
        .select('id, question, options, podcast_url, podcast_title, order_number')
        .order('order_number')

      if (error) throw error

      if (data) {
        // Parse options and shuffle questions
        const parsedQuestions = data.map(q => ({
          ...q,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        }))
        
        // Shuffle and pick 10 questions
        const shuffled = parsedQuestions.sort(() => Math.random() - 0.5)
        setQuestions(shuffled.slice(0, 10))
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: answerIndex
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      calculateScore()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const calculateScore = async () => {
    try {
      const responses = questions.map((q, idx) => ({
        question_id: q.id,
        selected_answer: selectedAnswers[idx],
      }))
      const { data, error } = await supabase.functions.invoke('grade-quiz', {
        body: { responses, save: false, quiz_type: 'podcast' },
      })
      if (error) throw error
      const map: Record<string, number> = {}
      for (const r of data.results) map[r.question_id] = r.correct_answer
      setCorrectMap(map)
      setScore(data.score)
    } catch (e) {
      console.error('Error grading quiz:', e)
    } finally {
      setShowResults(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setSelectedAnswers({})
    setShowResults(false)
    setScore(0)
    setQuizStarted(false)
    fetchQuestions()
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quiz questions...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-4">
        <div className="px-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div className="text-center py-12">
            <p className="text-muted-foreground">No quiz questions available.</p>
          </div>
        </div>
      </div>
    )
  }

  // Welcome Screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-4">
        <div className="px-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          <Card className="overflow-hidden border-0 shadow-divine">
            <div className="relative h-48">
              <img 
                src={quizBg} 
                alt="Podcast Quiz" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h1 className="font-playfair text-3xl font-bold mb-2">Podcast Quiz</h1>
                <p className="text-white/80">Test your knowledge from our podcast episodes!</p>
              </div>
            </div>
            
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                  <Headphones className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">Based on Podcast Episodes</h3>
                    <p className="text-sm text-muted-foreground">Questions drawn from Light Embassy Church teachings</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">10</p>
                    <p className="text-sm text-muted-foreground">Questions</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">~5 min</p>
                    <p className="text-sm text-muted-foreground">Duration</p>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
                onClick={handleStartQuiz}
              >
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Results Screen
  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100)
    const isHighScore = percentage >= 70
    
    return (
      <div className="min-h-screen bg-background pb-20 pt-4">
        {isHighScore && <Confetti />}
        <div className="px-4 space-y-6">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          <Card className="border-0 shadow-divine">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4">
                <Trophy className={`h-16 w-16 ${percentage >= 70 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
              </div>
              <CardTitle className="font-playfair text-2xl">Quiz Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-primary mb-2">{score}/{questions.length}</p>
                <p className="text-lg text-muted-foreground">{percentage}% Correct</p>
                <p className="mt-2 text-foreground">
                  {percentage >= 80 ? "Excellent! You really know your stuff!" :
                   percentage >= 60 ? "Good job! Keep listening to learn more!" :
                   "Keep listening to our podcasts to improve!"}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Your Answers:</h3>
                {questions.map((question, index) => {
                  const correctAnswer = correctMap[question.id]
                  const isCorrect = selectedAnswers[index] === correctAnswer
                  return (
                    <div key={question.id} className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2">{question.question}</p>
                          {!isCorrect && correctAnswer !== undefined && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Correct: {question.options[correctAnswer]}
                            </p>
                          )}
                          {question.podcast_url && (
                            <a 
                              href={question.podcast_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                            >
                              <Headphones className="h-3 w-3" />
                              Listen: {question.podcast_title || 'Podcast Episode'}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleRestart}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                {onBack && (
                  <Button 
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={onBack}
                  >
                    Done
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Quiz Questions Screen
  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-background pb-20 pt-4">
      <div className="px-4 space-y-6">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="border-0 shadow-divine">
          <CardContent className="p-6 space-y-6">
            {question.podcast_title && (
              <div className="flex items-center gap-2 text-sm text-primary bg-primary/5 p-3 rounded-lg">
                <Headphones className="h-4 w-4" />
                <span>From: {question.podcast_title}</span>
              </div>
            )}
            
            <h2 className="font-playfair text-xl font-semibold text-foreground leading-relaxed">
              {question.question}
            </h2>

            <RadioGroup 
              value={selectedAnswers[currentQuestion]?.toString()} 
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
              className="space-y-3"
            >
              {question.options.map((option, index) => (
                <div 
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer
                    ${selectedAnswers[currentQuestion] === index 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer text-foreground"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex-1"
              >
                Previous
              </Button>
              <Button 
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestion] === undefined}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PodcastQuiz
