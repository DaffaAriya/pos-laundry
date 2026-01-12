'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Radio = forwardRef(({
  label,
  error,
  className,
  disabled,
  ...props
}, ref) => {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          ref={ref}
          type="radio"
          disabled={disabled}
          className={cn(
            'h-4 w-4 border-gray-300',
            'text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0',
            'transition-colors duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
      </div>
      {label && (
        <div className="ml-3 text-sm">
          <label className={cn(
            'font-medium text-gray-700',
            disabled && 'opacity-50 cursor-not-allowed'
          )}>
            {label}
          </label>
          {error && (
            <p className="text-red-600 mt-1">{error}</p>
          )}
        </div>
      )}
    </div>
  )
})

Radio.displayName = 'Radio'

export default Radio