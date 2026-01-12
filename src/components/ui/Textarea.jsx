'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Textarea = forwardRef(({
  label,
  error,
  helperText,
  fullWidth = true,
  className,
  containerClassName,
  required,
  disabled,
  rows = 4,
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
      
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={cn(
          'block w-full rounded-lg border transition-colors duration-200',
          'px-4 py-2.5 text-base sm:text-sm',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'resize-none',
          hasError 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
          disabled && 'bg-gray-50 cursor-not-allowed',
          className
        )}
        {...props}
      />
      
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

Textarea.displayName = 'Textarea'

export default Textarea