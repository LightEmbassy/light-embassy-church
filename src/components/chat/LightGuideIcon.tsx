import { cn } from "@/lib/utils"

interface LightGuideIconProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LightGuideIcon({ className, size = "md" }: LightGuideIconProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizeClasses[size], className)}
    >
      {/* Outer glow rays */}
      <path
        d="M12 2V4M12 20V22M4 12H2M6.31 6.31L4.9 4.9M17.69 6.31L19.1 4.9M6.31 17.69L4.9 19.1M17.69 17.69L19.1 19.1M22 12H20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="opacity-60"
      />
      {/* Inner light circle with gradient effect */}
      <circle
        cx="12"
        cy="12"
        r="5"
        fill="currentColor"
        className="opacity-20"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="currentColor"
        className="opacity-40"
      />
      <circle
        cx="12"
        cy="12"
        r="2.5"
        fill="currentColor"
      />
      {/* Guiding path/arrow pointing upward */}
      <path
        d="M12 7L14 10H10L12 7Z"
        fill="currentColor"
        className="opacity-90"
      />
    </svg>
  )
}
