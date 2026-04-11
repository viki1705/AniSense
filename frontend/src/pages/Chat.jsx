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

  return (
    <div className="min-h-screen bg-primary-900">
      <ChatInterface onSendMessage={handleSendMessage} />
    </div>
  )
}
