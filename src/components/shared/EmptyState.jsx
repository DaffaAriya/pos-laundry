'use client'

import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

export default function EmptyState({
  icon: Icon,
  title = 'Tidak ada data',
  description,
  action,
  actionLabel,
  className,
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4',
      className
    )}>
      {Icon ? (
        <Icon className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 mb-4" />
      ) : (
        <svg
          className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      )}
      
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm sm:text-base text-gray-500 text-center max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && actionLabel && (
        <Button onClick={action} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}