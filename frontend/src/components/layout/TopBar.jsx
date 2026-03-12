import { useState, useRef, useEffect } from 'react'
import { Menu, LogOut, Settings, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import CreditDisplay from '../ui/CreditDisplay'

export default function TopBar({ title, onMenuClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const credits = user?.credits ?? 0
  const username = user?.username || user?.email?.split('@')[0] || 'user'
  const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${username}`

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)]">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <h1 className="text-lg font-semibold text-white font-[family-name:var(--font-heading)]">
            {title}
          </h1>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <CreditDisplay credits={credits} />

        {/* Avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-full border border-[var(--border)] overflow-hidden hover:ring-2 hover:ring-[var(--accent)]/50 transition-all"
          >
            <img
              src={avatarUrl}
              alt={username}
              className="w-full h-full bg-[var(--card)]"
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[var(--card)] border border-[var(--border)] shadow-xl py-1 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-[var(--border)]">
                <p className="text-sm font-medium text-white truncate">
                  {user?.first_name || username}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  navigate('/settings')
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-white/5"
              >
                <Settings className="w-4 h-4" />
                Mi Cuenta
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-white/5"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
