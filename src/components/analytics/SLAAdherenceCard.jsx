import { useEffect, useState } from 'react'
import { API_CONFIG } from '../../config/api'

const API_URL = API_CONFIG.BASE_URL

export default function SLAAdherenceCard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchSlaData = async () => {
      try {
        const res = await fetch(`${API_URL}/tickets/analytics/sla-adherence?t=${Date.now()}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setData(data || {})
      } catch (error) {
        console.error('Failed to fetch SLA adherence data:', error)
        setData({})
      }
    }
    fetchSlaData()
  }, [])

  if (!data || Object.keys(data).length === 0) return <div className="bg-white rounded-lg shadow p-6">Loading...</div>

  const percentage = data?.sla_adherence || 0
  const color = percentage >= 90 ? 'green' : percentage >= 75 ? 'yellow' : 'red'

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">SLA Adherence</h3>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-4xl font-bold text-gray-900">{(typeof percentage === 'number' ? percentage : 0).toFixed(1)}%</div>
          <div className="text-sm text-gray-600 mt-1">
            {data?.on_time || 0} of {data?.total_tickets || 0} tickets met SLA
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
            {(typeof percentage === 'number' ? percentage : 0).toFixed(0)}%
          </span>
        </div>
      </div>
      {(data?.violations || 0) > 0 && (
        <div className="mt-4 p-3 bg-red-50 rounded-md text-sm text-red-800">
          {data?.violations || 0} ticket{(data?.violations || 0) !== 1 ? 's' : ''} violated SLA
        </div>
      )}
    </div>
  )
}
