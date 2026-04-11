import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function AnimeDetailModal({ anime, onClose }) {
  if (!anime) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-primary-800 rounded-xl border border-primary-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-accent-purple/20 to-accent-pink/20 p-6 border-b border-primary-700 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{anime.title}</h1>
              <div className="flex gap-4 flex-wrap">
                {anime.genres && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Genres</p>
                    <div className="flex flex-wrap gap-1">
                      {anime.genres.split(',').map((genre, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-accent-purple/30 border border-accent-purple rounded text-accent-purple"
                        >
                          {genre.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {anime.themes && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Themes</p>
                    <div className="flex flex-wrap gap-1">
                      {anime.themes.split(',').slice(0, 3).map((theme, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-accent-cyan/30 border border-accent-cyan rounded text-accent-cyan"
                        >
                          {theme.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Image and Quick Info */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Image */}
              <div className="md:col-span-1">
                {anime.main_picture ? (
                  <img
                    src={anime.main_picture}
                    alt={anime.title}
                    className="w-full rounded-lg"
                  />
                ) : (
                  <div className="w-full aspect-video bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20 rounded-lg flex items-center justify-center text-6xl">
                    📺
                  </div>
                )}
              </div>

              {/* Quick Info */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm font-semibold mb-1">Rating</p>
                    <p className="text-2xl font-bold text-accent-cyan">
                      {anime.rating?.toFixed(2) || 'N/A'}/10
                    </p>
                  </div>

                  <div className="bg-primary-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm font-semibold mb-1">Match Score</p>
                    <p className="text-2xl font-bold text-accent-purple">
                      {anime.similarity_score
                        ? (anime.similarity_score * 100).toFixed(0)
                        : 'N/A'}
                      %
                    </p>
                  </div>

                  {anime.type && (
                    <div className="bg-primary-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm font-semibold mb-1">Type</p>
                      <p className="text-lg font-bold text-white">{anime.type}</p>
                    </div>
                  )}

                  {anime.episodes && (
                    <div className="bg-primary-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm font-semibold mb-1">Episodes</p>
                      <p className="text-lg font-bold text-white">{anime.episodes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Full Synopsis */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Synopsis</h2>
              <p className="text-gray-300 leading-relaxed">
                {anime.synopsis || 'No synopsis available'}
              </p>
            </div>

            {/* Additional Details */}
            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-primary-700">
              {anime.volumes && (
                <div>
                  <p className="text-gray-400 text-sm font-semibold mb-2">Volumes</p>
                  <p className="text-white text-lg">{anime.volumes}</p>
                </div>
              )}

              {anime.chapters && (
                <div>
                  <p className="text-gray-400 text-sm font-semibold mb-2">Chapters</p>
                  <p className="text-white text-lg">{anime.chapters}</p>
                </div>
              )}

              {anime.anime_id && (
                <div>
                  <p className="text-gray-400 text-sm font-semibold mb-2">Anime ID</p>
                  <p className="text-white text-sm font-mono">{anime.anime_id}</p>
                </div>
              )}
            </div>

            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full mt-6 py-3 bg-accent-purple hover:bg-accent-purple/80 rounded-lg font-semibold text-white transition-all"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
