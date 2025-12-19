import { useEffect, useState } from "react"

interface ConfettiPiece {
  id: number
  left: number
  delay: number
  duration: number
  color: string
  size: number
  rotation: number
}

const colors = [
  "hsl(var(--primary))",
  "#FFD700",
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F"
]

function playCelebrationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Play a sequence of ascending notes for a celebratory effect
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + index * 0.15)
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.15)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + index * 0.15 + 0.05)
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + index * 0.15 + 0.4)
      
      oscillator.start(audioContext.currentTime + index * 0.15)
      oscillator.stop(audioContext.currentTime + index * 0.15 + 0.5)
    })
  } catch (error) {
    console.log('Audio not supported:', error)
  }
}

export function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    // Play celebration sound
    playCelebrationSound()
    
    const confettiPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 8 + Math.random() * 8,
      rotation: Math.random() * 360
    }))
    setPieces(confettiPieces)

    // Clean up after animation
    const timer = setTimeout(() => {
      setPieces([])
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  if (pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            top: "-20px",
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            transform: `rotate(${piece.rotation}deg)`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
