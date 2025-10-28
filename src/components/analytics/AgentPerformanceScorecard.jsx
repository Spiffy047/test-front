// Import React hooks for state management and lifecycle
import { useEffect, useState } from 'react'

// API base URL for backend communication
const API_URL = 'https://hotfix.onrender.com/api'

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
    // API call to get detailed agent performance metrics
    fetch(`${API_URL}/analytics/agent-performance-detailed`)
      .then(res => res.json()) // Parse JSON response
      .then(setAgents) // Update agents state with fetched data
      .catch(console.error) // Log any errors to console
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
        {agents.map(agent => (
          // Individual agent performance card
          <div key={agent.agent_id} className="border rounded-lg p-4">
            {/* Agent header with name, email, and performance rating */}
            <div className="flex justify-between items-start mb-3">
              {/* Agent basic info */}
              <div>
                <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                <p className="text-sm text-gray-600">{agent.email}</p>
              </div>
              {/* Performance rating badge with dynamic color */}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRatingColor(agent.performance_rating)}`}>
                {agent.performance_rating}
              </span>
            </div>
            
            {/* Performance metrics grid - 4 columns */}
            <div className="grid grid-cols-4 gap-4 text-sm">
              {/* Active tickets count */}
              <div>
                <div className="text-gray-600">Active</div>
                <div className="font-semibold text-lg">{agent.active_tickets}</div>
              </div>
              {/* Closed tickets count */}
              <div>
                <div className="text-gray-600">Closed</div>
                <div className="font-semibold text-lg">{agent.closed_tickets}</div>
              </div>
              {/* Average handle time in hours */}
              <div>
                <div className="text-gray-600">Avg Time</div>
                <div className="font-semibold text-lg">{agent.avg_handle_time.toFixed(1)}h</div>
              </div>
              {/* SLA violations count (highlighted in red) */}
              <div>
                <div className="text-gray-600">Violations</div>
                <div className="font-semibold text-lg text-red-600">{agent.sla_violations}</div>
              </div>
            </div>
            
            {/* Performance score section with top border */}
            <div className="mt-3 pt-3 border-t">
              <div className="text-sm text-gray-600">
                Performance Score: <span className="font-semibold text-gray-900">{agent.performance_score}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
