import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useUser } from '../contexts/UserContext'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const AVAILABLE_GENRES = [
  'Action',
  'Drama',
  'Comedy',
  'Romance',
  'Fantasy',
  'Sci-Fi',
  'Thriller',
  'Mystery',
  'Slice of Life',
  'Sports',
  'Horror',
  'Psychological',
  'Superpower',
  'School',
]

const AVAILABLE_THEMES = [
  'Dark and Gritty',
  'Uplifting and Hopeful',
  'Emotional and Deep',
  'Action-Packed',
  'Thought-Provoking',
  'Heartwarming',
  'Mysterious',
  'Epic and Grand',
  'Realistic',
  'Fantastical',
]

function Settings() {
  const navigate = useNavigate()
  const { user, preferences, refreshPreferences } = useUser()

  const [username, setUsername] = useState('')
  const [genres, setGenres] = useState([])
  const [themes, setThemes] = useState([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (preferences) {
      setUsername(user?.username || '')
      setGenres(preferences.genres || [])
      setThemes(preferences.themes || [])
    }
  }, [preferences, user])

  const toggleGenre = (genre) => {
    setGenres((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre)
      }
      if (prev.length < 5) {
        return [...prev, genre]
      }
      return prev
    })
  }

  const toggleTheme = (theme) => {
    setThemes((prev) => {
      if (prev.includes(theme)) {
        return prev.filter((t) => t !== theme)
      }
      if (prev.length < 5) {
        return [...prev, theme]
      }
      return prev
    })
  }

  const handleSave = async () => {
    if (genres.length < 3) {
      setMessage('❌ Please select at least 3 genres')
      return
    }
    if (themes.length < 2) {
      setMessage('❌ Please select at least 2 themes')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      await axios.put(
        `http://localhost:8000/api/users/preferences/${user.userId}`,
        {
          genres,
          themes,
        }
      )

      await refreshPreferences()
      setMessage('✅ Preferences updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving preferences:', error)
      setMessage('❌ Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (preferences) {
      setGenres(preferences.genres || [])
      setThemes(preferences.themes || [])
      setMessage('')
    }
  }

  return (
    <div className="bg-primary-900 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-primary-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-400" />
          </button>
          <h1 className="text-4xl font-bold text-white">Settings</h1>
        </motion.div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.startsWith('✅')
                ? 'bg-green-500/20 border border-green-500 text-green-300'
                : 'bg-red-500/20 border border-red-500 text-red-300'
            }`}
          >
            {message}
          </motion.div>
        )}

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-primary-800 rounded-xl border border-primary-700 p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Profile</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                disabled
                className="w-full px-4 py-2 rounded-lg bg-primary-700 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Username cannot be changed after registration
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                User ID
              </label>
              <input
                type="text"
                value={user?.userId || ''}
                disabled
                className="w-full px-4 py-2 rounded-lg bg-primary-700 text-gray-500 text-sm font-mono cursor-not-allowed"
              />
            </div>
          </div>
        </motion.div>

        {/* Genres Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-primary-800 rounded-xl border border-primary-700 p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-2">Favorite Genres</h2>
          <p className="text-gray-400 text-sm mb-4">
            Select 3-5 genres you enjoy
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AVAILABLE_GENRES.map((genre) => (
              <motion.button
                key={genre}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleGenre(genre)}
                className={`p-3 rounded-lg border-2 transition-all text-sm font-semibold ${
                  genres.includes(genre)
                    ? 'border-accent-purple bg-accent-purple/20 text-white'
                    : 'border-primary-700 bg-primary-700 text-gray-300 hover:border-accent-purple'
                }`}
              >
                {genre}
              </motion.button>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Selected: {genres.length}/5 (min: 3)
          </p>
        </motion.div>

        {/* Themes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-primary-800 rounded-xl border border-primary-700 p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-2">Preferred Themes</h2>
          <p className="text-gray-400 text-sm mb-4">
            Select 2-5 themes you prefer
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AVAILABLE_THEMES.map((theme) => (
              <motion.button
                key={theme}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleTheme(theme)}
                className={`p-3 rounded-lg border-2 transition-all text-sm font-semibold ${
                  themes.includes(theme)
                    ? 'border-accent-pink bg-accent-pink/20 text-white'
                    : 'border-primary-700 bg-primary-700 text-gray-300 hover:border-accent-pink'
                }`}
              >
                {theme}
              </motion.button>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Selected: {themes.length}/5 (min: 2)
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 justify-center"
        >
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-8 py-3 bg-primary-700 hover:bg-primary-600 disabled:opacity-50 rounded-lg font-semibold text-white transition-all"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving || genres.length < 3 || themes.length < 2}
            className="px-8 py-3 bg-accent-purple hover:bg-accent-purple/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-blue-300 text-sm"
        >
          <p>
            💡 <strong>Tip:</strong> Updating your preferences will automatically improve
            your recommendations based on your new selections and interaction history.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Settings
