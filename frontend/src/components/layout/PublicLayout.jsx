import { Link, NavLink, Outlet } from 'react-router-dom'
import Button from '../ui/Button'

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/pricing', label: 'Precios' },
  { to: '/blog', label: 'Blog' },
]

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 md:px-8 bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)]">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent font-[family-name:var(--font-heading)]"
        >
          ClipAI Pro
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive
                    ? 'text-white font-medium'
                    : 'text-gray-400 hover:text-gray-200'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* CTA */}
        <Link to="/signup">
          <Button size="sm">Empezar gratis</Button>
        </Link>
      </nav>

      {/* Content */}
      <Outlet />
    </div>
  )
}
