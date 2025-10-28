import { useState } from 'react'
import { secureApiRequest } from '../../utils/api'

export default function RecreateTickets() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const handleRecreateTickets = async () => {
    if (!confirm('This will DELETE all existing tickets and create new sample data. Are you sure?')) {
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const data = await secureApiRequest('/admin/recreate-tickets', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'recreate-tickets-action'
        },
        credentials: 'same-origin'
      })

      setMessage(`Success: ${data.message}. Created ${data.tickets_created} tickets.`)
      setMessageType('success')
    } catch (error) {
      setMessage(`Error: ${error.message}`)
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Recreate Tickets Data</h3>
      <p className="text-gray-600 mb-4">
        This will delete all existing tickets and create new sample data with proper TKT-XXXX numbering.
      </p>
      
      <button
        onClick={handleRecreateTickets}
        disabled={isLoading}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
      >
        {isLoading ? 'Recreating...' : 'Recreate All Tickets'}
      </button>

      {message && (
        <div className={`mt-4 p-3 rounded ${
          messageType === 'success' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}