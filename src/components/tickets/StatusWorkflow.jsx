// Ticket Status Workflow Component
// Shows clear status roadmap and allowed transitions

import { useState, useEffect } from 'react'
import { secureApiRequest } from '../../utils/api'

export default function StatusWorkflow({ currentStatus, onStatusChange, userRole, ticketCreatedBy, currentUserId }) {
  const [workflow, setWorkflow] = useState(null)
  const [allowedTransitions, setAllowedTransitions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkflow()
  }, [])

  useEffect(() => {
    if (workflow && currentStatus) {
      fetchAllowedTransitions(currentStatus)
    }
  }, [workflow, currentStatus])

  const fetchWorkflow = async () => {
    try {
      const data = await secureApiRequest('/status/workflow')
      setWorkflow(data)
    } catch (err) {
      console.error('Failed to fetch workflow:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllowedTransitions = async (status) => {
    try {
      const data = await secureApiRequest(`/status/allowed-transitions/${status}`)
      setAllowedTransitions(data.allowed_transitions || [])
    } catch (err) {
      console.error('Failed to fetch transitions:', err)
      setAllowedTransitions([])
    }
  }

  const canUpdateStatus = () => {
    if (!workflow) return false
    
    const permissions = workflow.role_permissions[userRole]
    if (!permissions) return false

    // Normal users can only update their own tickets in New status
    if (userRole === 'Normal User') {
      return ticketCreatedBy === currentUserId && currentStatus === 'New'
    }

    return permissions.can_update.includes(currentStatus)
  }

  if (loading) {
    return <div className="text-gray-500">Loading workflow...</div>
  }

  if (!workflow) {
    return <div className="text-red-500">Failed to load workflow</div>
  }

  const currentStatusInfo = workflow.statuses.find(s => s.name === currentStatus)

  return (
    <div className="space-y-4">
      {/* Current Status Display */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Current Status:</span>
        <span 
          className="px-3 py-1 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: currentStatusInfo?.color || '#6b7280' }}
        >
          {currentStatus}
        </span>
      </div>

      {/* Status Description */}
      {currentStatusInfo && (
        <p className="text-sm text-gray-600">{currentStatusInfo.description}</p>
      )}

      {/* Status Workflow Roadmap */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Status Roadmap</h4>
        <div className="flex items-center gap-2 overflow-x-auto">
          {workflow.statuses.map((status, index) => (
            <div key={status.name} className="flex items-center gap-2 flex-shrink-0">
              <div className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                    status.name === currentStatus ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                  style={{ backgroundColor: status.color }}
                >
                  {status.order}
                </div>
                <span className="text-xs text-gray-600 mt-1 text-center">{status.name}</span>
              </div>
              {index < workflow.statuses.length - 1 && (
                <div className="w-6 h-0.5 bg-gray-300 mt-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Status Change Options */}
      {canUpdateStatus() && allowedTransitions.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Available Actions</h4>
          <div className="flex flex-wrap gap-2">
            {allowedTransitions.map(statusName => {
              const statusInfo = workflow.statuses.find(s => s.name === statusName)
              return (
                <button
                  key={statusName}
                  onClick={() => onStatusChange(statusName)}
                  className="px-3 py-1 rounded text-sm font-medium text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: statusInfo?.color || '#6b7280' }}
                >
                  Move to {statusName}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Permission Info */}
      <div className="text-xs text-gray-500">
        {canUpdateStatus() 
          ? `You can update this ticket status (${userRole})`
          : `Status updates restricted (${userRole})`
        }
      </div>
    </div>
  )
}