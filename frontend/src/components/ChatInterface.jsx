import { useState, useRef, useEffect } from 'react'
import { Send, Loader, AlertCircle } from 'lucide-react'
import { useChat } from '../contexts/ChatContext'
import RecommendationCard from './RecommendationCard'

export default function ChatInterface({ onSendMessage, onSendMessageStream }) {
  const { messages, addMessage, updateMessageById } = useChat()
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

    addMessage(userMessage)
    setInput('')
    setLoading(true)

    try {
      // Try streaming if available
      if (onSendMessageStream) {
        let animeList = []
        let assistantMessageId = Date.now() + 1
        let explanation = ''
        let isStreaming = false

        // Create initial empty assistant message
        addMessage({
          id: assistantMessageId,
          type: 'assistant',
          content: '',
          anime: [],
          isStreaming: true,
        })

        for await (const event of onSendMessageStream(input)) {
          if (event.type === 'anime_list') {
            // Display anime list immediately
            animeList = event.data.retrieved_anime || []
            updateMessageById(assistantMessageId, {
              anime: animeList,
              isStreaming: true,
            })
            isStreaming = true
          } else if (event.type === 'token') {
            // Append token to explanation in real-time
            explanation += event.token
            updateMessageById(assistantMessageId, { content: explanation })
          } else if (event.type === 'done') {
            // Mark streaming as complete
            updateMessageById(assistantMessageId, { isStreaming: false })
          } else if (event.type === 'error') {
            // Stream error - create error message
            throw new Error(event.message || 'Streaming error occurred')
          } else if (event.type === 'fallback') {
            // Fallback from non-streaming
            const response = event.data
            if (!response.retrieved_anime || response.retrieved_anime.length === 0) {
              throw new Error('No anime found for your query. Try another search.')
            }
            updateMessageById(assistantMessageId, {
              content: response.explanation,
              anime: response.retrieved_anime,
              isStreaming: false,
            })
          }
        }

        // Ensure message is marked as not streaming at the end
        if (isStreaming && explanation) {
          updateMessageById(assistantMessageId, { isStreaming: false })
        }
      } else {
        // Fallback to non-streaming if streaming not available
        const response = await onSendMessage(input)
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: response.explanation,
          anime: response.retrieved_anime,
        }
        addMessage(assistantMessage)
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: error.message || 'Sorry, I encountered an error. Please try again.',
      }
      addMessage(errorMessage)
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
                {message.type === 'assistant' && message.content && (
                  <div>
                    <p className="text-sm font-semibold text-accent-cyan mb-2">Why they are recommended?</p>
                    <p>{message.content}</p>
                  </div>
                )}

                {message.type === 'user' && (
                  <p>{message.content}</p>
                )}

                {message.anime && message.anime.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-accent-cyan mb-3">Here are the top 3 recommendations</p>
                    <div className="grid grid-cols-1 gap-3">
                      {message.anime.slice(0, 3).map((anime, index) => (
                        <div key={anime.anime_id || anime.title} className="text-sm">
                          <p className="font-semibold text-white">{index + 1}) {anime.title}</p>
                        </div>
                      ))}
                    </div>
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
