const variantClasses = {
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  warning: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  error: 'bg-red-500/15 text-red-400 border-red-500/20',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  pending: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
}

export default function Badge({ variant = 'info', children, className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border
        ${variantClasses[variant] || variantClasses.info}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
