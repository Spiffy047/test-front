/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Get API URL from environment variables with production fallback
const getApiUrl = () => {
  // Check Vite environment variables first
  const viteApiUrl = import.meta.env?.VITE_API_URL
  if (viteApiUrl) {
    console.log('Using VITE_API_URL:', viteApiUrl)
    return viteApiUrl
  }
  
  // Check if we're in development mode
  const isDev = import.meta.env?.DEV || import.meta.env?.MODE === 'development'
  if (isDev) {
    console.log('Development mode detected, using localhost')
    return 'http://localhost:5001/api'
  }
  
  // Production fallback - always use the live API
  console.log('Production mode, using live API')
  return 'https://hotfix.onrender.com/api'
}

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
}

export default API_CONFIG