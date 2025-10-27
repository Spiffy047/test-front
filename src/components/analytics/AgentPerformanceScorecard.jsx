import { useEffect, useState } from 'react'

const API_URL = 'https://hotfix.onrender.com/api'

export default function AgentPerformanceScorecard() {
  const [agents, setAgents] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/analytics/agent-performance-detailed`)
      .then(res => res.json())
      .then(setAgents)
      .catch(console.error)
  }, [])

  const getRatingColor = (rating) => {
    switch(rating) {
      case 'Excellent': return 'bg-green-100 text-green-800'
      case 'Good': return 'bg-blue-100 text-blue-800'
      case 'Average': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Agent Performance Scorecard</h3>
      <div className="space-y-4">
        {agents.map(agent => (
          <div key={agent.agent_id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                <p className="text-sm text-gray-600">{agent.email}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRatingColor(agent.performance_rating)}`}>
                {agent.performance_rating}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Active</div>
                <div className="font-semibold text-lg">{agent.active_tickets}</div>
              </div>
              <div>
                <div className="text-gray-600">Closed</div>
                <div className="font-semibold text-lg">{agent.closed_tickets}</div>
              </div>
              <div>
                <div className="text-gray-600">Avg Time</div>
                <div className="font-semibold text-lg">{agent.avg_handle_time.toFixed(1)}h</div>
              </div>
              <div>
                <div className="text-gray-600">Violations</div>
                <div className="font-semibold text-lg text-red-600">{agent.sla_violations}</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="text-sm text-gray-600">Performance Score: <span className="font-semibold text-gray-900">{agent.performance_score}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
