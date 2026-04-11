import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useUser } from '../contexts/UserContext'
import RecommendationCard from '../components/RecommendationCard'
import AnimeDetailModal from '../components/AnimeDetailModal'

function Dashboard() {
  const navigate = useNavigate()
  const { user, preferences, loading: userLoading, recordInteraction } = useUser()

  const [recommendations, setRecommendations] = useState([])
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAnime, setSelectedAnime] = useState(null)

  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/onboarding')
      return
    }

    if (user && !userLoading) {
      loadPersonalizedRecommendations()
    }
  }, [user, userLoading, navigate])

  const loadPersonalizedRecommendations = async () => {
    try {
      setLoading(true)
      const response = await axios.post(
        'http://localhost:8000/api/users/recommendations/personalized',
        {
          user_id: user.userId,
          limit: 12,
        }
      )
      setRecommendations(response.data.recommendations || [])
      setExplanation(response.data.explanation || '')
    } catch (error) {
      console.error('Error loading recommendations:', error)
      setError('Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  const handleInteraction = async (animeId, type) => {
    try {
      await recordInteraction(animeId, type)
    } catch (error) {
      console.error('Error recording interaction:', error)
    }
  }

  const handleAddToWatchlist = async (animeId, title) => {
    try {
      await axios.post('http://localhost:8000/api/watchlist/add', {
        anime_id: animeId || title,
        title: title,
      })
      alert(`Added "${title}" to watchlist!`)
      // Record as interaction
      await recordInteraction(animeId || title, 'watchlist_add')
    } catch (error) {
      console.error('Error adding to watchlist:', error)
      alert('Failed to add to watchlist. It may already be in your list.')
    }
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-4xl"
        >
          ⏳
        </motion.div>
      </div>
    )
  }

  return (
    <div className="bg-primary-900 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg">
            {explanation || 'Based on your preferences from onboarding'}
          </p>
        </motion.div>

        {/* User Preferences Summary */}
        {preferences && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12 bg-primary-800 rounded-lg border border-primary-700 p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Your Preferences</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Genres */}
              <div>
                <p className="text-gray-400 text-sm font-semibold mb-3">Favorite Genres</p>
                <div className="flex flex-wrap gap-2">
                  {preferences.genres?.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-accent-purple/20 border border-accent-purple rounded-full text-sm text-accent-purple"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Themes */}
              <div>
                <p className="text-gray-400 text-sm font-semibold mb-3">Preferred Themes</p>
                <div className="flex flex-wrap gap-2">
                  {preferences.themes?.map((theme) => (
                    <span
                      key={theme}
                      className="px-3 py-1 bg-accent-pink/20 border border-accent-pink rounded-full text-sm text-accent-pink"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recommendations Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
            Personalized For You ✨
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-4xl inline-block mb-4"
              >
                ⏳
              </motion.div>
              <p className="text-gray-400">Loading your personalized recommendations...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-300">
              {error}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendations.map((anime, idx) => (
                <motion.div
                  key={anime.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <RecommendationCard
                    anime={anime}
                    onAddToWatchlist={handleAddToWatchlist}
                    onLike={() => handleInteraction(anime.anime_id, 'like')}
                    onDislike={() => handleInteraction(anime.anime_id, 'dislike')}
                    onClick={() => setSelectedAnime(anime)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No recommendations available at this time
            </div>
          )}
        </motion.div>

        {/* Refresh Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <button
            onClick={loadPersonalizedRecommendations}
            className="px-6 py-3 bg-accent-purple rounded-lg font-semibold hover:bg-accent-purple/80 transition-all"
          >
            Refresh Recommendations
          </button>
        </motion.div>
      </div>

      {/* Anime Detail Modal */}
      {selectedAnime && (
        <AnimeDetailModal anime={selectedAnime} onClose={() => setSelectedAnime(null)} />
      )}
    </div>
  )
}

export default Dashboard
