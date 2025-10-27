import { useState, useEffect } from 'react'

export default function ToastNotification({ notification, onClose }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for fade out animation
    }, 5000) // Auto-close after 5 seconds

    return () => clearTimeout(timer)
  }, [onClose])

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'sla_breach':
        return 'bg-red-500 border-red-600'
      case 'ticket_assigned':
        return 'bg-blue-500 border-blue-600'
      case 'ticket_updated':
        return 'bg-green-500 border-green-600'
      case 'new_ticket':
        return 'bg-purple-500 border-purple-600'
      default:
        return 'bg-gray-500 border-gray-600'
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'sla_breach': return '⚠️'
      case 'ticket_assigned': return '👤'
      case 'ticket_updated': return '🔄'
      case 'new_ticket': return '🎫'
      default: return '🔔'
    }
  }

  if (!isVisible) return null

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`${getNotificationStyle(notification.type)} text-white p-4 rounded-lg shadow-lg border-l-4 max-w-sm`}>
        <div className="flex items-start gap-3">
          <span className="text-lg">{getIcon(notification.type)}</span>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-sm">
                {notification.title || 'Notification'}
              </h4>
              <button
                onClick={() => {
                  setIsVisible(false)
                  setTimeout(onClose, 300)
                }}
                className="text-white hover:text-gray-200 ml-2"
              >
                ✕
              </button>
            </div>
            <p className="text-sm mt-1 opacity-90">
              {notification.message}
            </p>
            {notification.ticket_id && (
              <p className="text-xs mt-2 opacity-75">
                Ticket: {notification.ticket_id}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}