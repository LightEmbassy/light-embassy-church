import { Link } from "react-router-dom"
import { ArrowLeft, Footprints, Compass, HeartHandshake, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const sections = [
  {
    icon: Compass,
    title: "What it means to be godly",
    body: "Godliness is not perfection or religious performance. In Scripture it describes a life shaped by reverence for God — a heart that keeps returning to Him in ordinary days, ordinary work and ordinary decisions. Paul tells Timothy to \"train yourself for godliness\" (1 Timothy 4:7), language borrowed from athletics: it is formed through repeated, deliberate practice rather than a single moment of resolve. Godly living shows up in how you speak to your family, how you handle money, how you treat people who can do nothing for you, and how quickly you forgive.",
  },
  {
    icon: Footprints,
    title: "God's ordered steps for your life",
    body: "\"The steps of a good man are ordered by the LORD, and he delighteth in his way\" (Psalm 37:23). Ordered steps do not mean a life without detours; they mean a life that is being led. God orders steps — one at a time — rather than handing over the whole map. That is why direction usually arrives as a next obedience rather than a finished plan. Proverbs 16:9 holds the tension honestly: we plan, and the Lord establishes. Faithfulness in the step you can see is what qualifies you for the one you cannot.",
  },
  {
    icon: HeartHandshake,
    title: "The fear of the Lord, rightly understood",
    body: "The biblical fear of God is not terror of punishment; it is awe that reorders your priorities. It is the settled awareness that God is real, present and good, which makes His opinion weigh more than the crowd's. Proverbs calls it the beginning of wisdom because everything else lines up once God is in His right place. Practically, it looks like integrity when no one is watching, honesty when a lie would be easier, and generosity when you could quietly keep it all.",
  },
  {
    icon: BookOpen,
    title: "Finding your purpose without striving",
    body: "Purpose in Scripture is less about discovering a hidden assignment and more about becoming the kind of person God can trust with one. Ephesians 2:10 says we are God's workmanship, created for good works He prepared in advance. Start with what is already in your hands: your character, your local church, the people nearest to you, the skill you already have. Purpose is usually revealed in motion, not in waiting.",
  },
]

const practices = [
  "Read one short passage daily and write a single sentence on how it applies to today.",
  "Pray about the next decision in front of you rather than the whole five-year plan.",
  "Choose one relationship this week to serve without being asked.",
  "Review your calendar and money monthly — they show what you actually value.",
  "Stay connected to a community that can tell you the truth kindly.",
]

export default function GodlyLiving() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link to="/chat" aria-label="Back to Chat section">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Learn
          </Link>
        </Button>

        <header className="mb-10">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Bible Study · Purpose</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            Godly Living and Purpose: Walking in God&apos;s Ordered Steps
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            A plain-language guide to what godliness actually means, how God orders the steps of those
            who follow Him, why the fear of the Lord is the beginning of wisdom, and how purpose is
            discovered through obedience rather than anxious searching. Written for anyone who wants
            their everyday life — work, family, money and relationships — to reflect their faith.
          </p>
        </header>

        <div className="space-y-6">
          {sections.map((section) => (
            <Card key={section.title} className="border-border/60">
              <CardContent className="p-6">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <section.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                </div>
                <p className="text-base leading-relaxed text-muted-foreground">{section.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-foreground">Five practices for the week ahead</h2>
          <ul className="mt-4 space-y-3">
            {practices.map((practice) => (
              <li key={practice} className="flex gap-3 text-base leading-relaxed text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {practice}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-xl bg-muted/50 p-6">
          <h2 className="text-lg font-semibold text-foreground">Keep going</h2>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Join the conversation on purpose and Bible study with the Light Embassy community, or listen
            to teaching on the podcast.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/chat">Discuss in the community</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/podcast">Listen to the podcast</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
