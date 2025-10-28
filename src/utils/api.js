/**
 * Secure API utility functions with CSRF protection and proper error handling
 */

import { API_CONFIG } from '../config/api'

const API_URL = API_CONFIG.BASE_URL

/**
 * Make a secure API request with CSRF protection and proper error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
export const secureApiRequest = async (endpoint, options = {}) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      ...options.headers
    },
    credentials: 'same-origin'
  }

  const response = await fetch(`${API_URL}${endpoint}`, config)

  if (!response.ok) {
    let errorData = {}
    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json()
      }
    } catch (parseError) {
      console.warn('Failed to parse error response as JSON:', parseError)
    }
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
  }

  let data = {}
  try {
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    }
  } catch (parseError) {
    console.warn('Failed to parse response as JSON:', parseError)
  }

  return data
}

export { API_URL }