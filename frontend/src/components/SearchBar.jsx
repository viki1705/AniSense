import { useState, useRef } from 'react'
import { Search, Loader } from 'lucide-react'

// Debounce helper function
const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export default function SearchBar({ onSearch, placeholder = 'Search for anime...' }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const debouncedSearchRef = useRef(null)

  // Create debounced search function on mount
  if (!debouncedSearchRef.current) {
    debouncedSearchRef.current = debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')
      try {
        await onSearch(searchQuery)
      } catch (err) {
        setError(
          err.message || 'Search failed. Please try again.'
        )
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    }, 500)
  }

  const handleInputChange = (e) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    setError('')

    // Only trigger search if input is not empty
    if (newQuery.trim()) {
      debouncedSearchRef.current(newQuery)
    } else {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) {
      setError('Please enter a search query')
      return
    }

    setLoading(true)
    setError('')
    debouncedSearchRef.current(query)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder={placeholder}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-primary-700 text-white placeholder-secondary border border-accent-purple/20 focus:border-accent-cyan focus:outline-none transition disabled:opacity-50"
            />
            {loading && (
              <Loader className="absolute right-3 top-3 animate-spin text-accent-purple" size={20} />
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-accent-purple rounded-lg hover:bg-accent-cyan text-white font-semibold flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search size={20} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </form>
      {error && (
        <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
      )}
    </div>
  )
}
