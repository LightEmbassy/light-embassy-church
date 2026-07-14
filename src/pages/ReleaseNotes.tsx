import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Sparkles, Shield, Smartphone, Video, Zap, Users, BookOpen, Radio, MessageSquare, FileText } from "lucide-react"
import { Link } from "react-router-dom"

interface ReleaseItem {
  title: string
  description: string
  icon: React.ReactNode
  badge?: string
}

interface Release {
  version: string
  date: string
  highlights: string[]
  items: ReleaseItem[]
}

const releases: Release[] = [
  {
    version: "2.0",
    date: "July 2026",
    highlights: [
      "Native iOS & Android apps ready",
      "Secure quiz grading on the backend",
      "Privacy policy & one-tap data erasure",
      "Realtime messaging with scoped policies",
    ],
    items: [
      {
        title: "Mobile Apps",
        description:
          "The app is now Capacitor-ready for iOS and Android. Push notifications, camera sharing, native share sheets, and local notifications are integrated.",
        icon: <Smartphone className="h-5 w-5" />,
        badge: "New",
      },
      {
        title: "Onboarding Intro Video",
        description:
          "A cinematic welcome video now greets first-time users, highlighting Watch, Learn, Prayers, and Community.",
        icon: <Video className="h-5 w-5" />,
        badge: "New",
      },
      {
        title: "Welcome Screen",
        description:
          "A colourful first-time welcome screen guides new users on what to do first. Users can revisit it anytime from Settings.",
        icon: <Sparkles className="h-5 w-5" />,
      },
      {
        title: "Spiritual Journey Tracker",
        description:
          "Track your streaks, milestones, media history, and achievements. A fun progress banner keeps engagement visible on the home screen.",
        icon: <Zap className="h-5 w-5" />,
        badge: "New",
      },
      {
        title: "Privacy Policy & Data Erasure",
        description:
          "A comprehensive Play Store & App Store compliant privacy policy is now live, plus an in-app 'Erase My Data' option and a public deletion page.",
        icon: <Shield className="h-5 w-5" />,
      },
      {
        title: "Secure Quiz Grading",
        description:
          "Quiz answers are now graded by a secure edge function instead of the client, keeping correct answers hidden from users.",
        icon: <BookOpen className="h-5 w-5" />,
        badge: "Security",
      },
      {
        title: "Scoped Realtime Messaging",
        description:
          "Realtime message delivery now respects row-level security, so users only receive messages from their own conversations.",
        icon: <MessageSquare className="h-5 w-5" />,
        badge: "Security",
      },
      {
        title: "SEO & Discovery",
        description:
          "Added sitemap, robots.txt, llms.txt, JSON-LD structured data, Open Graph image, and canonical tags for better search and AI discovery.",
        icon: <Radio className="h-5 w-5" />,
      },
      {
        title: "Get the App Banner",
        description:
          "Mobile web visitors now see a smart banner prompting them to install the native iOS or Android app.",
        icon: <Users className="h-5 w-5" />,
      },
    ],
  },
  {
    version: "1.0",
    date: "Earlier",
    highlights: ["Foundation of Light Embassy web app"],
    items: [
      {
        title: "Foundation Release",
        description:
          "Initial web app with home, watch, podcast, learn, prayers, community forum, live radio, and messaging.",
        icon: <Sparkles className="h-5 w-5" />,
      },
    ],
  },
]

export default function ReleaseNotes() {
  return (
    <div className="min-h-screen bg-background pb-20 pt-16">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-4 gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <div className="text-center mb-10">
          <h1 className="font-playfair text-4xl font-bold mb-4 text-primary">
            Release Notes
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See what is new in Light Embassy and what is coming next for our
            community.
          </p>
        </div>

        <div className="space-y-10">
          {releases.map((release) => (
            <section key={release.version}>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="font-playfair text-3xl font-bold text-foreground">
                  Version {release.version}
                </h2>
                <span className="text-sm text-muted-foreground">{release.date}</span>
              </div>

              <Card className="mb-6 border-primary/10 shadow-gentle">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">Highlights</h3>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {release.highlights.map((highlight, idx) => (
                      <li key={idx}>{highlight}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                {release.items.map((item, idx) => (
                  <Card
                    key={idx}
                    className="border-border/60 hover:border-primary/30 transition-colors"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">
                              {item.title}
                            </h4>
                            {item.badge && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
