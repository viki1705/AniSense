import { useState } from 'react'
import SearchBar from '../components/SearchBar'
import RecommendationCard from '../components/RecommendationCard'
import animeAPI from '../services/api'
import { Loader, AlertCircle } from 'lucide-react'

export default function Explore() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (query) => {
    setLoading(true)
    setSearched(true)
    setError('')
    try {
      const response = await animeAPI.getRecommendations(query, 9)
      setResults(response.retrieved_anime || [])
      if (!response.retrieved_anime || response.retrieved_anime.length === 0) {
        setError('No anime found matching your search. Try a different query.')
      }
    } catch (err) {
      setError(err.message || 'Failed to search. Please try again.')
      console.error('Search error:', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddToWatchlist = async (animeId, title) => {
    try {
      await animeAPI.addToWatchlist(animeId, title)
      // Toast notification
      const message = `✅ "${title}" added to watchlist!`
      console.log(message)
      // Could implement toast library here
    } catch (error) {
      const errorMsg =
        error.message.includes('already in watchlist')
          ? `"${title}" is already in your watchlist`
          : error.message || 'Failed to add to watchlist. Please try again.'
      console.error('Add watchlist error:', errorMsg)
      alert(errorMsg)
    }
  }

  return (
    <div className="min-h-screen bg-primary-900 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-6 gradient-text">Explore Anime</h1>
          <SearchBar onSearch={handleSearch} placeholder="Search by genre, theme, or description..." />
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin text-accent-purple" size={48} />
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {searched && !loading && results.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-secondary text-lg">No anime found. Try a different search.</p>
          </div>
        )}

        {results.length > 0 && (
          <>
            <p className="text-secondary">Found {results.length} anime</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((anime) => (
                <RecommendationCard
                  key={anime.anime_id || anime.title}
                  anime={anime}
                  onAddToWatchlist={handleAddToWatchlist}
                />
              ))}
            </div>
          </>
        )}

        {!searched && (
          <div className="text-center py-12">
            <p className="text-secondary text-lg">Search for anime to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
