// Import React hooks for state management
import { useState, useEffect } from 'react'
// Import React Router components for client-side routing
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
// Import React Hook Form for form validation and handling
import { useForm } from 'react-hook-form'
// Import role-specific dashboard components
import NormalUserDashboard from './components/dashboards/NormalUserDashboard'
import TechnicalUserDashboard from './components/dashboards/TechnicalUserDashboard'
import TechnicalSupervisorDashboard from './components/dashboards/TechnicalSupervisorDashboard'
import SystemAdminDashboard from './components/dashboards/SystemAdminDashboard'
// Import email verification component for 2-step authentication
import EmailVerification from './components/auth/EmailVerification'
import FixTicketNumbers from './components/admin/FixTicketNumbers'
import { API_CONFIG } from './config/api'
import { secureApiRequest } from './utils/api'

// Backend API base URL for all API calls
const API_URL = API_CONFIG.BASE_URL

/**
 * Main App Component
 * Handles authentication, routing, and role-based dashboard rendering
 * Shows login form when user is not authenticated, otherwise shows appropriate dashboard
 */
function App() {
  // State to store authenticated user data (null when not logged in)
  const [user, setUser] = useState(null)
  // State to store login error messages
  const [error, setError] = useState('')
  // State to track login loading status
  const [loading, setLoading] = useState(false)
  // State to track initial auth check
  const [authChecked, setAuthChecked] = useState(false)
  
  // React Hook Form setup for login form validation and handling
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          // Validate token with backend
          const userData = await secureApiRequest('/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (userData && userData.id) {
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
          } else {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
        } catch (err) {
          console.error('Auth check failed:', err)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setAuthChecked(true)
    }
    checkAuth()
  }, [])

  /**
   * Handle user login authentication
   * @param {Object} formData - Form data containing email and password
   */
  const handleLogin = async (formData) => {
    // Set loading state and clear any previous errors
    setLoading(true)
    setError('')

    try {
      // Make API call to authenticate user using secure wrapper
      const responseData = await secureApiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      
      // Check if login was successful
      if (responseData?.success || responseData?.access_token) {
        // Store user data in state and localStorage
        const userData = responseData?.user || null
        setUser(userData)
        localStorage.setItem('token', responseData?.access_token || responseData?.token || '')
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        // Throw error with server message or default message
        throw new Error(responseData?.message || 'Invalid email or password')
      }
    } catch (err) {
      // Handle different types of errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        // Network/connection error
        setError('Cannot connect to server. Please check your internet connection or try again later.')
      } else {
        // Authentication or other errors
        setError(err.message || 'Login failed')
      }
    } finally {
      // Always clear loading state when done
      setLoading(false)
    }
  }

  /**
   * Handle user logout
   * Clears user state, resets form, and removes JWT token
   */
  const handleLogout = () => {
    setUser(null) // Clear user data
    reset() // Reset login form
    localStorage.removeItem('token') // Remove JWT token
    localStorage.removeItem('user') // Remove user data
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Hotfix</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>
          
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="your.email@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Route to appropriate dashboard based on role with React Router
  const getDashboardComponent = () => {
    if (!user?.role) return <NormalUserDashboard user={user} onLogout={handleLogout} />
    
    switch (user.role) {
      case 'Normal User':
        return <NormalUserDashboard user={user} onLogout={handleLogout} />
      case 'Technical User':
        return <TechnicalUserDashboard user={user} onLogout={handleLogout} />
      case 'Technical Supervisor':
        return <TechnicalSupervisorDashboard user={user} onLogout={handleLogout} />
      case 'System Admin':
        return <SystemAdminDashboard user={user} onLogout={handleLogout} />
      default:
        return <NormalUserDashboard user={user} onLogout={handleLogout} />
    }
  }

  return (
    <Router>
      <Routes>
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/dashboard/*" element={getDashboardComponent()} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
