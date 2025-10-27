// Technical User Dashboard - Agent portal with SLA monitoring
import { useState, useEffect } from 'react'
import TicketDetailDialog from '../tickets/TicketDetailDialog'
import DataModal from '../common/DataModal'
import AgentPerformanceCard from '../analytics/AgentPerformanceCard'
import NotificationBell from '../notifications/NotificationBell'
import ToastNotification from '../notifications/ToastNotification'
import Footer from '../common/Footer'

const API_URL = 'https://hotfix.onrender.com/api'

export default function TechnicalUserDashboard({ user, onLogout }) {
  // State management
  const [tickets, setTickets] = useState([])
  const [activeTab, setActiveTab] = useState('myQueue')  // 'myQueue' or 'allTickets'
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [modalData, setModalData] = useState(null)
  const [toastNotifications, setToastNotifications] = useState([])
  const [agentWorkload, setAgentWorkload] = useState([])

  useEffect(() => {
    fetchTickets()
    fetchAgentWorkload()
  }, [])

  // Fetch all tickets from API
  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_URL}/tickets`)
      const data = await response.json()
      setTickets(data)
    } catch (err) {
      console.error('Failed to fetch tickets:', err)
    }
  }

  const fetchAgentWorkload = async () => {
    try {
      const response = await fetch(`${API_URL}/analytics/agent-workload`)
      const data = await response.json()
      setAgentWorkload(data)
    } catch (err) {
      console.error('Failed to fetch agent workload:', err)
    }
  }

  // Update ticket status (Set Pending, Resolve)
  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      await fetch(`${API_URL}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          performed_by: user.id,
          performed_by_name: user.name
        })
      })
      fetchTickets()  // Refresh ticket list
    } catch (err) {
      console.error('Failed to update ticket:', err)
    }
  }

  // Assign ticket to agent
  const handleAssignTicket = async (ticketId, agentId) => {
    try {
      await fetch(`${API_URL}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigned_to: agentId,
          performed_by: user.id,
          performed_by_name: user.name
        })
      })
      fetchTickets()
      fetchAgentWorkload()
    } catch (err) {
      console.error('Failed to assign ticket:', err)
    }
  }

  // Filter tickets based on current view
  const myTickets = tickets.filter(t => t.assigned_to === user.id)
  const displayTickets = activeTab === 'myQueue' ? myTickets : tickets

  // Get tickets that have violated SLA for alert display
  const slaViolationTickets = displayTickets.filter(t => t.sla_violated && t.status !== 'Closed')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Hotfix ServiceDesk - Agent Portal</h1>
            <div className="flex items-center gap-4">
              <NotificationBell user={user} />
              <div className="text-sm">
                <span className="text-gray-600">Welcome, </span>
                <span className="font-medium">{user.name}</span>
                <span className="text-gray-500 ml-2">({user.role})</span>
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

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8" style={{maxWidth: '76rem'}}>
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

        <div className="mb-6">
          <AgentPerformanceCard agentId={user.id} onCardClick={setModalData} tickets={tickets} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setModalData({ title: 'My Assigned Tickets', data: myTickets })}>
            <div className="text-sm text-gray-600">Assigned Tickets</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {myTickets.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setModalData({ title: 'All Tickets', data: tickets })}>
            <div className="text-sm text-gray-600">Total Tickets</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {tickets.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setModalData({ title: 'SLA Breached Tickets', data: tickets.filter(t => t.sla_violated) })}>
            <div className="text-sm text-gray-600">SLA Breached</div>
            <div className="text-3xl font-bold text-red-600 mt-2">
              {tickets.filter(t => t.sla_violated).length}
            </div>
          </div>
        </div>


        <div className="mb-6 flex justify-between items-center">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4">
              <button
                onClick={() => setActiveTab('myQueue')}
                className={`px-4 py-2 font-medium ${activeTab === 'myQueue' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                My Queue ({myTickets.length})
              </button>
              <button
                onClick={() => setActiveTab('allTickets')}
                className={`px-4 py-2 font-medium ${activeTab === 'allTickets' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                All Tickets ({tickets.length})
              </button>
            </nav>
          </div>
        </div>

        {/* SLA Violation Alert Section */}
        {slaViolationTickets.length > 0 && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="animate-pulse text-red-600 text-xl font-bold">!</span>
              <h3 className="font-semibold text-red-900">SLA Violation Alert</h3>
            </div>
            <div className="space-y-2">
              {slaViolationTickets.map(ticket => (
                <div key={ticket.id} className="flex justify-between items-center bg-white p-3 rounded">
                  <div>
                    <span className="font-medium">{ticket.id}</span>
                    <span className="text-gray-600 ml-2">{ticket.title}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(ticket.id, 'Open')}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Take Action
                    </button>
                    <select
                      onChange={(e) => e.target.value && handleAssignTicket(ticket.id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                      defaultValue=""
                    >
                      <option value="">Reassign...</option>
                      {agentWorkload.map(agent => (
                        <option key={agent.agent_id} value={agent.agent_id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {displayTickets.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No tickets found
            </div>
          ) : (
            displayTickets
              // Sort by priority: Critical > High > Medium > Low
              .sort((a, b) => {
                const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 }
                return priorityOrder[b.priority] - priorityOrder[a.priority]
              })
              .map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{ticket.id}</p>
                    </div>
                    <div className="flex gap-2">
                      {ticket.sla_violated && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                          SLA Violated
                        </span>
                      )}
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
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>Category: {ticket.category}</span>
                      <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        View Details
                      </button>
                      {ticket.status !== 'Closed' && ticket.assigned_to === user.id && (
                        <>
                          {ticket.status !== 'Pending' && (
                            <button
                              onClick={() => handleStatusUpdate(ticket.id, 'Pending')}
                              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200"
                            >
                              Set Pending
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusUpdate(ticket.id, 'Closed')}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Resolve
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </main>

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
