import { useEffect, useState } from 'react'
import { getPerformanceRatingStyles } from '../../utils/styleHelpers'
import { secureApiRequest } from '../../utils/api'


export default function AgentPerformanceCard({ agentId, onCardClick, tickets }) {
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!agentId) return
    
    const fetchPerformance = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await secureApiRequest('/analytics/agent-performance-detailed')
        const agentData = Array.isArray(data) ? data.find(a => a?.agent_id === agentId) : null
        setPerformance(agentData || null)
      } catch (error) {
        console.error('Failed to fetch performance data:', error)
        setError(error.message || 'Failed to load performance data')
        setPerformance(null)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPerformance()
  }, [agentId])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">My Performance</h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading performance data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">My Performance</h3>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 font-medium">Error Loading Data</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
        </div>
      </div>
    )
  }

  if (!performance) return null

  const ratingStyles = getPerformanceRatingStyles(performance?.performance_rating || 'Unknown')

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">My Performance</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded cursor-pointer hover:shadow-md transition-shadow" onClick={() => onCardClick?.({ title: 'My Active Tickets', data: Array.isArray(tickets) ? tickets.filter(t => t?.assigned_to === agentId && t?.status !== 'Closed') : [] })}>
          <div className="text-2xl font-bold text-blue-600">{performance?.active_tickets || 0}</div>
          <div className="text-xs text-gray-600">Active Tickets</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded cursor-pointer hover:shadow-md transition-shadow" onClick={() => onCardClick?.({ title: 'My Closed Tickets', data: Array.isArray(tickets) ? tickets.filter(t => t?.assigned_to === agentId && t?.status === 'Closed') : [] })}>
          <div className="text-2xl font-bold text-green-600">{performance?.closed_tickets || 0}</div>
          <div className="text-xs text-gray-600">Closed Tickets</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded">
          <div className="text-2xl font-bold text-purple-600">{performance?.avg_handle_time || 0}h</div>
          <div className="text-xs text-gray-600">Avg Handle Time</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded cursor-pointer hover:shadow-md transition-shadow" onClick={() => onCardClick?.({ title: 'My SLA Violations', data: Array.isArray(tickets) ? tickets.filter(t => t?.assigned_to === agentId && t?.sla_violated) : [] })}>
          <div className="text-2xl font-bold text-red-600">{performance?.sla_violations || 0}</div>
          <div className="text-xs text-gray-600">SLA Violations</div>
        </div>
      </div>

      <div className={`p-4 rounded-lg ${ratingStyles}`}>
        <div className="text-center">
          <div className="text-sm font-medium mb-1">Performance Rating</div>
          <div className="text-2xl font-bold">{performance?.performance_rating || 'Unknown'}</div>
          <div className="text-sm mt-1">Score: {performance?.performance_score || 0}</div>
        </div>
      </div>
    </div>
  )
}
