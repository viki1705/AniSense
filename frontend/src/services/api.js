import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  timeout: 70000, // 70 seconds - accommodates Ollama response time (17-49s) + buffer
})

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // Initial delay in ms

// Utility to retry requests with exponential backoff
const retryRequest = async (fn, maxRetries = MAX_RETRIES) => {
  let lastError
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      const isLastAttempt = attempt === maxRetries
      const isRetryableError =
        error.code === 'ECONNREFUSED' ||
        (error.response?.status >= 500 && error.response?.status !== 504) // Server errors, but NOT timeout

      if (isRetryableError && !isLastAttempt) {
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1) // Exponential backoff
        console.warn(
          `[API] Retry attempt ${attempt}/${maxRetries} after ${delay}ms`,
          error.message
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        break
      }
    }
  }
  throw lastError
}

// User-friendly error messages
const getUserFriendlyError = (error) => {
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. The backend may be unavailable or slow.'
    }
    if (error.code === 'ECONNREFUSED') {
      return 'Cannot reach the server. Is the backend running?'
    }
    return 'Network error. Please check your connection.'
  }

  const status = error.response?.status
  if (status === 404) return 'Not found.'
  if (status === 400) return 'Invalid request. Please check your input.'
  if (status >= 500) return 'Server error. Please try again later.'
  return error.response?.data?.detail || 'Something went wrong. Please try again.'
}

const animeAPI = {
  // Recommendations
  getRecommendations: async (query, maxResults = 5) => {
    return retryRequest(() =>
      api.post('/api/recommend', {
        query,
        max_results: maxResults,
      })
    ).then((response) => response.data)
      .catch((error) => {
        throw new Error(getUserFriendlyError(error))
      })
  },

  searchAnime: async (title) => {
    return retryRequest(() =>
      api.get(`/api/search/${encodeURIComponent(title)}`)
    ).then((response) => response.data)
      .catch((error) => {
        throw new Error(getUserFriendlyError(error))
      })
  },

  // Franchise
  getFranchise: async (franchiseName) => {
    return retryRequest(() =>
      api.get(`/api/franchise/${encodeURIComponent(franchiseName)}`)
    ).then((response) => response.data)
      .catch((error) => {
        throw new Error(getUserFriendlyError(error))
      })
  },

  getRelatedAnime: async (animeTitle) => {
    return retryRequest(() =>
      api.get(`/api/franchise/related/${encodeURIComponent(animeTitle)}`)
    ).then((response) => response.data)
      .catch((error) => {
        throw new Error(getUserFriendlyError(error))
      })
  },

  // Watchlist
  getWatchlist: async () => {
    return retryRequest(() =>
      api.get('/api/watchlist/')
    ).then((response) => response.data)
      .catch((error) => {
        throw new Error(getUserFriendlyError(error))
      })
  },

  addToWatchlist: async (animeId, title) => {
    return retryRequest(() =>
      api.post('/api/watchlist/add', {
        anime_id: animeId,
        title,
      })
    ).then((response) => response.data)
      .catch((error) => {
        throw new Error(getUserFriendlyError(error))
      })
  },

  removeFromWatchlist: async (animeId) => {
    return retryRequest(() =>
      api.delete(`/api/watchlist/${encodeURIComponent(animeId)}`)
    ).then((response) => response.data)
      .catch((error) => {
        throw new Error(getUserFriendlyError(error))
      })
  },

  checkInWatchlist: async (animeId) => {
    return retryRequest(() =>
      api.get(`/api/watchlist/check/${encodeURIComponent(animeId)}`)
    ).then((response) => response.data)
      .catch((error) => {
        throw new Error(getUserFriendlyError(error))
      })
  },
}

export default animeAPI
