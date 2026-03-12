import { Coins } from 'lucide-react'

export default function CreditDisplay({ credits = 0, className = '' }) {
  const isLow = credits < 20

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
        border transition-colors
        ${
          isLow
            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
            : 'bg-[var(--card)] text-gray-300 border-[var(--border)]'
        }
        ${className}
      `}
    >
      <Coins className={`w-4 h-4 ${isLow ? 'text-yellow-400' : 'text-gray-400'}`} />
      <span>{credits}</span>
    </div>
  )
}
