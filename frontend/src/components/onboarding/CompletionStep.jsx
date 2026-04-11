import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import RecommendationCard from '../RecommendationCard'

function CompletionStep({ data, onComplete }) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      const response = await axios.post(
        'http://localhost:8000/api/users/onboarding/complete',
        { user_id: data.user_id }
      )
      setRecommendations(response.data.personalized_recommendations || [])
    } catch (err) {
      console.error('Error loading recommendations:', err)
      setError('Failed to load recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Celebration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring' }}
        className="text-center space-y-4"
      >
        <div className="text-6xl">🎉</div>
        <h2 className="text-3xl font-bold text-white">You're All Set!</h2>
        <p className="text-gray-300">
          Your profile is ready. Here are your personalized recommendations:
        </p>
      </motion.div>

      {/* Profile Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-primary-800 rounded-lg border border-primary-700 p-6 space-y-4"
      >
        <h3 className="text-xl font-semibold text-white">Your Profile:</h3>

        {data.genres && (
          <div>
            <p className="text-gray-400 text-sm font-semibold mb-2">Favorite Genres:</p>
            <div className="flex flex-wrap gap-2">
              {data.genres.map((genre) => (
                <motion.span
                  key={genre}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1 bg-accent-purple/20 border border-accent-purple rounded-full text-sm text-accent-purple"
                >
                  {genre}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {data.themes && (
          <div>
            <p className="text-gray-400 text-sm font-semibold mb-2">Preferred Themes:</p>
            <div className="flex flex-wrap gap-2">
              {data.themes.map((theme) => (
                <motion.span
                  key={theme}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1 bg-accent-pink/20 border border-accent-pink rounded-full text-sm text-accent-pink"
                >
                  {theme}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Recommendations or Loading */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">
          Personalized For You:
        </h3>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-4xl"
              >
                ⏳
              </motion.div>
            </div>
            <p className="text-gray-400 mt-4">Generating your recommendations...</p>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-300"
          >
            {error}
          </motion.div>
        )}

        {!loading && !error && recommendations.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 6).map((anime, idx) => (
              <motion.div
                key={anime.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <RecommendationCard anime={anime} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onComplete}
        className="w-full py-3 bg-accent-purple rounded-lg font-semibold hover:bg-accent-purple/80 transition-all"
      >
        Explore Now →
      </motion.button>
    </div>
  )
}

export default CompletionStep

