import { useState } from 'react'
import { motion } from 'framer-motion'

const AVAILABLE_GENRES = [
  { name: 'Action', icon: '⚔️', description: 'High-energy battles' },
  { name: 'Drama', icon: '🎭', description: 'Emotional stories' },
  { name: 'Comedy', icon: '😄', description: 'Funny and light' },
  { name: 'Romance', icon: '💕', description: 'Love stories' },
  { name: 'Fantasy', icon: '🔮', description: 'Magical worlds' },
  { name: 'Sci-Fi', icon: '🚀', description: 'Future technology' },
  { name: 'Thriller', icon: '😱', description: 'Suspenseful plots' },
  { name: 'Mystery', icon: '🔍', description: 'Detective stories' },
  { name: 'Slice of Life', icon: '☕', description: 'Everyday moments' },
  { name: 'Sports', icon: '⚽', description: 'Athletic competition' },
  { name: 'Horror', icon: '👻', description: 'Scary content' },
  { name: 'Psychological', icon: '🧠', description: 'Mind games' },
  { name: 'Superpower', icon: '⚡', description: 'Supernatural abilities' },
  { name: 'School', icon: '🎓', description: 'School life' },
]

function GenreStep({ data, onNext, isFirstStep }) {
  const [selected, setSelected] = useState(data.genres || [])

  const toggleGenre = (genre) => {
    setSelected((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre)
      }
      if (prev.length < 5) {
        return [...prev, genre]
      }
      return prev
    })
  }

  const handleNext = () => {
    if (selected.length >= 3) {
      onNext({ ...data, genres: selected })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {AVAILABLE_GENRES.map((genre) => (
          <motion.button
            key={genre.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleGenre(genre.name)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selected.includes(genre.name)
                ? 'border-accent-purple bg-accent-purple/20 text-white'
                : 'border-primary-700 bg-primary-800 text-gray-300 hover:border-accent-purple'
            }`}
          >
            <div className="text-2xl mb-1">{genre.icon}</div>
            <div className="font-semibold text-sm">{genre.name}</div>
            <div className="text-xs opacity-75 mt-1">{genre.description}</div>
          </motion.button>
        ))}
      </div>

      <div className="text-center text-sm text-gray-400">
        Selected: {selected.length}/5 (min: 3)
      </div>

      <div className="flex gap-4 justify-center pt-4">
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

export default GenreStep
