/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Get API URL from environment variables
const getApiUrl = () => {
  // Vite uses VITE_ prefix for environment variables
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Fallback for React apps
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL
  }
  
  // Default fallback for development
  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api'
  }
  
  // Production fallback
  return 'https://hotfix.onrender.com/api'
}

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
}

export default API_CONFIG