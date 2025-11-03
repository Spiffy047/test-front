// Simple API URL utility that works in all environments
export const getApiUrl = () => {
  // Production fallback first
  const prodUrl = 'https://hotfix.onrender.com/api'
  
  try {
    // Check if we're in development first
    if (import.meta?.env?.DEV) {
      return import.meta?.env?.VITE_API_URL || 'http://localhost:5001/api'
    }
    
    // Production mode - always use production URL
    return prodUrl
  } catch (error) {
    console.error('API URL config error:', error)
    return prodUrl
  }
}

// Default export
const getApiUrlDefault = getApiUrl
export default getApiUrlDefault