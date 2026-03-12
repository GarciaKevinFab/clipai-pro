import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, helperText, className = '', id, ...rest },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-300 font-[var(--font-heading)]"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`
          w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-gray-500
          bg-[var(--surface)] border transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[var(--bg)]
          ${
            error
              ? 'border-red-500 focus:ring-red-500/50'
              : 'border-[var(--border)] focus:border-[var(--accent)] focus:ring-[var(--accent)]/50'
          }
          ${className}
        `}
        {...rest}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  )
})

export default Input
