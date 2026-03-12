import { Loader2 } from 'lucide-react'

const variants = {
  primary:
    'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20',
  secondary:
    'bg-[var(--card)] hover:bg-[var(--card)]/80 text-gray-300 border border-[var(--border)]',
  outline:
    'bg-transparent hover:bg-white/5 text-gray-300 border border-[var(--border)]',
  ghost: 'bg-transparent hover:bg-white/5 text-gray-300',
  danger:
    'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-lg gap-2.5',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  loading = false,
  ...rest
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:ring-offset-1 focus:ring-offset-[var(--bg)]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}
