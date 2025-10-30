/**
 * Normal User Dashboard Component
 * 
 * Main dashboard interface for regular users (non-technical staff) who can:
 * - View their own tickets
 * - Create new support tickets with file attachments
 * - Search through their tickets
 * - View ticket statistics (open, closed, SLA violations)
 * - Receive real-time notifications
 * 
 * Features:
 * - Debounced search (300ms delay) for performance
 * - File upload support with validation
 * - Real-time notification handling
 * - Responsive design with mobile support
 * - Secure API communication with CSRF protection
 */

// React hooks for state management
import { useState, useEffect } from 'react'

// Component imports
import TicketDetailDialog from '../tickets/TicketDetailDialog'
import DataModal from '../common/DataModal'
import NotificationBell from '../notifications/NotificationBell'
import ToastNotification from '../notifications/ToastNotification'
import Footer from '../common/Footer'

// Configuration and utilities
import { API_CONFIG } from '../../config/api'
import { getPriorityStyles, getStatusStyles } from '../../utils/styleHelpers'
import { secureApiRequest } from '../../utils/api'

// API base URL from configuration
const API_URL = API_CONFIG.BASE_URL

export default function NormalUserDashboard({ user, onLogout }) {
  // === STATE MANAGEMENT ===
  // Ticket data and filtering
  const [tickets, setTickets] = useState([])              // Currently displayed tickets (filtered)
  const [allTickets, setAllTickets] = useState([])        // All user tickets (unfiltered)
  const [searchTerm, setSearchTerm] = useState('')        // Search input value
  
  // UI state management
  const [showCreateModal, setShowCreateModal] = useState(false)    // Create ticket modal visibility
  const [selectedTicket, setSelectedTicket] = useState(null)       // Ticket detail dialog
  const [modalData, setModalData] = useState(null)                 // Data modal (statistics)
  const [toastNotifications, setToastNotifications] = useState([]) // Toast notifications array

  // === EFFECTS ===
  // Load user tickets on component mount
  useEffect(() => {
    fetchTickets()
  }, [])

  // Debounced search effect (300ms delay for performance)
  // Prevents excessive API calls while user is typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!searchTerm) {
        // No search term - show all tickets
        setTickets(allTickets)
        return
      }
      
      // Filter tickets by ID, title, or description (case-insensitive)
      const filtered = allTickets.filter(t => 
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setTickets(filtered)
    }, 300) // 300ms debounce delay

    // Cleanup timeout on dependency change
    return () => clearTimeout(timeoutId)
  }, [searchTerm, allTickets])

  // === EVENT HANDLERS ===
  
  /**
   * Handle notification bell clicks - opens ticket detail dialog
   * 
   * @param {string} ticketId - ID of the ticket to display
   * @param {string} alertType - Type of alert (for future use)
   */
  const handleNotificationClick = async (ticketId, alertType) => {
    try {
      // First try to find ticket in current local data
      let ticket = tickets.find(t => t.id === ticketId || t.ticket_id === ticketId)
      
      // If not found locally, fetch fresh data from server
      if (!ticket) {
        const data = await secureApiRequest(`/tickets?created_by=${user.id}`)
        const userTickets = data.tickets || data || []
        ticket = userTickets.find(t => t.id === ticketId || t.ticket_id === ticketId)
        
        // Update local state with fresh data if available
        if (userTickets.length > 0) {
          setTickets(userTickets)
          setAllTickets(userTickets)
        }
      }
      
      // Open ticket detail dialog or show error
      if (ticket) {
        setSelectedTicket(ticket)
      } else {
        alert('Ticket not found or not accessible')
      }
    } catch (err) {
      console.error('Failed to find ticket:', err)
      alert('Failed to load ticket details')
    }
  }

  /**
   * Fetch user's tickets from the API
   * 
   * Handles different response formats from the backend and updates
   * both filtered and unfiltered ticket arrays.
   */
  const fetchTickets = async () => {
    try {
      // Fetch tickets created by current user
      const data = await secureApiRequest(`/tickets?created_by=${user.id}`)
      
      // Handle different response formats from backend
      if (data.tickets && Array.isArray(data.tickets)) {
        // Standard format: { tickets: [...] }
        setTickets(data.tickets)
        setAllTickets(data.tickets)
      } else if (Array.isArray(data)) {
        // Direct array format: [...]
        setTickets(data)
        setAllTickets(data)
      } else {
        // Unexpected format - default to empty array
        setTickets([])
        setAllTickets([])
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err)
      // Set empty arrays on error to prevent UI crashes
      setTickets([])
      setAllTickets([])
    }
  }

  /**
   * Handle ticket creation form submission
   * 
   * Process includes:
   * 1. Create ticket via API
   * 2. Upload any attached files
   * 3. Refresh ticket list
   * 4. Show success/error feedback
   * 
   * @param {Event} e - Form submission event
   */
  const handleCreateTicket = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      // Check if there are files to upload
      const fileInput = e.target.querySelector('input[type="file"]')
      const hasFiles = fileInput && fileInput.files.length > 0
      
      if (hasFiles) {
        // Create ticket with attachment using multipart form data
        const ticketFormData = new FormData()
        ticketFormData.append('title', formData.get('title'))
        ticketFormData.append('description', formData.get('description'))
        ticketFormData.append('priority', formData.get('priority'))
        ticketFormData.append('category', formData.get('category'))
        ticketFormData.append('created_by', user.id)
        
        // Add the first file as attachment (backend expects single file)
        ticketFormData.append('attachment', fileInput.files[0])
        
        console.log('Creating ticket with attachment:', fileInput.files[0].name)
        console.log('Form data fields:', Array.from(ticketFormData.keys()))
        
        const newTicket = await secureApiRequest('/tickets', {
          method: 'POST',
          body: ticketFormData
        })
        
        // Upload additional files if more than one
        if (fileInput.files.length > 1) {
          for (let i = 1; i < fileInput.files.length; i++) {
            const file = fileInput.files[i]
            const uploadFormData = new FormData()
            uploadFormData.append('image', file)  // Use 'image' field name
            uploadFormData.append('ticket_id', newTicket.ticket_id || newTicket.id)
            uploadFormData.append('user_id', user.id)
            
            try {
              await secureApiRequest('/upload/image', {
                method: 'POST',
                body: uploadFormData
              })
            } catch (uploadErr) {
              console.error('Failed to upload additional file:', uploadErr)
              alert(`Failed to upload ${file.name}: ${uploadErr.message}`)
            }
          }
        }
      } else {
        // Create ticket without attachment using JSON
        const newTicket = await secureApiRequest('/tickets', {
          method: 'POST',
          body: JSON.stringify({
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            category: formData.get('category'),
            created_by: user.id
          })
        })
      }
      
      // Step 3: Clean up and refresh UI
      setShowCreateModal(false)  // Close modal
      fetchTickets()              // Refresh ticket list
      e.target.reset()            // Clear form
      alert('Ticket created successfully!')
      
    } catch (err) {
      console.error('Failed to create ticket:', err)
      alert(`Failed to create ticket: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Hotfix ServiceDesk</h1>
            <div className="flex items-center gap-4">
              <NotificationBell user={user} onNotificationClick={handleNotificationClick} />
              <div className="text-sm">
                <span className="text-gray-600">Welcome, </span>
                <span className="font-medium">{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search tickets by ID, title, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setModalData({ title: 'Open Tickets', data: tickets.filter(t => t.status !== 'Closed') })}>
            <div className="text-sm text-gray-600">Open Tickets</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {tickets.filter(t => t.status !== 'Closed').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setModalData({ title: 'Closed Tickets', data: tickets.filter(t => t.status === 'Closed') })}>
            <div className="text-sm text-gray-600">Closed Tickets</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {tickets.filter(t => t.status === 'Closed').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setModalData({ title: 'Past SLA Tickets', data: tickets.filter(t => t.sla_violated) })}>
            <div className="text-sm text-gray-600">Past SLA</div>
            <div className="text-3xl font-bold text-red-600 mt-2">
              {tickets.filter(t => t.sla_violated).length}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">My Tickets</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            New Ticket
          </button>
        </div>

        <div className="grid gap-4">
          {tickets.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <p className="mb-4">You haven't created any tickets yet.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Your First Ticket
              </button>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{ticket.ticket_id || ticket.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityStyles(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{ticket.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Category: {ticket.category}</span>
                    <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                    {ticket.assigned_to && <span>Assigned to: {ticket.assigned_agent_name || `Agent ${ticket.assigned_to}`}</span>}
                  </div>
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    View Details
                  </button>
                </div>
                {ticket.status === 'Closed' && ticket.resolved_at && (
                  <div className="mt-3 pt-3 border-t text-sm text-green-600">
                    Resolved on {new Date(ticket.resolved_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Ticket</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the issue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    required
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detailed description of the issue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="priority"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Hardware">Hardware</option>
                      <option value="Software">Software</option>
                      <option value="Network">Network</option>
                      <option value="Access">Access</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attachments (Optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: JPG, PNG, PDF, DOC, DOCX, TXT (Max 10MB each)
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
                  <p className="font-medium">Auto-Assignment Enabled</p>
                  <p className="mt-1">This ticket will be automatically assigned to the agent with the least workload.</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
                  >
                    Create Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedTicket && (
        <TicketDetailDialog
          ticket={selectedTicket}
          currentUser={user}
          onClose={() => setSelectedTicket(null)}
          onUpdate={fetchTickets}
        />
      )}

      {modalData && <DataModal title={modalData.title} data={modalData.data} onClose={() => setModalData(null)} />}
      
      {toastNotifications.map((notification, index) => (
        <ToastNotification
          key={index}
          notification={notification}
          onClose={() => {
            setToastNotifications(prev => prev.filter((_, i) => i !== index))
          }}
        />
      ))}

      <Footer />
    </div>
  )
}
