import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import SLAAdherenceCard from '../analytics/SLAAdherenceCard'
import AgentPerformanceScorecard from '../analytics/AgentPerformanceScorecard'
import TicketAgingAnalysis from '../analytics/TicketAgingAnalysis'
import RealtimeSLADashboard from '../analytics/RealtimeSLADashboard'
import TicketDetailDialog from '../tickets/TicketDetailDialog'
import DataModal from '../common/DataModal'
import NotificationBell from '../notifications/NotificationBell'
import Footer from '../common/Footer'
import Pagination from '../common/Pagination'
import { secureApiRequest } from '../../utils/api'


export default function TechnicalSupervisorDashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([])
  const [statusCounts, setStatusCounts] = useState({})
  const [unassignedTickets, setUnassignedTickets] = useState([])
  const [agentWorkload, setAgentWorkload] = useState([])
  const [agents, setAgents] = useState([])
  const [assignmentSelections, setAssignmentSelections] = useState({})
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [modalData, setModalData] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, has_next: false, has_prev: false })
  const [allTickets, setAllTickets] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const location = useLocation()

  useEffect(() => {
    fetchTickets()
    fetchAnalytics()
  }, [])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!searchTerm) {
        setTickets(allTickets)
        return
      }
      const filtered = allTickets.filter(t => 
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setTickets(filtered)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, allTickets])

  const handleNotificationClick = async (ticketId, alertType) => {
    try {
      // First try to find in current tickets
      let ticket = tickets.find(t => t.id === ticketId || t.ticket_id === ticketId)
      
      // If not found, fetch fresh data
      if (!ticket) {
        const data = await secureApiRequest('/tickets')
        const allTickets = data.tickets || data || []
        ticket = allTickets.find(t => t.id === ticketId || t.ticket_id === ticketId)
        
        // Update local tickets if we found new data
        if (allTickets.length > 0) {
          setTickets(allTickets)
          setAllTickets(allTickets)
        }
      }
      
      if (ticket) {
        setSelectedTicket(ticket)
      } else {
        alert('Ticket not found')
      }
    } catch (err) {
      console.error('Failed to find ticket:', err)
      alert('Failed to load ticket details')
    }
  }

  const handlePageChange = (page) => {
    fetchTickets(page)
  }

  const fetchTickets = async (page = 1) => {
    try {
      const data = await secureApiRequest(`/tickets?page=${page}&per_page=10`)
      if (data.tickets && Array.isArray(data.tickets)) {
        setTickets(data.tickets)
        setAllTickets(data.tickets)
        setPagination(data.pagination)
      } else if (Array.isArray(data)) {
        setTickets(data)
        setAllTickets(data)
        setPagination({ page: 1, pages: 1, total: data.length, has_next: false, has_prev: false })
      } else {
        setTickets([])
        setAllTickets([])
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err)
      setTickets([])
      setAllTickets([])
    }
  }

  const fetchAnalytics = async () => {
    try {
      const [statusCounts, unassigned, agentWorkload, agentsData] = await Promise.all([
        secureApiRequest('/analytics/ticket-status-counts'),
        secureApiRequest('/analytics/unassigned-tickets'),
        secureApiRequest('/analytics/agent-workload'),
        secureApiRequest('/agents')
      ])
      
      setStatusCounts(statusCounts)
      setUnassignedTickets(unassigned.tickets || [])
      setAgentWorkload(agentWorkload)
      setAgents(agentsData || [])
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
      setStatusCounts({})
      setUnassignedTickets([])
      setAgentWorkload([])
      setAgents([])
    }
  }

  const handleAssignTicket = async (ticketId, agentId) => {
    try {
      await secureApiRequest(`/tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify({
          assigned_to: agentId,
          performed_by: user.id,
          performed_by_name: user.name
        })
      })
      
      // Remove from unassigned list after successful backend update
      setUnassignedTickets(prev => prev.filter(t => t.id !== ticketId))
      
      // Success feedback
      alert('Ticket assigned successfully!')
      
      // Refresh data after a short delay to ensure backend is updated
      setTimeout(async () => {
        await Promise.all([
          fetchTickets(),
          fetchAnalytics()
        ])
      }, 500)
    } catch (err) {
      console.error('Failed to assign ticket:', err)
      alert(`Failed to assign ticket: ${err.message}`)
    }
  }

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

  const handleExportExcel = async () => {
    try {
      const response = await secureApiRequest('/export/tickets/excel', {
        method: 'GET'
      })
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Use more efficient download without DOM manipulation
      const link = document.createElement('a')
      link.href = url
      link.download = `tickets_${new Date().toISOString().split('T')[0]}.csv`
      link.style.display = 'none'
      
      // Trigger download and cleanup immediately
      link.click()
      window.URL.revokeObjectURL(url)
      
      alert('Export completed successfully!')
    } catch (err) {
      console.error('Failed to export:', err)
      alert(`Export failed: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Hotfix ServiceDesk - Supervisor Portal</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <NotificationBell user={user} onNotificationClick={handleNotificationClick} />
              </div>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setModalData({ title: 'All Tickets', data: tickets })}>
            <div className="text-sm text-gray-600">All Tickets</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {tickets.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setModalData({ title: 'Open Tickets', data: tickets.filter(t => t.status !== 'Closed') })}>
            <div className="text-sm text-gray-600">Open Tickets</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {tickets.filter(t => t.status !== 'Closed').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setModalData({ title: 'Resolved Tickets', data: tickets.filter(t => t.status === 'Closed') })}>
            <div className="text-sm text-gray-600">Resolved Tickets</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {tickets.filter(t => t.status === 'Closed').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setModalData({ title: 'SLA Violated Tickets', data: tickets.filter(t => t.sla_violated) })}>
            <div className="text-sm text-gray-600">SLA Violated</div>
            <div className="text-3xl font-bold text-red-600 mt-2">
              {tickets.filter(t => t.sla_violated).length}
            </div>
          </div>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-4">
            <Link
              to="/dashboard"
              className={`px-4 py-2 font-medium ${location.pathname === '/dashboard' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Dashboard
            </Link>
            <Link
              to="/dashboard/analytics"
              className={`px-4 py-2 font-medium ${location.pathname === '/dashboard/analytics' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Analytics
            </Link>
            <Link
              to="/dashboard/tickets"
              className={`px-4 py-2 font-medium ${location.pathname === '/dashboard/tickets' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              All Tickets ({tickets.length})
            </Link>
          </nav>
        </div>

        <Routes>
          <Route path="/" element={
            <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(statusCounts).map(([status, count]) => {
                const statusMap = {
                  'new': 'New',
                  'open': 'Open', 
                  'pending': 'Pending',
                  'closed': 'Closed'
                }
                const displayStatus = statusMap[status] || status
                const filteredTickets = tickets.filter(t => t.status === displayStatus)
                return (
                  <div key={status} className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setModalData({ title: `${displayStatus} Tickets`, data: filteredTickets })}>
                    <div className="text-sm text-gray-600">{displayStatus}</div>
                    <div className="text-3xl font-bold text-gray-900 mt-2">{count}</div>
                  </div>
                )
              })}
            </div>

            {unassignedTickets.length > 0 && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-900 mb-4">
                  Unassigned Tickets ({unassignedTickets.length})
                </h3>
                <div className="space-y-3">
                  {unassignedTickets.map(ticket => (
                    <div key={ticket.id} className="bg-white p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium">{ticket.ticket_id || ticket.id} - {ticket.title}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              ticket.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                              ticket.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {ticket.priority}
                            </span>
                            <span className="ml-2">{ticket.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <select
                          value={assignmentSelections[ticket.id] || ''}
                          onChange={(e) => setAssignmentSelections(prev => ({...prev, [ticket.id]: e.target.value}))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Select agent...</option>
                          {agents.length > 0 ? agents.map(agent => (
                            <option key={agent.id} value={agent.id}>
                              {agent.name} ({agentWorkload.find(a => a.agent_id === agent.id)?.active_tickets || 0} active)
                            </option>
                          )) : agentWorkload.map(agent => (
                            <option key={agent.agent_id} value={agent.agent_id}>
                              {agent.name} ({agent.active_tickets} active)
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const selectedAgent = assignmentSelections[ticket.id]
                            if (selectedAgent) {
                              handleAssignTicket(ticket.id, selectedAgent)
                              setAssignmentSelections(prev => ({...prev, [ticket.id]: ''}))
                            }
                          }}
                          disabled={!assignmentSelections[ticket.id]}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {chartData.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Ticket Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Agent Workload & Performance Summary</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Active</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Closed</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">SLA Violations</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {agentWorkload.map(agent => {
                      const agentTickets = tickets.filter(t => t.assigned_to === agent.agent_id)
                      const slaViolations = agentTickets.filter(t => t.sla_violated).length
                      const score = (agent.closed_tickets * 10) - (slaViolations * 5)
                      const rating = score >= 50 ? 'Excellent' : score >= 30 ? 'Good' : score >= 15 ? 'Average' : 'Needs Improvement'
                      const ratingColor = score >= 50 ? 'text-green-600' : score >= 30 ? 'text-blue-600' : score >= 15 ? 'text-yellow-600' : 'text-red-600'
                      
                      return (
                        <tr key={agent.agent_id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setModalData({ title: `${agent.name}'s Tickets`, data: agentTickets })}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{agent.name}</div>
                            <div className="text-xs text-gray-500">{agent.email}</div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-lg font-semibold text-blue-600">{agent.active_tickets}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-lg font-semibold text-green-600">{agent.closed_tickets}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-lg font-semibold ${slaViolations > 0 ? 'text-red-600' : 'text-gray-400'}`}>{slaViolations}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className={`font-semibold ${ratingColor}`}>{rating}</div>
                            <div className="text-xs text-gray-500">Score: {Math.max(0, score)}</div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>



            <div onClick={() => setModalData({ title: 'SLA Adherence Details', data: tickets })}>
              <SLAAdherenceCard />
            </div>
          </div>
          } />
          <Route path="/analytics" element={
            <div className="space-y-6">
              <RealtimeSLADashboard onCardClick={setModalData} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AgentPerformanceScorecard />
                <TicketAgingAnalysis />
              </div>
            </div>
          } />
          <Route path="/tickets" element={
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={handleExportExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Export Excel
                </button>
              </div>
              <div className="grid gap-4">
                {tickets.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    No tickets found
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
                    </div>
                  ))
                )}
              </div>
              {pagination.pages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                  hasNext={pagination.has_next}
                  hasPrev={pagination.has_prev}
                />
              )}
            </div>
          } />
        </Routes>
      </main>

      {modalData && <DataModal title={modalData.title} data={modalData.data} onClose={() => setModalData(null)} />}

      {selectedTicket && (
        <TicketDetailDialog
          ticket={selectedTicket}
          currentUser={user}
          onClose={() => setSelectedTicket(null)}
          onUpdate={() => {
            fetchTickets()
            fetchAnalytics()
          }}
        />
      )}
      
      <Footer />
    </div>
  )
}
