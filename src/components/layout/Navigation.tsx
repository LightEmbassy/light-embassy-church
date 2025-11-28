import { Link } from 'react-router-dom'

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-playfair text-xl font-bold text-foreground">
          Light Embassy
        </Link>
      </div>
    </nav>
  )
}