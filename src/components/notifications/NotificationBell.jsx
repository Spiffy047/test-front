// Notification bell component with dropdown alerts
import { useState, useEffect } from 'react'
import { secureApiRequest } from '../../utils/api'

export default function NotificationBell({ user, onNotificationClick }) {
  const [alerts, setAlerts] = useState([])  // Recent alerts list
  const [unreadCount, setUnreadCount] = useState(0)  // Badge counter
  const [showDropdown, setShowDropdown] = useState(false)  // Dropdown visibility

  useEffect(() => {
    fetchAlerts()
    fetchUnreadCount()
    
    // Poll for new alerts every 5 seconds for real-time updates
    const interval = setInterval(() => {
      fetchUnreadCount()
      fetchAlerts()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [user.id])

  const fetchAlerts = async () => {
    try {
      const data = await secureApiRequest(`/alerts/${user.id}`)
      setAlerts(Array.isArray(data) ? data.slice(0, 10) : [])
    } catch (err) {
      if (err.message.includes('404')) {
        setAlerts([])
      } else {
        console.error('Failed to fetch alerts:', err)
        setAlerts([])
      }
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const data = await secureApiRequest(`/alerts/${user.id}/count`)
      setUnreadCount(data.count || 0)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
      setUnreadCount(0)
    }
  }

  const markAsRead = async (alertId) => {
    try {
      await secureApiRequest(`/alerts/${alertId}/read`, { 
        method: 'PUT'
      })
      fetchAlerts()
      fetchUnreadCount()
    } catch (err) {
      console.error('Failed to mark alert as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await secureApiRequest(`/alerts/${user.id}/read-all`, { 
        method: 'PUT'
      })
      fetchAlerts()
      fetchUnreadCount()
      setShowDropdown(false)
    } catch (err) {
      console.error('Failed to mark all alerts as read:', err)
    }
  }

  // Alert type to icon mapping
  const ALERT_ICONS = {
    'sla_violation': '!',
    'ticket_created': '#', 
    'assignment': '@',
    'status_change': '~',
    'new_message': '*'
  }
  
  const getAlertIcon = (alertType) => ALERT_ICONS[alertType] || '•'

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2 rounded-full min-w-[40px] h-10 flex items-center justify-center font-semibold text-sm transition-colors ${
          unreadCount > 0 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`}
      >
        {unreadCount > 9 ? '9+' : unreadCount}
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
                  onClick={async () => {
                    if (!alert.is_read) await markAsRead(alert.id)
                    setShowDropdown(false)
                    if (onNotificationClick && alert.ticket_id) {
                      onNotificationClick(alert.ticket_id, alert.alert_type)
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg" role="img" aria-label={alert.alert_type}>
                      {getAlertIcon(alert.alert_type)}
                    </span>
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