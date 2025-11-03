// Utility functions for common styling patterns

/**
 * Get CSS classes for ticket priority badges
 * @param {string} priority - Priority level (Critical, High, Medium, Low)
 * @returns {string} CSS classes for priority styling
 */
export const getPriorityStyles = (priority) => {
  const priorityMap = {
    'Critical': 'bg-red-100 text-red-800',
    'High': 'bg-orange-100 text-orange-800', 
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Low': 'bg-gray-100 text-gray-800'
  }
  return priorityMap[priority] || 'bg-gray-100 text-gray-800'
}

/**
 * Get CSS classes for ticket status badges
 * @param {string} status - Status (Closed, Open, Pending, etc.)
 * @returns {string} CSS classes for status styling
 */
export const getStatusStyles = (status) => {
  const statusMap = {
    'Closed': 'bg-gray-100 text-gray-800',
    'Open': 'bg-green-100 text-green-800',
    'New': 'bg-green-100 text-green-800', // Treat New same as Open
    'Pending': 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800'
  }
  return statusMap[status] || 'bg-blue-100 text-blue-800'
}

/**
 * Get CSS classes for user role badges
 * @param {string} role - User role
 * @returns {string} CSS classes for role styling
 */
export const getRoleStyles = (role) => {
  const roleMap = {
    'System Admin': 'bg-purple-100 text-purple-800',
    'Technical Supervisor': 'bg-blue-100 text-blue-800',
    'Technical User': 'bg-green-100 text-green-800',
    'Normal User': 'bg-gray-100 text-gray-800'
  }
  return roleMap[role] || 'bg-gray-100 text-gray-800'
}

/**
 * Get CSS classes for performance rating
 * @param {string} rating - Performance rating
 * @returns {string} CSS classes for rating styling
 */
export const getPerformanceRatingStyles = (rating) => {
  const ratingMap = {
    'Excellent': 'bg-green-100 text-green-800',
    'Good': 'bg-blue-100 text-blue-800',
    'Average': 'bg-yellow-100 text-yellow-800'
  }
  return ratingMap[rating] || 'bg-red-100 text-red-800'
}

/**
 * Get CSS classes for SLA adherence colors
 * @param {number} percentage - SLA adherence percentage
 * @returns {object} Object with color classes for different elements
 */
export const getSLAAdherenceColors = (percentage) => {
  if (percentage >= 90) {
    return {
      background: 'bg-green-100',
      text: 'text-green-600',
      progress: 'bg-green-500'
    }
  } else if (percentage >= 75) {
    return {
      background: 'bg-yellow-100', 
      text: 'text-yellow-600',
      progress: 'bg-amber-500'
    }
  } else {
    return {
      background: 'bg-red-100',
      text: 'text-red-600', 
      progress: 'bg-red-500'
    }
  }
}