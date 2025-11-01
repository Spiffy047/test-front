/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Get API URL from environment variables with production fallback
const getApiUrl = () => {
  try {
    // Check Vite environment variables first
    const viteApiUrl = import.meta?.env?.VITE_API_URL
    if (viteApiUrl && typeof viteApiUrl === 'string') {
      console.log('Using VITE_API_URL:', viteApiUrl)
      return viteApiUrl
    }
    
    // Check if we're in development mode
    const isDev = import.meta?.env?.DEV || import.meta?.env?.MODE === 'development'
    if (isDev) {
      console.log('Development mode detected, using localhost')
      return 'http://localhost:5001/api'
    }
    
    // Production fallback - always use the live API
    console.log('Production mode, using live API')
    return 'https://hotfix.onrender.com/api'
  } catch (error) {
    console.error('Error in getApiUrl:', error)
    // Emergency fallback
    return 'https://hotfix.onrender.com/api'
  }
}

// Create API config with lazy evaluation
let _apiConfig = null

const createApiConfig = () => {
  if (!_apiConfig) {
    try {
      _apiConfig = {
        BASE_URL: getApiUrl(),
        TIMEOUT: 30000,
        RETRY_ATTEMPTS: 3
      }
    } catch (error) {
      console.error('Failed to create API config:', error)
      _apiConfig = {
        BASE_URL: 'https://hotfix.onrender.com/api',
        TIMEOUT: 30000,
        RETRY_ATTEMPTS: 3
      }
    }
  }
  return _apiConfig
}

export const API_CONFIG = new Proxy({}, {
  get(target, prop) {
    const config = createApiConfig()
    return config[prop]
  }
})

export default API_CONFIG