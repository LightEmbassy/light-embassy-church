import { useEffect, useState } from 'react'
import { Play, BookOpen, Heart, MessageCircle, Sparkles, Headphones } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IntroVideoProps {
  onComplete: () => void
}

type Scene = {
  id: string
  duration: number
  render: () => JSX.Element
}

// Cinematic, reverent feature walkthrough — auto-advancing scenes.
// All motion is CSS-driven for smooth, video-like playback.
export function IntroVideo({ onComplete }: IntroVideoProps) {
  const [sceneIndex, setSceneIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  const scenes: Scene[] = [
    {
      id: 'open',
      duration: 4200,
      render: () => (
        <div className="flex flex-col items-center justify-center text-center px-6">
          <div className="relative mb-8 animate-iv-glow">
            <div className="absolute inset-0 -m-10 rounded-full bg-[hsl(var(--sacred-gold))]/30 blur-3xl" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(var(--sacred-gold))] to-[hsl(var(--secondary-dark))] flex items-center justify-center shadow-[0_0_60px_hsl(var(--sacred-gold)/0.6)]">
              <Sparkles className="w-12 h-12 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-white/70 text-sm tracking-[0.4em] uppercase mb-4 animate-iv-fade-up [animation-delay:300ms]">
            Welcome to
          </p>
          <h1 className="font-playfair text-5xl sm:text-6xl font-semibold text-white mb-6 animate-iv-fade-up [animation-delay:600ms]">
            Light Embassy
          </h1>
          <p className="font-playfair italic text-lg text-[hsl(var(--sacred-gold))] max-w-md animate-iv-fade-up [animation-delay:1100ms]">
            "Let your light shine before others"
          </p>
        </div>
      ),
    },
    {
      id: 'watch',
      duration: 3600,
      render: () => (
        <SceneFeature
          Icon={Play}
          eyebrow="Watch"
          title="Sermons & Teachings"
          body="Stream messages of hope, faith, and revelation — wherever you are."
          imageClass="from-rose-600/60 via-amber-500/40 to-[hsl(var(--primary))]"
        />
      ),
    },
    {
      id: 'learn',
      duration: 3600,
      render: () => (
        <SceneFeature
          Icon={BookOpen}
          eyebrow="Learn"
          title="Grow in the Word"
          body="Daily devotionals, study plans, and lessons to deepen your walk."
          imageClass="from-amber-500/50 via-orange-400/30 to-[hsl(var(--primary))]"
        />
      ),
    },
    {
      id: 'prayers',
      duration: 3600,
      render: () => (
        <SceneFeature
          Icon={Heart}
          eyebrow="Prayers"
          title="Carried in Prayer"
          body="Share your requests. Stand with others. Witness answered prayer."
          imageClass="from-pink-500/50 via-rose-400/40 to-[hsl(var(--primary))]"
        />
      ),
    },
    {
      id: 'community',
      duration: 3600,
      render: () => (
        <SceneFeature
          Icon={MessageCircle}
          eyebrow="Community"
          title="One Global Family"
          body="Message, listen, and gather with believers around the world."
          imageClass="from-cyan-500/40 via-blue-400/30 to-[hsl(var(--primary))]"
          secondaryIcon={Headphones}
        />
      ),
    },
    {
      id: 'close',
      duration: 3400,
      render: () => (
        <div className="flex flex-col items-center justify-center text-center px-6">
          <div className="relative mb-8">
            <div className="absolute inset-0 -m-12 rounded-full bg-[hsl(var(--sacred-gold))]/20 blur-3xl animate-iv-pulse" />
            <div className="relative w-20 h-20 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm animate-iv-fade-up">
              <Sparkles className="w-9 h-9 text-[hsl(var(--sacred-gold))]" strokeWidth={1.5} />
            </div>
          </div>
          <h2 className="font-playfair text-4xl sm:text-5xl font-semibold text-white mb-5 animate-iv-fade-up [animation-delay:300ms]">
            Your journey<br />begins here.
          </h2>
          <p className="text-white/75 text-base max-w-sm animate-iv-fade-up [animation-delay:700ms]">
            Step inside and explore everything Light Embassy has prepared for you.
          </p>
        </div>
      ),
    },
  ]

  const total = scenes.reduce((s, sc) => s + sc.duration, 0)

  // Advance scenes
  useEffect(() => {
    if (sceneIndex >= scenes.length) {
      onComplete()
      return
    }
    const t = setTimeout(() => setSceneIndex((i) => i + 1), scenes[sceneIndex].duration)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIndex])

  // Progress bar
  useEffect(() => {
    const start = Date.now()
    const elapsedBefore = scenes.slice(0, sceneIndex).reduce((s, sc) => s + sc.duration, 0)
    const id = setInterval(() => {
      const now = Date.now() - start + elapsedBefore
      setProgress(Math.min(100, (now / total) * 100))
    }, 50)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIndex])

  const current = scenes[Math.min(sceneIndex, scenes.length - 1)]

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-[hsl(var(--primary))]">
      {/* Cinematic atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270_55%_18%)] via-[hsl(var(--primary))] to-[hsl(270_60%_10%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--sacred-gold)/0.15),_transparent_60%)]" />

      {/* Slow drifting light particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[hsl(var(--sacred-gold))]/60 blur-[1px] animate-iv-drift"
            style={{
              width: `${2 + (i % 4)}px`,
              height: `${2 + (i % 4)}px`,
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${10 + (i % 5) * 2}s`,
              opacity: 0.4 + ((i % 3) * 0.2),
            }}
          />
        ))}
      </div>

      {/* Letterbox bars for cinematic framing */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-black z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-black z-10" />

      {/* Scene */}
      <div className="relative h-full w-full flex items-center justify-center">
        <div key={current.id} className="w-full animate-iv-scene-in">
          {current.render()}
        </div>
      </div>

      {/* Skip + progress */}
      <div className="absolute top-3 right-4 z-20">
        <button
          onClick={onComplete}
          className="text-white/70 hover:text-white text-xs tracking-[0.3em] uppercase transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 w-64">
        <div className="h-[2px] w-full bg-white/20 overflow-hidden rounded-full">
          <div
            className="h-full bg-[hsl(var(--sacred-gold))] transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex gap-1.5">
          {scenes.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'h-1 w-1 rounded-full transition-all',
                i <= sceneIndex ? 'bg-[hsl(var(--sacred-gold))]' : 'bg-white/30',
              )}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes iv-fade-up {
          from { opacity: 0; transform: translateY(16px); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes iv-scene-in {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes iv-glow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes iv-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes iv-drift {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          20%  { opacity: 0.7; }
          100% { transform: translateY(-120px) translateX(20px); opacity: 0; }
        }
        .animate-iv-fade-up { animation: iv-fade-up 900ms cubic-bezier(.22,.61,.36,1) both; }
        .animate-iv-scene-in { animation: iv-scene-in 1100ms cubic-bezier(.22,.61,.36,1) both; }
        .animate-iv-glow { animation: iv-glow 4s ease-in-out infinite; }
        .animate-iv-pulse { animation: iv-pulse 3s ease-in-out infinite; }
        .animate-iv-drift { animation: iv-drift linear infinite; }
      `}</style>
    </div>
  )
}

function SceneFeature({
  Icon,
  eyebrow,
  title,
  body,
  imageClass,
  secondaryIcon: Secondary,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  eyebrow: string
  title: string
  body: string
  imageClass: string
  secondaryIcon?: React.ComponentType<{ className?: string; strokeWidth?: number }>
}) {
  return (
    <div className="flex flex-col items-center text-center px-6">
      <div className="relative mb-10">
        <div className={cn('absolute inset-0 -m-16 rounded-full blur-3xl bg-gradient-to-br', imageClass)} />
        <div className="relative w-28 h-28 rounded-3xl border border-white/15 bg-white/5 backdrop-blur-md flex items-center justify-center shadow-[0_20px_80px_-20px_hsl(var(--sacred-gold)/0.5)] animate-iv-fade-up">
          <Icon className="w-12 h-12 text-white" strokeWidth={1.4} />
          {Secondary && (
            <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-2xl bg-[hsl(var(--sacred-gold))] flex items-center justify-center shadow-lg">
              <Secondary className="w-5 h-5 text-[hsl(var(--primary))]" strokeWidth={2} />
            </div>
          )}
        </div>
      </div>
      <p className="text-[hsl(var(--sacred-gold))] text-xs tracking-[0.5em] uppercase mb-4 animate-iv-fade-up [animation-delay:200ms]">
        {eyebrow}
      </p>
      <h2 className="font-playfair text-4xl sm:text-5xl font-semibold text-white mb-5 max-w-md leading-tight animate-iv-fade-up [animation-delay:450ms]">
        {title}
      </h2>
      <p className="text-white/75 text-base sm:text-lg max-w-sm animate-iv-fade-up [animation-delay:750ms]">
        {body}
      </p>
    </div>
  )
}
