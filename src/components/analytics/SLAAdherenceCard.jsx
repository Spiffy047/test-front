import { useEffect, useState } from 'react'

const API_URL = 'https://hotfix.onrender.com/api'

export default function SLAAdherenceCard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/tickets/analytics/sla-adherence`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
  }, [])

  if (!data) return <div className="bg-white rounded-lg shadow p-6">Loading...</div>

  const percentage = data.adherence_percentage || 0
  const color = percentage >= 90 ? 'green' : percentage >= 75 ? 'yellow' : 'red'

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">SLA Adherence</h3>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-4xl font-bold text-gray-900">{percentage.toFixed(1)}%</div>
          <div className="text-sm text-gray-600 mt-1">
            {data.met_sla} of {data.total_tickets} tickets met SLA
          </div>
        </div>
        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
          color === 'green' ? 'bg-green-100' :
          color === 'yellow' ? 'bg-yellow-100' : 'bg-red-100'
        }`}>
          <span className={`text-2xl font-bold ${
            color === 'green' ? 'text-green-600' :
            color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {percentage >= 90 ? '✓' : percentage >= 75 ? '!' : '✗'}
          </span>
        </div>
      </div>
      {data.violated_sla > 0 && (
        <div className="mt-4 p-3 bg-red-50 rounded-md text-sm text-red-800">
          {data.violated_sla} ticket{data.violated_sla !== 1 ? 's' : ''} violated SLA
        </div>
      )}
    </div>
  )
}
