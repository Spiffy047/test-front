/**
 * Secure API utility functions with CSRF protection, SSRF prevention, and proper error handling
 */

import { API_CONFIG } from '../config/api'

const API_URL = API_CONFIG.BASE_URL

// Allowed domains for API calls (prevent SSRF)
const ALLOWED_DOMAINS = [
  new URL(API_CONFIG.BASE_URL).hostname,
  'localhost',
  '127.0.0.1'
]

// Private IP ranges to block (SSRF prevention)
const PRIVATE_IP_RANGES = [
  /^127\./,           // 127.0.0.0/8
  /^10\./,            // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[01])\./,  // 172.16.0.0/12
  /^192\.168\./,      // 192.168.0.0/16
  /^169\.254\./,      // 169.254.0.0/16 (link-local)
]

/**
 * Validate URL to prevent SSRF attacks
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is safe
 */
const isUrlSafe = (url) => {
  try {
    const parsedUrl = new URL(url)
    
    // Only allow HTTP/HTTPS protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false
    }
    
    // Check if domain is in allowlist
    if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
      return false
    }
    
    // Block private IP ranges
    if (PRIVATE_IP_RANGES.some(range => range.test(parsedUrl.hostname))) {
      return false
    }
    
    return true
  } catch (error) {
    return false
  }
}

/**
 * Make a secure API request with CSRF protection and proper error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
export const secureApiRequest = async (endpoint, options = {}) => {
  const fullUrl = `${API_URL}${endpoint}`
  
  // Validate URL to prevent SSRF
  if (!isUrlSafe(fullUrl)) {
    throw new Error('Invalid or unsafe URL detected')
  }
  
  // Get CSRF token for state-changing requests
  const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method?.toUpperCase())
  const csrfToken = needsCsrf ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') : null
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      ...options.headers
    },
    credentials: 'same-origin'
  }

  const response = await fetch(fullUrl, config)

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