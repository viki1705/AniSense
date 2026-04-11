import { motion } from 'framer-motion'
import { Plus, Star, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useState } from 'react'

export default function RecommendationCard({ anime, onAddToWatchlist, onLike, onDislike, onClick }) {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const handleLike = async (e) => {
    e.stopPropagation()
    if (onLike) {
      setLoading(true)
      try {
        await onLike()
        setFeedback('liked')
        setTimeout(() => setFeedback(null), 1500)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDislike = async (e) => {
    e.stopPropagation()
    if (onDislike) {
      setLoading(true)
      try {
        await onDislike()
        setFeedback('disliked')
        setTimeout(() => setFeedback(null), 1500)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleAddToWatchlist = async (e) => {
    e.stopPropagation()
    if (onAddToWatchlist) {
      setLoading(true)
      try {
        await onAddToWatchlist(anime.anime_id || anime.title, anime.title)
        setFeedback('added')
        setTimeout(() => setFeedback(null), 1500)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCardClick = (e) => {
    e.stopPropagation()
    if (onClick) {
      onClick(anime)
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={handleCardClick}
      className="glass-morphism rounded-xl overflow-hidden hover-glow relative cursor-pointer"
    >
      <div className="aspect-video bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20 flex items-center justify-center overflow-hidden">
        {anime.main_picture ? (
          <img
            src={anime.main_picture}
            alt={anime.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div className="text-6xl flex items-center justify-center w-full h-full bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20">📺</div>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-bold text-lg text-white line-clamp-2 hover:text-accent-purple transition-colors">
          {anime.title}
        </h3>

        <div className="flex items-center gap-2">
          <Star size={16} className="text-accent-cyan fill-accent-cyan" />
          <span className="text-sm font-semibold">{anime.rating?.toFixed(2) || 'N/A'}</span>
          {anime.similarity_score && (
            <span className="text-xs text-secondary ml-auto">
              Match: {(anime.similarity_score * 100).toFixed(0)}%
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {anime.genres?.split(',').slice(0, 3).map((genre, idx) => (
            <span
              key={idx}
              className="px-2 py-1 text-xs rounded bg-accent-purple/20 text-accent-cyan"
            >
              {genre.trim()}
            </span>
          ))}
        </div>

        {anime.themes && (
          <div className="flex flex-wrap gap-1">
            {anime.themes?.split(',').slice(0, 2).map((theme, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs rounded bg-accent-cyan/20 text-accent-cyan italic"
              >
                {theme.trim()}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-secondary line-clamp-3 hover:text-gray-200 transition-colors cursor-pointer">
          {anime.synopsis}
        </p>

        {/* Recommendation Reasons */}
        {anime.recommendation_reasons && anime.recommendation_reasons.length > 0 && (
          <div className="bg-accent-purple/10 border border-accent-purple/30 rounded-lg p-2 text-xs text-accent-purple space-y-1">
            <p className="font-semibold text-accent-purple">💡 Why this recommendation:</p>
            {anime.recommendation_reasons.map((reason, idx) => (
              <p key={idx}>• {reason}</p>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={handleAddToWatchlist}
            disabled={loading}
            className="w-full px-3 py-2 bg-accent-purple hover:bg-accent-cyan disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition"
          >
            <Plus size={18} />
            {loading ? 'Adding...' : 'Add to Watchlist'}
          </button>

          {(onLike || onDislike) && (
            <div className="flex gap-2">
              {onLike && (
                <button
                  onClick={handleLike}
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-green-600/30 hover:bg-green-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-green-400 rounded-lg font-semibold flex items-center justify-center gap-1 transition"
                >
                  <ThumbsUp size={16} />
                  <span className="hidden sm:inline text-sm">{feedback === 'liked' ? '✓' : 'Like'}</span>
                </button>
              )}
              {onDislike && (
                <button
                  onClick={handleDislike}
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-red-600/30 hover:bg-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-red-400 rounded-lg font-semibold flex items-center justify-center gap-1 transition"
                >
                  <ThumbsDown size={16} />
                  <span className="hidden sm:inline text-sm">{feedback === 'disliked' ? '✓' : 'Pass'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl"
        >
          <div className="text-white font-bold text-center">
            {feedback === 'liked' && '👍 Noted!'}
            {feedback === 'disliked' && '👎 Got it!'}
            {feedback === 'added' && '✅ Added!'}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}



