import { useState, useEffect } from 'react'
import TicketDetailDialog from '../tickets/TicketDetailDialog'
import DataModal from '../common/DataModal'
import NotificationBell from '../notifications/NotificationBell'
import ToastNotification from '../notifications/ToastNotification'

const API_URL = 'https://hotfix.onrender.com/api'

export default function NormalUserDashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [modalData, setModalData] = useState(null)
  const [toastNotifications, setToastNotifications] = useState([])

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_URL}/tickets?created_by=${user.id}`)
      const data = await response.json()
      setTickets(data)
    } catch (err) {
      console.error('Failed to fetch tickets:', err)
    }
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      // Create ticket first
      const ticketResponse = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description'),
          priority: formData.get('priority'),
          category: formData.get('category'),
          created_by: user.id
        })
      })

      if (ticketResponse.ok) {
        const newTicket = await ticketResponse.json()
        
        // Handle file uploads if any
        const fileInput = e.target.querySelector('input[type="file"]')
        if (fileInput && fileInput.files.length > 0) {
          for (let file of fileInput.files) {
            const uploadFormData = new FormData()
            uploadFormData.append('file', file)
            uploadFormData.append('ticket_id', newTicket.id)
            uploadFormData.append('uploaded_by', user.id)
            
            try {
              await fetch(`${API_URL}/files/upload`, {
                method: 'POST',
                body: uploadFormData
              })
            } catch (uploadErr) {
              console.error('Failed to upload file:', uploadErr)
            }
          }
        }
        
        setShowCreateModal(false)
        fetchTickets()
        e.target.reset()
      }
    } catch (err) {
      console.error('Failed to create ticket:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">IT ServiceDesk</h1>
            <div className="flex items-center gap-4">
              <NotificationBell user={user} />
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

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search tickets by ID, title, or description..."
            onChange={(e) => {
              const search = e.target.value.toLowerCase()
              if (!search) {
                fetchTickets()
                return
              }
              const filtered = tickets.filter(t => 
                t.id.toLowerCase().includes(search) ||
                t.title.toLowerCase().includes(search) ||
                t.description.toLowerCase().includes(search)
              )
              setTickets(filtered)
            }}
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
                    <p className="text-sm text-gray-600 mt-1">{ticket.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                      ticket.status === 'Open' ? 'bg-green-100 text-green-800' :
                      ticket.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {ticket.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{ticket.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Category: {ticket.category}</span>
                    <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                    {ticket.assigned_to && <span>Assigned to: Agent {ticket.assigned_to}</span>}
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
    </div>
  )
}
