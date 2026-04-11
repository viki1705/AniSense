import { createContext, useState, useEffect, useContext } from 'react'
import axios from 'axios'

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [preferences, setPreferences] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const userId = localStorage.getItem('anisense_user_id')
      if (userId) {
        const response = await axios.get(
          `http://localhost:8000/api/users/preferences/${userId}`
        )
        const userData = response.data
        setUser({
          userId,
          username: userData.username,
          onboarding_completed: userData.onboarding_completed,
        })
        setPreferences(userData)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
      localStorage.removeItem('anisense_user_id')
    } finally {
      setLoading(false)
    }
  }

  const completeOnboarding = (userId, username) => {
    localStorage.setItem('anisense_user_id', userId)
    setUser({
      userId,
      username,
      onboarding_completed: true,
    })
  }

  const logout = () => {
    localStorage.removeItem('anisense_user_id')
    setUser(null)
    setPreferences(null)
  }

  const refreshPreferences = async () => {
    if (user) {
      await loadUser()
    }
  }

  const recordInteraction = async (animeId, interactionType) => {
    try {
      await axios.post('http://localhost:8000/api/users/interactions', {
        user_id: user.userId,
        anime_id: animeId,
        interaction_type: interactionType,
      })
    } catch (error) {
      console.error('Failed to record interaction:', error)
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        preferences,
        loading,
        completeOnboarding,
        logout,
        refreshPreferences,
        recordInteraction,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
