// Simple API utility for login functionality
const getApiUrl = () => {
  // Development mode
  if (import.meta?.env?.DEV) {
    return import.meta?.env?.VITE_API_URL || 'http://localhost:5001/api'
  }
  
  // Production mode - always use production URL
  return 'https://hotfix.onrender.com/api'
}

export const apiRequest = async (endpoint, options = {}) => {
  const API_URL = getApiUrl()
  const url = `${API_URL}${endpoint}`
  
  const token = localStorage.getItem('token')
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  }

  const response = await fetch(url, config)
  
  if (!response.ok) {
    let errorData = {}
    try {
      errorData = await response.json()
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
  }

  return await response.json()
}

export default apiRequest