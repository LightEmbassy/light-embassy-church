import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, Plus, Pencil, Trash2, Loader2, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  order_number: number
  podcast_url: string | null
  podcast_title: string | null
  created_at: string
}

interface QuizStats {
  total_questions: number
  total_responses: number
  total_completions: number
  correct_responses: number
  distinct_participants: number
}

const emptyForm = {
  question: "",
  options: ["", "", "", ""],
  correct_answer: 0,
  order_number: 1,
  podcast_url: "",
  podcast_title: "",
}

export function QuizManagement() {
  const { toast } = useToast()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [stats, setStats] = useState<QuizStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: qs, error: qErr }, { data: st }] = await Promise.all([
      supabase.rpc("admin_list_quiz_questions"),
      supabase.rpc("admin_quiz_stats"),
    ])

    if (qErr) {
      toast({
        title: "Could not load questions",
        description: qErr.message,
        variant: "destructive",
      })
    }

    setQuestions(
      ((qs as any[]) ?? []).map((q) => ({
        ...q,
        options: Array.isArray(q.options) ? (q.options as string[]) : [],
      })),
    )
    setStats(((st as any[]) ?? [])[0] ?? null)
    setLoading(false)
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditingId(null)
    setForm({
      ...emptyForm,
      order_number: questions.length ? Math.max(...questions.map((q) => q.order_number)) + 1 : 1,
    })
    setDialogOpen(true)
  }

  const openEdit = (q: QuizQuestion) => {
    setEditingId(q.id)
    setForm({
      question: q.question,
      options: [0, 1, 2, 3].map((i) => q.options[i] ?? ""),
      correct_answer: q.correct_answer,
      order_number: q.order_number,
      podcast_url: q.podcast_url ?? "",
      podcast_title: q.podcast_title ?? "",
    })
    setDialogOpen(true)
  }

  const save = async () => {
    const options = form.options.map((o) => o.trim()).filter(Boolean)
    if (!form.question.trim() || options.length < 2) {
      toast({
        title: "Missing details",
        description: "Add a question and at least two answer options.",
        variant: "destructive",
      })
      return
    }
    if (form.correct_answer >= options.length) {
      toast({
        title: "Pick a valid correct answer",
        description: "The correct answer must be one of the filled options.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    const payload = {
      question: form.question.trim(),
      options,
      correct_answer: form.correct_answer,
      order_number: form.order_number,
      podcast_url: form.podcast_url.trim() || null,
      podcast_title: form.podcast_title.trim() || null,
    }

    const { error } = editingId
      ? await supabase.from("quiz_questions").update(payload).eq("id", editingId)
      : await supabase.from("quiz_questions").insert(payload)

    setSaving(false)

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" })
      return
    }

    toast({ title: editingId ? "Question updated" : "Question added" })
    setDialogOpen(false)
    load()
  }

  const remove = async (q: QuizQuestion) => {
    if (!window.confirm(`Delete this question?\n\n"${q.question}"`)) return
    const { error } = await supabase.from("quiz_questions").delete().eq("id", q.id)
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" })
      return
    }
    toast({ title: "Question deleted" })
    load()
  }


  const accuracy =
    stats && stats.total_responses > 0
      ? Math.round((stats.correct_responses / stats.total_responses) * 100)
      : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-playfair text-2xl font-semibold text-foreground">Quiz Management</h2>
          <p className="text-muted-foreground">Manage quiz questions and track responses</p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Questions", value: stats?.total_questions ?? 0 },
          { label: "Answers Submitted", value: stats?.total_responses ?? 0 },
          { label: "Quizzes Completed", value: stats?.total_completions ?? 0 },
          { label: "Answer Accuracy", value: `${accuracy}%` },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{loading ? "—" : s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No questions yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first quiz question to get started.
            </p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <Card key={q.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">#{q.order_number}</Badge>
                      {q.podcast_title && (
                        <Badge variant="outline" className="max-w-[220px] truncate">
                          {q.podcast_title}
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium text-foreground">{q.question}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="icon" onClick={() => openEdit(q)} aria-label="Edit question">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => remove(q)} aria-label="Delete question">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, i) => (
                    <li
                      key={i}
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                        i === q.correct_answer
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {i === q.correct_answer && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                      <span className="truncate">{opt}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit question" : "Add question"}</DialogTitle>
            <DialogDescription>
              Fill in the question, its answer options, and mark the correct one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quiz-question">Question</Label>
              <Textarea
                id="quiz-question"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="What does the parable teach us?"
              />
            </div>

            <div className="space-y-2">
              <Label>Options (select the correct answer)</Label>
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct-answer"
                    className="h-4 w-4 accent-[hsl(var(--primary))]"
                    checked={form.correct_answer === i}
                    onChange={() => setForm({ ...form, correct_answer: i })}
                    aria-label={`Mark option ${i + 1} as correct`}
                  />
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const options = [...form.options]
                      options[i] = e.target.value
                      setForm({ ...form, options })
                    }}
                    placeholder={`Option ${i + 1}`}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="quiz-order">Order</Label>
                <Input
                  id="quiz-order"
                  type="number"
                  min={1}
                  value={form.order_number}
                  onChange={(e) => setForm({ ...form, order_number: Number(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiz-podcast-title">Podcast title (optional)</Label>
                <Input
                  id="quiz-podcast-title"
                  value={form.podcast_title}
                  onChange={(e) => setForm({ ...form, podcast_title: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quiz-podcast-url">Podcast URL (optional)</Label>
              <Input
                id="quiz-podcast-url"
                value={form.podcast_url}
                onChange={(e) => setForm({ ...form, podcast_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? "Save changes" : "Add question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
