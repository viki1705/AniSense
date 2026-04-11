import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

function SampleAnimeStep({ data, onNext, onBack }) {
  const [selected, setSelected] = useState(data.sampleAnime || [])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSkipWarning, setShowSkipWarning] = useState(false)

  const handleSearch = useCallback(async (term) => {
    setSearchTerm(term)
    if (!term || term.length < 2) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const response = await axios.get(
        `http://localhost:8000/api/users/search/autocomplete?q=${term}`
      )
      setSearchResults(response.data.results || [])
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleAnime = (anime) => {
    setSelected((prev) => {
      if (prev.some((a) => a.title === anime.title)) {
        return prev.filter((a) => a.title !== anime.title)
      }
      if (prev.length < 5) {
        return [...prev, anime]
      }
      return prev
    })
    setSearchTerm('')
    setSearchResults([])
  }

  const removeAnime = (title) => {
    setSelected((prev) => prev.filter((a) => a.title !== title))
  }

  const handleNext = () => {
    if (selected.length >= 3) {
      onNext({
        ...data,
        sampleAnime: selected,
      })
    }
  }

  const handleSkip = () => {
    if (selected.length === 0) {
      setShowSkipWarning(true)
    } else {
      onNext({
        ...data,
        sampleAnime: selected,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Box */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search anime you've watched... (type at least 2 characters)"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-primary-800 border border-primary-700 text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-accent-purple">
            ⏳
          </div>
        )}
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-primary-800 rounded-lg border border-primary-700 p-4 max-h-64 overflow-y-auto"
          >
            {searchResults.map((anime) => (
              <button
                key={anime.id || anime.title}
                onClick={() => toggleAnime(anime)}
                className="w-full text-left p-3 hover:bg-primary-700 rounded transition-colors border-b border-primary-700 last:border-0"
              >
                <div className="font-semibold text-white">{anime.title}</div>
                <div className="text-sm text-gray-400">{anime.genres}</div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Anime */}
      <div className="space-y-3">
        <div className="text-sm font-semibold text-gray-300">
          Selected: {selected.length}/5 (min: 3)
        </div>
        <div className="space-y-2">
          {selected.map((anime) => (
            <motion.div
              key={anime.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center justify-between bg-accent-purple/20 border border-accent-purple rounded-lg p-3"
            >
              <span className="text-white">{anime.title}</span>
              <button
                onClick={() => removeAnime(anime.title)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Warning Message */}
      {showSkipWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-300"
        >
          Please select at least 3 anime to continue, or skip this step.
        </motion.div>
      )}

      <div className="flex gap-4 justify-center pt-4">
        <button
          onClick={onBack}
          className="px-8 py-3 bg-primary-700 rounded-lg font-semibold hover:bg-primary-600 transition-all"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={selected.length < 3}
          className="px-8 py-3 bg-accent-purple rounded-lg font-semibold hover:bg-accent-purple/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default SampleAnimeStep
