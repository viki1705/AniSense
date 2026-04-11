import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader, Trash2, AlertCircle } from 'lucide-react'
import animeAPI from '../services/api'

export default function Watchlist() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    loadWatchlist()
  }, [])

  const loadWatchlist = async () => {
    try {
      const response = await animeAPI.getWatchlist()
      setItems(response.items || [])
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load watchlist')
      console.error('Error loading watchlist:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (animeId, title) => {
    setDeleting(animeId)
    try {
      await animeAPI.removeFromWatchlist(animeId)
      setItems(items.filter((item) => item.anime_id !== animeId))
      setConfirmDelete(null)
    } catch (err) {
      setError(err.message || 'Failed to remove from watchlist')
      console.error('Error removing from watchlist:', err)
    } finally {
      setDeleting(null)
    }
  }

  const confirmDeleteAndClose = (animeId, title) => {
    handleRemove(animeId, title)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <Loader className="animate-spin text-accent-purple" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-900 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <h1 className="text-4xl font-bold gradient-text">
          My Watchlist ({items.length})
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary text-lg mb-6">Your watchlist is empty</p>
            <button
              onClick={() => navigate('/explore')}
              className="px-6 py-2 bg-accent-purple hover:bg-accent-cyan rounded-lg text-white font-semibold transition"
            >
              Explore Anime
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="glass-morphism p-4 rounded-lg flex justify-between items-start hover:border-accent-cyan/50 transition"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-secondary">
                    Added: {new Date(item.added_date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDelete(item.anime_id)}
                  disabled={deleting === item.anime_id}
                  className="p-2 hover:bg-red-500/20 rounded transition text-red-400 disabled:opacity-50"
                  title="Remove from watchlist"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-primary-950 rounded-lg p-6 max-w-sm border border-accent-purple/30">
              <h2 className="text-xl font-bold text-white mb-4">Remove from Watchlist?</h2>
              <p className="text-secondary mb-6">
                Are you sure you want to remove this anime from your watchlist? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmDelete(null)}
                  disabled={deleting !== null}
                  className="px-4 py-2 rounded-lg border border-accent-purple text-accent-purple hover:bg-accent-purple/10 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    confirmDeleteAndClose(
                      confirmDelete,
                      items.find((i) => i.anime_id === confirmDelete)?.title || ''
                    )
                  }
                  disabled={deleting !== null}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting === confirmDelete && (
                    <Loader size={16} className="animate-spin" />
                  )}
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
