import { useState } from 'react'
import NormalUserDashboard from './components/dashboards/NormalUserDashboard'
import TechnicalUserDashboard from './components/dashboards/TechnicalUserDashboard'
import TechnicalSupervisorDashboard from './components/dashboards/TechnicalSupervisorDashboard'
import SystemAdminDashboard from './components/dashboards/SystemAdminDashboard'

const API_URL = 'https://hotfix.onrender.com/api'

function App() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      console.log('Login response:', data) // Debug log
      
      if (response.ok && (data.success || data.access_token)) {
        setUser(data.user)
        localStorage.setItem('token', data.access_token || data.token)
      } else {
        throw new Error(data.message || 'Invalid email or password')
      }
    } catch (err) {
      console.error('Login error:', err) // Debug log
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Cannot connect to server. Please check your internet connection or try again later.')
      } else {
        setError(err.message || 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setEmail('')
    setPassword('')
    localStorage.removeItem('token')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Hotfix</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
              <p className="font-medium text-blue-900 mb-2">Demo Credentials:</p>
              <div className="grid grid-cols-2 gap-2 text-blue-800">
                <div>
                  <p className="font-medium">Admin:</p>
                  <p className="text-xs">admin@company.com</p>
                </div>
                <div>
                  <p className="font-medium">Agent:</p>
                  <p className="text-xs">agent@company.com</p>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-2">Password: password123</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@company.com')
                setPassword('password123')
              }}
              className="text-sm text-blue-600 hover:text-blue-800 mr-4"
            >
              Fill Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('agent@company.com')
                setPassword('password123')
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Fill Agent
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Route to appropriate dashboard based on role
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

export default App
