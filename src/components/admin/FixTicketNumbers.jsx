import { useState } from 'react'
import { secureApiRequest } from '../../utils/api'

export default function FixTicketNumbers() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const fixTicketNumbers = async () => {
    setLoading(true)
    try {
      const response = await secureApiRequest('/admin/fix-ticket-numbering', {
        method: 'POST'
      })
      setResult(response)
    } catch (err) {
      setResult({ success: false, error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Fix Ticket Numbering</h3>
      <p className="text-gray-600 mb-4">
        This will update all tickets to use the TKT-XXXX format (TKT-1001, TKT-1002, etc.)
      </p>
      
      <button
        onClick={fixTicketNumbers}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Fixing...' : 'Fix Ticket Numbers'}
      </button>

      {result && (
        <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {result.success ? (
            <div>
              <p className="font-medium"> Success!</p>
              <p>{result.message}</p>
              <p>Tickets updated: {result.tickets_updated}</p>
            </div>
          ) : (
            <div>
              <p className="font-medium"> Error</p>
              <p>{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}