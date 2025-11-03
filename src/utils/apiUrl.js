// Simple API URL utility that works in all environments
export const getApiUrl = () => {
  // Production fallback first
  const prodUrl = 'https://hotfix.onrender.com/api'
  
  try {
    // Try to get from environment
    const envUrl = import.meta?.env?.VITE_API_URL
    if (envUrl && typeof envUrl === 'string') {
      return envUrl
    }
    
    // Check if development
    if (import.meta?.env?.DEV) {
      return 'http://localhost:5001/api'
    }
    
    return prodUrl
  } catch (error) {
    console.error('API URL config error:', error)
    return prodUrl
  }
}

// Default export
const getApiUrlDefault = getApiUrl
export default getApiUrlDefault