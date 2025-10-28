import { useState, useEffect } from 'react'

// Notification type configurations
const NOTIFICATION_CONFIGS = {
  'sla_breach': {
    style: 'bg-red-500 border-red-600',
    icon: '!'
  },
  'ticket_assigned': {
    style: 'bg-blue-500 border-blue-600', 
    icon: 'A'
  },
  'ticket_updated': {
    style: 'bg-green-500 border-green-600',
    icon: 'U'
  },
  'new_ticket': {
    style: 'bg-purple-500 border-purple-600',
    icon: 'N'
  },
  'default': {
    style: 'bg-gray-500 border-gray-600',
    icon: 'i'
  }
}

const AUTO_CLOSE_DELAY = 5000
const FADE_OUT_DELAY = 300

export default function ToastNotification({ notification, onClose }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!onClose) return
    
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, FADE_OUT_DELAY)
    }, AUTO_CLOSE_DELAY)

    return () => clearTimeout(timer)
  }, [onClose])

  const getNotificationConfig = (type) => {
    return NOTIFICATION_CONFIGS[type] || NOTIFICATION_CONFIGS.default
  }

  if (!isVisible || !notification) return null

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`${getNotificationConfig(notification?.type).style} text-white p-4 rounded-lg shadow-lg border-l-4 max-w-sm`}>
        <div className="flex items-start gap-3">
          <span className="text-lg">{getNotificationConfig(notification?.type).icon}</span>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-sm">
                {notification.title || 'Notification'}
              </h4>
              <button
                onClick={() => {
                  setIsVisible(false)
                  if (onClose) setTimeout(onClose, FADE_OUT_DELAY)
                }}
                className="text-white hover:text-gray-200 ml-2"
              >
                ×
              </button>
            </div>
            <p className="text-sm mt-1 opacity-90">
              {notification?.message || 'No message'}
            </p>
            {notification?.ticket_id && (
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