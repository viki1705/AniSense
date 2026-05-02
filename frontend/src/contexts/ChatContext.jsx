import { createContext, useState, useContext } from 'react'

const ChatContext = createContext()

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([])

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message])
  }

  const updateLastMessage = (updates) => {
    setMessages((prev) => {
      const updated = [...prev]
      updated[updated.length - 1] = { ...updated[updated.length - 1], ...updates }
      return updated
    })
  }

  const updateMessageById = (messageId, updates) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
    )
  }

  const clearMessages = () => {
    setMessages([])
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        addMessage,
        updateLastMessage,
        updateMessageById,
        clearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
