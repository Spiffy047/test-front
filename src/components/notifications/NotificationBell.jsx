// Notification bell component with dropdown alerts
import { useState, useEffect } from 'react'

const API_URL = 'https://hotfix.onrender.com/api'

export default function NotificationBell({ user, onNotificationClick }) {
  const [alerts, setAlerts] = useState([])  // Recent alerts list
  const [unreadCount, setUnreadCount] = useState(0)  // Badge counter
  const [showDropdown, setShowDropdown] = useState(false)  // Dropdown visibility

  useEffect(() => {
    fetchAlerts()
    fetchUnreadCount()
    
    // Poll for new alerts every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [user.id])

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${API_URL}/alerts/${user.id}`)
      if (!response.ok) {
        setAlerts([])
        return
      }
      const text = await response.text()
      if (!text) {
        setAlerts([])
        return
      }
      const data = JSON.parse(text)
      setAlerts(data.slice(0, 10)) // Show latest 10
    } catch (err) {
      setAlerts([])
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${API_URL}/alerts/${user.id}/count`)
      if (!response.ok) {
        setUnreadCount(0)
        return
      }
      const text = await response.text()
      if (!text) {
        setUnreadCount(0)
        return
      }
      const data = JSON.parse(text)
      setUnreadCount(data.count || 0)
    } catch (err) {
      setUnreadCount(0)
    }
  }

  const markAsRead = async (alertId) => {
    try {
      await fetch(`${API_URL}/alerts/${alertId}/read`, { method: 'PUT' })
      fetchAlerts()
      fetchUnreadCount()
    } catch (err) {
      console.error('Failed to mark alert as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_URL}/alerts/${user.id}/read-all`, { method: 'PUT' })
      fetchAlerts()
      fetchUnreadCount()
      setShowDropdown(false)
    } catch (err) {
      console.error('Failed to mark all alerts as read:', err)
    }
  }

  // Get appropriate icon for each alert type
  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case 'sla_violation': return   // SLA breach
      case 'ticket_created': return   // New ticket
      case 'assignment': return   // Ticket assigned
      case 'status_change': return   // Status update
      case 'new_message': return   // Chat message
      default: return   // Generic notification
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <span className="text-xl"></span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    !alert.is_read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (!alert.is_read) markAsRead(alert.id)
                    if (onNotificationClick && alert.ticket_id) {
                      onNotificationClick(alert.ticket_id, alert.alert_type)
                    }
                    setShowDropdown(false)
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getAlertIcon(alert.alert_type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {alert.title}
                        </p>
                        {!alert.is_read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {alerts.length > 0 && (
            <div className="p-3 border-t text-center">
              <button
                onClick={() => setShowDropdown(false)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}

      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}