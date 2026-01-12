'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'

export default function SearchBar({
  placeholder = 'Cari...',
  onSearch,
  delay = 500,
  className,
  defaultValue = '',
}) {
  const [searchTerm, setSearchTerm] = useState(defaultValue)
  const debouncedSearch = useDebounce(searchTerm, delay)

  useEffect(() => {
    onSearch(debouncedSearch)
  }, [debouncedSearch, onSearch])

  const handleClear = () => {
    setSearchTerm('')
  }

  return (
    <div className={cn('relative w-full max-w-md', className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'block w-full pl-10 pr-10 py-2.5 text-base sm:text-sm',
          'border border-gray-300 rounded-lg',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-all duration-200'
        )}
      />

      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}