/**
 * Secure API utility functions for IT ServiceDesk frontend
 * 
 * This module provides secure API communication with the backend, including:
 * - CSRF (Cross-Site Request Forgery) protection for state-changing requests
 * - SSRF (Server-Side Request Forgery) prevention through URL validation
 * - Comprehensive error handling with user-friendly messages
 * - Domain allowlisting to prevent malicious API calls
 * - Private IP range blocking for security
 * 
 * Security Features:
 * - URL validation against allowed domains
 * - CSRF token inclusion for POST/PUT/DELETE requests
 * - Private IP range blocking (127.x.x.x, 10.x.x.x, 192.168.x.x, etc.)
 * - Proper error parsing and handling
 * - Same-origin credential policy
 */

import { API_CONFIG } from '../config/api'

// Base API URL from configuration
const API_URL = API_CONFIG.BASE_URL

/**
 * Get list of allowed domains for API calls (SSRF prevention)
 * 
 * Only requests to these domains will be allowed, preventing
 * malicious requests to internal services or external sites.
 * 
 * @returns {string[]} Array of allowed hostnames
 */
const getAllowedDomains = () => {
  try {
    return [
      new URL(API_CONFIG.BASE_URL).hostname,  // Production API domain
      'localhost',    // Local development
      '127.0.0.1'     // Local loopback
    ]
  } catch (error) {
    console.error('Failed to parse API base URL:', error)
    // Fallback to safe defaults if config is invalid
    return ['localhost', '127.0.0.1']
  }
}

/**
 * Private IP address ranges to block (SSRF prevention)
 * 
 * These regex patterns match private/internal IP ranges that should
 * not be accessible from the frontend to prevent SSRF attacks.
 * 
 * Blocked ranges:
 * - 127.0.0.0/8 (loopback)
 * - 10.0.0.0/8 (private class A)
 * - 172.16.0.0/12 (private class B)
 * - 192.168.0.0/16 (private class C)
 * - 169.254.0.0/16 (link-local)
 */
const PRIVATE_IP_RANGES = [
  /^127\./,           // 127.0.0.0/8 - loopback addresses
  /^10\./,            // 10.0.0.0/8 - private class A network
  /^172\.(1[6-9]|2[0-9]|3[01])\./,  // 172.16.0.0/12 - private class B network
  /^192\.168\./,      // 192.168.0.0/16 - private class C network
  /^169\.254\./,      // 169.254.0.0/16 - link-local addresses
]

/**
 * Validate URL to prevent SSRF (Server-Side Request Forgery) attacks
 * 
 * Performs multiple security checks:
 * 1. Protocol validation (only HTTP/HTTPS allowed)
 * 2. Domain allowlisting (only approved domains)
 * 3. Private IP range blocking (prevent internal network access)
 * 
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is safe to request
 */
const isUrlSafe = (url) => {
  try {
    const parsedUrl = new URL(url)
    
    // Security check 1: Only allow HTTP/HTTPS protocols
    // Blocks file://, ftp://, javascript:, data:, etc.
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      console.warn('Blocked non-HTTP protocol:', parsedUrl.protocol)
      return false
    }
    
    // Security check 2: Domain must be in allowlist
    const allowedDomains = getAllowedDomains()
    if (!allowedDomains.includes(parsedUrl.hostname)) {
      console.warn('Blocked non-allowlisted domain:', parsedUrl.hostname)
      return false
    }
    
    // Security check 3: Block private IP address ranges
    if (PRIVATE_IP_RANGES.some(range => range.test(parsedUrl.hostname))) {
      console.warn('Blocked private IP range:', parsedUrl.hostname)
      return false
    }
    
    return true
  } catch (error) {
    // Invalid URL format
    console.error('URL validation error:', error)
    return false
  }
}

/**
 * Make a secure API request with comprehensive security measures
 * 
 * Features:
 * - SSRF prevention through URL validation
 * - CSRF protection for state-changing requests
 * - Proper error handling with JSON parsing safety
 * - Same-origin credential policy
 * - Comprehensive logging for security events
 * 
 * @param {string} endpoint - API endpoint path (e.g., '/tickets', '/users/123')
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 * @param {string} [options.method='GET'] - HTTP method
 * @param {string|FormData} [options.body] - Request body
 * @param {Object} [options.headers] - Additional headers
 * @returns {Promise<Object>} Parsed JSON response data
 * @throws {Error} On network errors, HTTP errors, or security violations
 */
export const secureApiRequest = async (endpoint, options = {}) => {
  // Construct full URL from base URL and endpoint
  const fullUrl = `${API_URL}${endpoint}`
  
  // Security validation: Prevent SSRF attacks
  if (!isUrlSafe(fullUrl)) {
    console.error('🚨 SSRF attempt blocked:', fullUrl)
    throw new Error('Invalid or unsafe URL detected')
  }
  
  // CSRF Protection: Add token for state-changing requests
  const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method?.toUpperCase())
  const csrfToken = needsCsrf ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') : null
  
  // Get JWT token for authentication
  const token = localStorage.getItem('token')
  
  // Build secure request configuration
  const config = {
    ...options,
    headers: {
      // Only add Content-Type for non-FormData requests
      ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
      // Add JWT token for authentication
      ...(token && { 'Authorization': `Bearer ${token}` }),
      // Add CSRF token for state-changing requests
      ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      // Preserve any additional headers from caller
      ...options.headers
    },
    // Use same-origin credentials policy for security
    credentials: 'same-origin'
  }

  // Execute the HTTP request
  const response = await fetch(fullUrl, config)

  // Handle HTTP error responses
  if (!response.ok) {
    let errorData = {}
    try {
      // Attempt to parse error response as JSON
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json()
      }
    } catch (parseError) {
      // Non-JSON error response (HTML error pages, etc.)
      console.warn('Failed to parse error response as JSON:', parseError)
    }
    
    // Throw descriptive error with server message or HTTP status
    const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
    throw new Error(errorMessage)
  }

  // Parse successful response
  let data = {}
  try {
    // Only attempt JSON parsing if response indicates JSON content
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    }
  } catch (parseError) {
    // Handle malformed JSON responses gracefully
    console.warn('Failed to parse response as JSON:', parseError)
    // Return empty object rather than throwing error
  }

  return data
}

// Export API URL for use in other modules
export { API_URL }