import { useState } from 'react'
import { motion } from 'framer-motion'

function WelcomeStep({ data, onNext }) {
  const [username, setUsername] = useState(data.username || '')
  const [error, setError] = useState('')

  const handleNext = () => {
    if (!username || username.length < 2) {
      setError('Username must be at least 2 characters')
      return
    }
    if (username.length > 30) {
      setError('Username must be less than 30 characters')
      return
    }
    onNext({ ...data, username })
  }

  return (
    <div className="space-y-8 max-w-lg">
      {/* Welcome Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-4"
      >
        <div className="text-6xl mb-4">🎌</div>
        <p className="text-xl text-gray-300">
          Welcome to AniSense! Your personalized anime recommendation system.
        </p>
        <p className="text-gray-400">
          Let's get to know your anime preferences to give you amazing recommendations.
        </p>
      </motion.div>

      {/* Username Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <label className="block text-white font-semibold">What's your name?</label>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            setError('')
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleNext()}
          className="w-full px-4 py-3 rounded-lg bg-primary-800 border border-primary-700 text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
        />
        {error && <div className="text-red-400 text-sm">{error}</div>}
      </motion.div>

      {/* Features Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        <p className="text-gray-400 text-sm font-semibold">What you'll do:</p>
        <div className="space-y-2">
          {[
            { icon: '🎬', text: 'Pick your favorite genres' },
            { icon: '🎨', text: 'Select themes you enjoy' },
            { icon: '📚', text: 'Choose anime you know' },
            { icon: '⚙️', text: 'Set your preferences' },
            { icon: '✨', text: 'Get personalized recommendations' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="flex items-center gap-3 text-gray-300"
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Continue Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={handleNext}
        disabled={!username || username.length < 2}
        className="w-full py-3 bg-accent-purple rounded-lg font-semibold hover:bg-accent-purple/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Get Started →
      </motion.button>
    </div>
  )
}

export default WelcomeStep
