'use client'

import { cn } from '@/lib/utils'
import { X, Info, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
}

export default function Alert({ 
  children,
  variant = 'info',
  title,
  onClose,
  className,
  ...props 
}) {
  const Icon = icons[variant]

  const variants = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  }

  const iconColors = {
    info: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        'animate-in fade-in slide-in-from-top-2 duration-300',
        variants[variant],
        className
      )}
      role="alert"
      {...props}
    >
      <div className="flex gap-3">
        <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconColors[variant])} />
        
        <div className="flex-1">
          {title && (
            <h3 className="font-semibold mb-1">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 ml-2 hover:opacity-70 transition-opacity"
            aria-label="Close alert"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}