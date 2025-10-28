// Notification bell component with dropdown alerts
import { useState, useEffect } from 'react'
import { API_CONFIG } from '../../config/api'

const API_URL = API_CONFIG.BASE_URL

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
        if (response.status !== 404) {
          console.warn(`Failed to load alerts: ${response.status}`)
        }
        setAlerts([])
        return
      }
      const text = await response.text()
      if (!text) {
        setAlerts([])
        return
      }
      const data = JSON.parse(text)
      setAlerts(Array.isArray(data) ? data.slice(0, 10) : [])
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
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
      console.error('Failed to fetch unread count:', err)
      setUnreadCount(0)
    }
  }

  const markAsRead = async (alertId) => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      const response = await fetch(`${API_URL}/alerts/${alertId}/read`, { 
        method: 'PUT',
        headers: {
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        },
        credentials: 'same-origin'
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      fetchAlerts()
      fetchUnreadCount()
    } catch (err) {
      console.error('Failed to mark alert as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      const response = await fetch(`${API_URL}/alerts/${user.id}/read-all`, { 
        method: 'PUT',
        headers: {
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        },
        credentials: 'same-origin'
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      fetchAlerts()
      fetchUnreadCount()
      setShowDropdown(false)
    } catch (err) {
      console.error('Failed to mark all alerts as read:', err)
    }
  }

  // Alert type to icon mapping
  const ALERT_ICONS = {
    'sla_violation': '⚠️',
    'ticket_created': '🎫', 
    'assignment': '👤',
    'status_change': '🔄',
    'new_message': '💬'
  }
  
  const getAlertIcon = (alertType) => ALERT_ICONS[alertType] || '🔔'

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