'use client'

import { forwardRef } from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const DatePicker = forwardRef(({
  label,
  error,
  helperText,
  fullWidth = true,
  className,
  containerClassName,
  required,
  disabled,
  min,
  max,
  ...props
}, ref) => {
  const hasError = !!error

  return (
    <div className={cn('w-full', !fullWidth && 'max-w-sm', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Calendar className="h-5 w-5" />
        </div>
        
        <input
          ref={ref}
          type="date"
          disabled={disabled}
          min={min}
          max={max}
          className={cn(
            'block w-full rounded-lg border transition-colors duration-200',
            'px-4 py-2.5 pl-10 text-base sm:text-sm',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            hasError 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
            disabled && 'bg-gray-50 cursor-not-allowed',
            className
          )}
          {...props}
        />
      </div>
      
      {(error || helperText) && (
        <p className={cn(
          'mt-1.5 text-sm',
          hasError ? 'text-red-600' : 'text-gray-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

DatePicker.displayName = 'DatePicker'

export default DatePicker