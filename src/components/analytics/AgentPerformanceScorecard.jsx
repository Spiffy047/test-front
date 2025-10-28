// Import React hooks for state management and lifecycle
import { useEffect, useState } from 'react'
import { API_CONFIG } from '../../config/api'

// API base URL for backend communication
const API_URL = API_CONFIG.BASE_URL

/**
 * AgentPerformanceScorecard Component
 * Displays detailed performance metrics for all technical agents
 * Shows active tickets, closed tickets, average handle time, and SLA violations
 */
export default function AgentPerformanceScorecard() {
  // State to store array of agent performance data
  const [agents, setAgents] = useState([])

  // Fetch agent performance data on component mount
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const res = await fetch(`${API_URL}/analytics/agent-performance-detailed`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setAgents(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch agent performance data:', error)
        setAgents([])
      }
    }
    fetchAgentData()
  }, []) // Empty dependency array - runs only once on mount

  /**
   * Get Tailwind CSS classes for performance rating badge colors
   * @param {string} rating - Performance rating (Excellent, Good, Average, etc.)
   * @returns {string} Tailwind CSS classes for background and text color
   */
  const getRatingColor = (rating) => {
    switch(rating) {
      case 'Excellent': return 'bg-green-100 text-green-800' // Green for excellent
      case 'Good': return 'bg-blue-100 text-blue-800' // Blue for good
      case 'Average': return 'bg-yellow-100 text-yellow-800' // Yellow for average
      default: return 'bg-red-100 text-red-800' // Red for poor performance
    }
  }

  return (
    // Main container with white background, rounded corners, and shadow
    <div className="bg-white rounded-lg shadow p-6">
      {/* Component title */}
      <h3 className="text-lg font-semibold mb-4">Agent Performance Scorecard</h3>
      
      {/* Container for agent cards with vertical spacing */}
      <div className="space-y-4">
        {/* Map through agents array to render individual performance cards */}
        {Array.isArray(agents) && agents.length > 0 ? agents.map(agent => (
          // Individual agent performance card
          <div key={agent?.agent_id || 'unknown'} className="border rounded-lg p-4">
            {/* Agent header with name, email, and performance rating */}
            <div className="flex justify-between items-start mb-3">
              {/* Agent basic info */}
              <div>
                <h4 className="font-semibold text-gray-900">{agent?.name || 'Unknown Agent'}</h4>
                <p className="text-sm text-gray-600">{agent?.email || 'No email'}</p>
              </div>
              {/* Performance rating badge with dynamic color */}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRatingColor(agent?.performance_rating)}`}>
                {agent?.performance_rating || 'Unknown'}
              </span>
            </div>
            
            {/* Performance metrics grid - 4 columns */}
            <div className="grid grid-cols-4 gap-4 text-sm">
              {/* Active tickets count */}
              <div>
                <div className="text-gray-600">Active</div>
                <div className="font-semibold text-lg">{agent?.active_tickets || 0}</div>
              </div>
              {/* Closed tickets count */}
              <div>
                <div className="text-gray-600">Closed</div>
                <div className="font-semibold text-lg">{agent?.closed_tickets || 0}</div>
              </div>
              {/* Average handle time in hours */}
              <div>
                <div className="text-gray-600">Avg Time</div>
                <div className="font-semibold text-lg">{(agent?.avg_handle_time || 0).toFixed(1)}h</div>
              </div>
              {/* SLA violations count (highlighted in red) */}
              <div>
                <div className="text-gray-600">Violations</div>
                <div className="font-semibold text-lg text-red-600">{agent?.sla_violations || 0}</div>
              </div>
            </div>
            
            {/* Performance score section with top border */}
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
