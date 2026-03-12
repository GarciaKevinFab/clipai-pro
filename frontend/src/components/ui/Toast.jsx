import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useToastStore } from '../../hooks/useToast'

const typeConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    iconColor: 'text-emerald-400',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-500/10 border-red-500/30',
    iconColor: 'text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    iconColor: 'text-yellow-400',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500/10 border-blue-500/30',
    iconColor: 'text-blue-400',
  },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const config = typeConfig[toast.type] || typeConfig.info
        const Icon = config.icon

        return (
          <div
            key={toast.id}
            className={`
              flex items-start gap-3 px-4 py-3 rounded-lg border shadow-xl
              ${config.bg}
              animate-[slideIn_0.3s_ease-out]
            `}
          >
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.iconColor}`} />
            <p className="text-sm text-gray-200 flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 text-gray-500 hover:text-gray-300 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
