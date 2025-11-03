import { useEffect, useState } from 'react'
import { getPerformanceRatingStyles } from '../../utils/styleHelpers'
import { apiRequest } from '../../utils/simpleApi'
export default function AgentPerformanceScorecard() {

  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)


  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiRequest('/analytics/agent-performance-detailed')
        setAgents(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch agent performance data:', error)
        setError(error.message || 'Failed to load agent performance data')
        setAgents([])
      } finally {
        setLoading(false)
      }
    }
    fetchAgentData()
  }, [])



  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Agent Performance Scorecard</h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading agent performance data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Agent Performance Scorecard</h3>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 font-medium">Error Loading Data</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
        </div>
      </div>
    )
  }

  return (

    <div className="bg-white rounded-lg shadow p-6">

      <h3 className="text-lg font-semibold mb-4">Agent Performance Scorecard</h3>
      

      <div className="space-y-4">

        {Array.isArray(agents) && agents.length > 0 ? agents.map(agent => (

          <div key={agent?.agent_id || 'unknown'} className="border rounded-lg p-4">

            <div className="flex justify-between items-start mb-3">

              <div>
                <h4 className="font-semibold text-gray-900">{agent?.name || 'Unknown Agent'}</h4>
                <p className="text-sm text-gray-600">{agent?.email || 'No email'}</p>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPerformanceRatingStyles(agent?.performance_rating)}`}>
                {agent?.performance_rating || 'Unknown'}
              </span>
            </div>
            

            <div className="grid grid-cols-4 gap-4 text-sm">

              <div>
                <div className="text-gray-600">Active</div>
                <div className="font-semibold text-lg">{agent?.active_tickets || 0}</div>
              </div>

              <div>
                <div className="text-gray-600">Closed</div>
                <div className="font-semibold text-lg">{agent?.closed_tickets || 0}</div>
              </div>

              <div>
                <div className="text-gray-600">Avg Time</div>
                <div className="font-semibold text-lg">{(typeof agent?.avg_handle_time === 'number' && !isNaN(agent.avg_handle_time) ? agent.avg_handle_time : 0).toFixed(1)}h</div>
              </div>

              <div>
                <div className="text-gray-600">Violations</div>
                <div className="font-semibold text-lg text-red-600">{agent?.sla_violations || 0}</div>
              </div>
            </div>
            

            <div className="mt-3 pt-3 border-t">
              <div className="text-sm text-gray-600">
                Performance Score: <span className="font-semibold text-gray-900">{agent?.performance_score || 0}</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center text-gray-500 py-8">
            No agent performance data available
          </div>
        )}
      </div>
    </div>
  )
}
