import { useState, useRef, useEffect } from 'react'
import { Send, Loader, AlertCircle } from 'lucide-react'
import RecommendationCard from './RecommendationCard'

export default function ChatInterface({ onSendMessage }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleAddToWatchlist = async (animeId, title) => {
    // This would be passed from parent or imported
    console.log(`Adding ${title} to watchlist`)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await onSendMessage(input)
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.explanation,
        anime: response.retrieved_anime,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: error.message || 'Sorry, I encountered an error. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
      console.error('Send message error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-primary-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-secondary text-center">
              Start a conversation to get anime recommendations!
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-md rounded-lg p-4 ${
                message.type === 'user'
                  ? 'bg-accent-purple text-white'
                  : message.type === 'error'
                    ? 'bg-red-500/10 border border-red-500/30 text-red-300 flex gap-3'
                    : 'bg-primary-800 border border-accent-purple/20 text-secondary'
              }`}
            >
              {message.type === 'error' && (
                <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
              )}
              <div className="flex-1">
                <p>{message.content}</p>

                {message.anime && message.anime.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 gap-3">
                    {message.anime.slice(0, 3).map((anime) => (
                      <div key={anime.anime_id || anime.title} className="text-xs">
                        <p className="font-semibold text-white">{anime.title}</p>
                        <p>{anime.rating?.toFixed(2)} rating</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-primary-800 border border-accent-purple/20 p-4 rounded-lg flex gap-3 items-center">
              <Loader className="animate-spin text-accent-purple flex-shrink-0" size={20} />
              <div className="text-sm text-secondary">
                <p className="font-semibold">Generating recommendations...</p>
                <p className="text-xs text-secondary/70">This may take a moment</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-accent-purple/20 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about anime..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg bg-primary-800 text-white placeholder-secondary border border-accent-purple/20 focus:border-accent-cyan focus:outline-none transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-accent-purple hover:bg-accent-cyan text-white rounded-lg font-semibold flex items-center gap-2 transition disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  )
}
