import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  BellRing,
  Server,
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { isNative, platform } from "@/lib/native"

type CheckState = "pending" | "ok" | "warn" | "fail"

interface Check {
  id: string
  label: string
  icon: React.ReactNode
  state: CheckState
  detail: string
}

const stateMeta: Record<CheckState, { icon: React.ReactNode; badge: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { icon: <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />, badge: "Checking", variant: "secondary" },
  ok: { icon: <CheckCircle2 className="h-5 w-5 text-primary" />, badge: "Connected", variant: "default" },
  warn: { icon: <AlertTriangle className="h-5 w-5 text-muted-foreground" />, badge: "Not applicable", variant: "outline" },
  fail: { icon: <XCircle className="h-5 w-5 text-destructive" />, badge: "Problem", variant: "destructive" },
}

export default function FirebaseStatus() {
  const [checks, setChecks] = useState<Check[]>([])
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState<string | null>(null)

  const runChecks = useCallback(async () => {
    setRunning(true)

    const native = isNative()
    const plat = platform()

    const base: Check[] = [
      {
        id: "platform",
        label: "App runtime",
        icon: <Smartphone className="h-4 w-4" />,
        state: native ? "ok" : "warn",
        detail: native
          ? `Running natively on ${plat}. Firebase SDK is initialised by the native shell at startup.`
          : "Running in a web browser. Firebase Cloud Messaging only initialises inside the installed iOS/Android app.",
      },
      {
        id: "backend",
        label: "Firebase credentials (backend)",
        icon: <Server className="h-4 w-4" />,
        state: "pending",
        detail: "Verifying the service account can authenticate with Firebase…",
      },
      {
        id: "permission",
        label: "Notification permission",
        icon: <BellRing className="h-4 w-4" />,
        state: "pending",
        detail: "Checking device notification permission…",
      },
      {
        id: "token",
        label: "Device registration token",
        icon: <ShieldCheck className="h-4 w-4" />,
        state: "pending",
        detail: "Looking for a stored push token for this account…",
      },
    ]
    setChecks(base)

    const update = (id: string, patch: Partial<Check>) =>
      setChecks((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))

    // Backend Firebase credentials
    try {
      const { data, error } = await supabase.functions.invoke("firebase-status")
      if (error) throw error
      if (data?.credentialsAccepted) {
        update("backend", {
          state: "ok",
          detail: `Firebase project “${data.projectId}” authenticated successfully as ${data.serviceAccountEmail}.`,
        })
      } else if (data?.secretValid) {
        update("backend", {
          state: "fail",
          detail: `Service account found for “${data.projectId}” but Firebase rejected it: ${data.error ?? "unknown error"}.`,
        })
      } else {
        update("backend", {
          state: "fail",
          detail: data?.error ?? "Firebase service account is not configured.",
        })
      }
    } catch (e) {
      update("backend", {
        state: "fail",
        detail: `Could not reach the Firebase status check: ${e instanceof Error ? e.message : String(e)}`,
      })
    }

    // Notification permission
    if (!native) {
      update("permission", {
        state: "warn",
        detail: "Permissions can only be checked inside the installed mobile app.",
      })
    } else {
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications")
        const perm = await PushNotifications.checkPermissions()
        update("permission", {
          state: perm.receive === "granted" ? "ok" : "fail",
          detail:
            perm.receive === "granted"
              ? "Notifications are allowed on this device."
              : `Permission status is “${perm.receive}”. Enable notifications in your device settings.`,
        })
      } catch (e) {
        update("permission", {
          state: "fail",
          detail: `Permission check failed: ${e instanceof Error ? e.message : String(e)}`,
        })
      }
    }

    // Device token stored for this user
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        update("token", {
          state: "warn",
          detail: "Sign in to link this device to your account for personalised notifications.",
        })
      } else {
        const { data, error } = await supabase
          .from("device_tokens")
          .select("platform, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
        if (error) throw error
        if (data && data.length > 0) {
          update("token", {
            state: "ok",
            detail: `A ${data[0].platform} device token is registered for your account.`,
          })
        } else {
          update("token", {
            state: native ? "fail" : "warn",
            detail: native
              ? "No push token stored yet. Allow notifications and reopen the app."
              : "No token yet — tokens are created when you open the installed mobile app.",
          })
        }
      }
    } catch (e) {
      update("token", {
        state: "fail",
        detail: `Token lookup failed: ${e instanceof Error ? e.message : String(e)}`,
      })
    }

    setLastRun(new Date().toLocaleString())
    setRunning(false)
  }, [])

  useEffect(() => {
    runChecks()
  }, [runChecks])

  const failures = checks.filter((c) => c.state === "fail").length
  const pending = checks.some((c) => c.state === "pending")

  const summary = pending
    ? { title: "Running startup checks…", tone: "text-muted-foreground" }
    : failures === 0
      ? { title: "Firebase startup looks healthy", tone: "text-primary" }
      : { title: `${failures} issue${failures > 1 ? "s" : ""} found at startup`, tone: "text-destructive" }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>

      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Firebase Status</h1>
        <p className="mt-2 text-muted-foreground">
          A live diagnostic of whether the app can connect to Firebase Cloud Messaging when it starts up.
        </p>
      </header>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className={`text-xl ${summary.tone}`}>{summary.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {lastRun ? `Last checked ${lastRun}` : "Checking now…"}
          </p>
          <Button onClick={runChecks} disabled={running} size="sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${running ? "animate-spin" : ""}`} />
            Re-run checks
          </Button>
        </CardContent>
      </Card>

      <section aria-label="Startup checks" className="space-y-3">
        {checks.map((check) => (
          <Card key={check.id}>
            <CardContent className="flex items-start gap-4 p-4">
              <div className="mt-0.5">{stateMeta[check.state].icon}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground">{check.icon}</span>
                  <h2 className="font-semibold">{check.label}</h2>
                  <Badge variant={stateMeta[check.state].variant}>{stateMeta[check.state].badge}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{check.detail}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  )
}
