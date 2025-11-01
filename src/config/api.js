/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

import { getApiUrl } from '../utils/apiUrl'

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