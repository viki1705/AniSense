import { useState } from 'react'
import { motion } from 'framer-motion'

const CONTENT_FILTERS = [
  'No Excessive Fanservice',
  'No Gore/Violence',
  'Family Friendly',
  'Completed Series Only',
  'English Dub Available',
]

const ANIME_TYPES = ['TV', 'Movie', 'OVA']

function SettingsStep({ data, onNext, onBack }) {
  const [settings, setSettings] = useState(data.settings || {})
  const [minRating, setMinRating] = useState(settings.min_rating || 7.0)
  const [maxEpisodes, setMaxEpisodes] = useState(settings.max_episodes || '')
  const [contentFilters, setContentFilters] = useState(settings.content_filters || [])
  const [preferredType, setPreferredType] = useState(settings.preferred_type || '')

  const toggleFilter = (filter) => {
    setContentFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    )
  }

  const handleNext = () => {
    const newSettings = {
      min_rating: minRating,
      max_episodes: maxEpisodes ? parseInt(maxEpisodes) : null,
      content_filters: contentFilters,
      preferred_type: preferredType || null,
    }
    onNext({
      ...data,
      settings: newSettings,
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Min Rating */}
      <div className="space-y-3">
        <label className="block text-white font-semibold">
          Minimum Rating: {minRating.toFixed(1)}/10
        </label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={minRating}
          onChange={(e) => setMinRating(parseFloat(e.target.value))}
          className="w-full cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>Any Rating</span>
          <span>Only Highly Rated</span>
        </div>
      </div>

      {/* Max Episodes */}
      <div className="space-y-3">
        <label className="block text-white font-semibold">
          Max Episodes (optional)
        </label>
        <input
          type="number"
          placeholder="Leave empty for no limit"
          value={maxEpisodes}
          onChange={(e) => setMaxEpisodes(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-primary-800 border border-primary-700 text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
        />
        <div className="text-xs text-gray-400">
          Useful for time-limited viewers
        </div>
      </div>

      {/* Preferred Type */}
      <div className="space-y-3">
        <label className="block text-white font-semibold">
          Preferred Type (optional)
        </label>
        <div className="grid grid-cols-3 gap-3">
          {ANIME_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setPreferredType(preferredType === type ? '' : type)}
              className={`p-3 rounded-lg border-2 transition-all ${
                preferredType === type
                  ? 'border-accent-purple bg-accent-purple/20 text-white'
                  : 'border-primary-700 bg-primary-800 text-gray-300 hover:border-accent-purple'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Content Filters */}
      <div className="space-y-3">
        <label className="block text-white font-semibold">
          Content Filters (select all that apply)
        </label>
        <div className="space-y-2">
          {CONTENT_FILTERS.map((filter) => (
            <motion.button
              key={filter}
              whileHover={{ x: 5 }}
              onClick={() => toggleFilter(filter)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                contentFilters.includes(filter)
                  ? 'border-accent-purple bg-accent-purple/20 text-white'
                  : 'border-primary-700 bg-primary-800 text-gray-300 hover:border-accent-purple'
              }`}
            >
              <span className="mr-3">{contentFilters.includes(filter) ? '✓' : '◯'}</span>
              {filter}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 justify-center pt-4">
        <button
          onClick={onBack}
          className="px-8 py-3 bg-primary-700 rounded-lg font-semibold hover:bg-primary-600 transition-all"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-accent-purple rounded-lg font-semibold hover:bg-accent-purple/80 transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default SettingsStep
