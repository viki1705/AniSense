import { useState } from 'react'
import { motion } from 'framer-motion'

const AVAILABLE_THEMES = [
  { name: 'Dark and Gritty', color: 'from-slate-800 to-slate-700' },
  { name: 'Uplifting and Hopeful', color: 'from-yellow-400 to-orange-400' },
  { name: 'Emotional and Deep', color: 'from-pink-500 to-rose-400' },
  { name: 'Action-Packed', color: 'from-red-600 to-orange-500' },
  { name: 'Thought-Provoking', color: 'from-purple-600 to-blue-500' },
  { name: 'Heartwarming', color: 'from-pink-300 to-red-200' },
  { name: 'Mysterious', color: 'from-indigo-600 to-purple-700' },
  { name: 'Epic and Grand', color: 'from-amber-500 to-yellow-400' },
  { name: 'Realistic', color: 'from-gray-600 to-gray-500' },
  { name: 'Fantastical', color: 'from-cyan-400 to-blue-500' },
]

function ThemeStep({ data, onNext, onBack }) {
  const [selected, setSelected] = useState(data.themes || [])

  const toggleTheme = (theme) => {
    setSelected((prev) => {
      if (prev.includes(theme)) {
        return prev.filter((t) => t !== theme)
      }
      if (prev.length < 5) {
        return [...prev, theme]
      }
      return prev
    })
  }

  const handleNext = () => {
    if (selected.length >= 2) {
      onNext({ ...data, themes: selected })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AVAILABLE_THEMES.map((theme) => (
          <motion.button
            key={theme.name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleTheme(theme.name)}
            className={`p-6 rounded-lg transition-all ${
              selected.includes(theme.name)
                ? `bg-gradient-to-r ${theme.color} ring-2 ring-accent-purple text-white font-semibold shadow-lg`
                : `bg-gradient-to-r ${theme.color} opacity-60 hover:opacity-100`
            }`}
          >
            {theme.name}
          </motion.button>
        ))}
      </div>

      <div className="text-center text-sm text-gray-400">
        Selected: {selected.length}/5 (min: 2)
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
          disabled={selected.length < 2}
          className="px-8 py-3 bg-accent-purple rounded-lg font-semibold hover:bg-accent-purple/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default ThemeStep
