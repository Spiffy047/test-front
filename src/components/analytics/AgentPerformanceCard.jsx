import { useEffect, useState } from 'react'

const API_URL = 'https://hotfix.onrender.com/api'

export default function AgentPerformanceCard({ agentId, onCardClick, tickets }) {
  const [performance, setPerformance] = useState(null)

  useEffect(() => {
    if (!agentId) return
    
    fetch(`${API_URL}/analytics/agent-performance-detailed`)
      .then(res => res.json())
      .then(data => {
        const agentData = data.find(a => a.agent_id === agentId)
        setPerformance(agentData)
      })
      .catch(console.error)
  }, [agentId])

  if (!performance) return null

  const ratingColor = 
    performance.performance_rating === 'Excellent' ? 'text-green-600 bg-green-50' :
    performance.performance_rating === 'Good' ? 'text-blue-600 bg-blue-50' :
    performance.performance_rating === 'Average' ? 'text-yellow-600 bg-yellow-50' :
    'text-red-600 bg-red-50'

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">My Performance</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded cursor-pointer hover:shadow-md transition-shadow" onClick={() => onCardClick?.({ title: 'My Active Tickets', data: tickets?.filter(t => t.assigned_to === agentId && t.status !== 'Closed') || [] })}>
          <div className="text-2xl font-bold text-blue-600">{performance.active_tickets}</div>
          <div className="text-xs text-gray-600">Active Tickets</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded cursor-pointer hover:shadow-md transition-shadow" onClick={() => onCardClick?.({ title: 'My Closed Tickets', data: tickets?.filter(t => t.assigned_to === agentId && t.status === 'Closed') || [] })}>
          <div className="text-2xl font-bold text-green-600">{performance.closed_tickets}</div>
          <div className="text-xs text-gray-600">Closed Tickets</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded">
          <div className="text-2xl font-bold text-purple-600">{performance.avg_handle_time}h</div>
          <div className="text-xs text-gray-600">Avg Handle Time</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded cursor-pointer hover:shadow-md transition-shadow" onClick={() => onCardClick?.({ title: 'My SLA Violations', data: tickets?.filter(t => t.assigned_to === agentId && t.sla_violated) || [] })}>
          <div className="text-2xl font-bold text-red-600">{performance.sla_violations}</div>
          <div className="text-xs text-gray-600">SLA Violations</div>
        </div>
      </div>

      <div className={`p-4 rounded-lg ${ratingColor}`}>
        <div className="text-center">
          <div className="text-sm font-medium mb-1">Performance Rating</div>
          <div className="text-2xl font-bold">{performance.performance_rating}</div>
          <div className="text-sm mt-1">Score: {performance.performance_score}</div>
        </div>
      </div>
    </div>
  )
}
