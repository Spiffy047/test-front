import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { secureApiRequest } from '../../utils/api'

export default function EmailVerification() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    verifyEmail(token)
  }, [searchParams])

  const verifyEmail = async (token) => {
    try {
      const data = await secureApiRequest('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token })
      })
      
      setStatus('success')
      setMessage('Email verified successfully! You can now log in.')
      setTimeout(() => navigate('/'), 3000)
    } catch (err) {
      console.error('Email verification error:', err)
      setStatus('error')
      setMessage(err.message || 'Network error. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        
        {status === 'verifying' && (
          <div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Verifying your email...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="text-green-600 text-4xl mb-4">[SUCCESS]</div>
            <p className="text-green-600 font-medium">{message}</p>
            <p className="text-sm text-gray-600 mt-2">Redirecting to login...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <div className="text-red-600 text-4xl mb-4">[ERROR]</div>
            <p className="text-red-600 font-medium">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}