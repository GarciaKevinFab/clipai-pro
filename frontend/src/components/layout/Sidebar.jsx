import { NavLink } from 'react-router-dom'
import {
  Home,
  Camera,
  Folder,
  Diamond,
  Link,
  Settings2,
  BookOpen,
  Gift,
  MessageCircle,
  X,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import CreditDisplay from '../ui/CreditDisplay'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

const creacionLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/create', label: 'Crear Video', icon: Camera },
  { to: '/videos', label: 'Mis Videos', icon: Folder, badge: true },
  { to: '/pricing', label: 'Precios', icon: Diamond },
]

const ajustesLinks = [
  { to: '/social-accounts', label: 'Redes Sociales', icon: Link },
  { to: '/settings', label: 'Mi Cuenta', icon: Settings2 },
]

const recursosLinks = [
  { to: '/blog', label: 'Blog', icon: BookOpen },
  { to: '/affiliates', label: 'Programa Afiliados', icon: Gift },
  { to: '/support', label: 'Soporte', icon: MessageCircle },
]

function SidebarSection({ title, links }) {
  return (
    <div className="mb-6">
      <p className="px-4 mb-2 text-[10px] font-semibold tracking-widest text-gray-500 uppercase">
        {title}
      </p>
      <nav className="flex flex-col gap-0.5">
        {links.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg mx-2 transition-colors ${
                isActive
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-medium'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`
            }
          >
            <Icon className="w-[18px] h-[18px] shrink-0" />
            <span className="flex-1">{label}</span>
            {badge && (
              <Badge variant="info" className="text-[10px]">
                Nuevo
              </Badge>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default function Sidebar({ isOpen, onClose }) {
  const user = useAuthStore((s) => s.user)
  const credits = user?.credits ?? 0
  const username = user?.username || user?.email?.split('@')[0] || 'user'
  const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${username}`

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[220px] flex flex-col
          bg-[var(--surface)] border-r border-[var(--border)]
          transition-transform duration-300 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--border)]">
          <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent font-[family-name:var(--font-heading)]">
            ClipAI Pro
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarSection title="Creacion" links={creacionLinks} />
          <SidebarSection title="Ajustes" links={ajustesLinks} />
          <SidebarSection title="Recursos" links={recursosLinks} />
        </div>

        {/* Footer - User */}
        <div className="p-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={avatarUrl}
              alt={username}
              className="w-9 h-9 rounded-full bg-[var(--card)] border border-[var(--border)]"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.first_name || username}
              </p>
              <CreditDisplay credits={credits} className="mt-1 text-xs py-0.5 px-2" />
            </div>
          </div>
          {credits < 20 && (
            <NavLink to="/pricing">
              <Button variant="primary" size="sm" className="w-full">
                Obtener creditos
              </Button>
            </NavLink>
          )}
        </div>
      </aside>
    </>
  )
}
