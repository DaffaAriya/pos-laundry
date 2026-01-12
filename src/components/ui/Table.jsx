'use client'

import { cn } from '@/lib/utils'

export default function Table({ children, className, ...props }) {
  return (
    <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
          <table 
            className={cn('min-w-full divide-y divide-gray-200', className)} 
            {...props}
          >
            {children}
          </table>
        </div>
      </div>
    </div>
  )
}

export function TableHeader({ children, className }) {
  return (
    <thead className={cn('bg-gray-50', className)}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className }) {
  return (
    <tbody className={cn('bg-white divide-y divide-gray-200', className)}>
      {children}
    </tbody>
  )
}

export function TableRow({ children, className, clickable, ...props }) {
  return (
    <tr 
      className={cn(
        'transition-colors',
        clickable && 'hover:bg-gray-50 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TableHead({ children, className, ...props }) {
  return (
    <th
      className={cn(
        'px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableCell({ children, className, ...props }) {
  return (
    <td
      className={cn(
        'px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900',
        className
      )}
      {...props}
    >
      {children}
    </td>
  )
}

// Empty state for tables
export function TableEmpty({ message = 'Tidak ada data', colSpan = 5 }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center py-12">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <svg className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-sm">{message}</p>
        </div>
      </TableCell>
    </TableRow>
  )
}