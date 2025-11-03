import { useEffect, useState } from 'react'
import { getSLAAdherenceColors } from '../../utils/styleHelpers'
import { apiRequest } from '../../utils/simpleApi'

export default function SLAAdherenceCard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSlaData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiRequest('/tickets/analytics/sla-adherence')
        setData(data || {})
      } catch (error) {
        console.error('Failed to fetch SLA adherence data:', error)
        setError(error.message || 'Failed to load SLA data')
        setData({})
      } finally {
        setLoading(false)
      }
    }
    fetchSlaData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">SLA Adherence</h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading SLA data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">SLA Adherence</h3>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 font-medium">Error Loading Data</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
        </div>
      </div>
    )
  }

  const percentage = data?.sla_adherence || 0
  const colors = getSLAAdherenceColors(percentage)

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
        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${colors.background}`}>
          <span className={`text-2xl font-bold ${colors.text}`}>
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
