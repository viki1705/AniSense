import { useState } from 'react'
import ChatInterface from '../components/ChatInterface'
import animeAPI from '../services/api'

export default function Chat() {
  const handleSendMessage = async (query) => {
    try {
      const response = await animeAPI.getRecommendations(query, 5)
      if (!response.retrieved_anime || response.retrieved_anime.length === 0) {
        throw new Error('No anime found for your query. Try another search.')
      }
      return response
    } catch (error) {
      console.error('Chat error:', error)
      throw error
    }
  }

  const handleSendMessageStream = async function* (query) {
    try {
      for await (const event of animeAPI.getRecommendationsStream(query, 5)) {
        yield event
      }
    } catch (error) {
      console.error('Chat streaming error:', error)
      // Fallback to non-streaming
      const response = await handleSendMessage(query)
      yield { type: 'fallback', data: response }
    }
  }

  return (
    <div className="min-h-screen bg-primary-900">
      <ChatInterface onSendMessage={handleSendMessage} onSendMessageStream={handleSendMessageStream} />
    </div>
  )
}
