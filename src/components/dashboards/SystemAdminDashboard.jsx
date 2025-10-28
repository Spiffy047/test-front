import { useState, useEffect } from 'react'
import SLAAdherenceCard from '../analytics/SLAAdherenceCard'
import AgentPerformanceScorecard from '../analytics/AgentPerformanceScorecard'
import UserForm from '../forms/UserForm'
import NotificationBell from '../notifications/NotificationBell'
import TicketDetailDialog from '../tickets/TicketDetailDialog'
import Footer from '../common/Footer'
import { API_CONFIG } from '../../config/api'
import { getRoleStyles } from '../../utils/styleHelpers'

const API_URL = API_CONFIG.BASE_URL

export default function SystemAdminDashboard({ user, onLogout }) {
  const [users, setUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [systemStats, setSystemStats] = useState({ totalAgents: 0, activeTickets: 0, avgResolution: 0 })

  useEffect(() => {
    fetchUsers()
    fetchSystemStats()
  }, [])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!searchTerm) {
        setUsers(allUsers)
        return
      }
      const filtered = allUsers.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setUsers(filtered)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, allUsers])

  const handleNotificationClick = async (ticketId, alertType) => {
    try {
      const response = await fetch(`${API_URL}/tickets`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      const tickets = data.tickets || data || []
      const ticket = tickets.find(t => t.id === ticketId || t.ticket_id === ticketId)
      if (ticket) {
        setSelectedTicket(ticket)
      }
    } catch (err) {
      console.error('Failed to find ticket:', err)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      if (data.users && Array.isArray(data.users)) {
        setUsers(data.users)
        setAllUsers(data.users)
      } else if (Array.isArray(data)) {
        setUsers(data)
        setAllUsers(data)
      } else {
        setUsers([])
        setAllUsers([])
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setUsers([])
      setAllUsers([])
    }
  }

  const handleSaveUser = async (userData) => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      const response = editingUser
        ? await fetch(`${API_URL}/users/${editingUser.id}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              ...(csrfToken && { 'X-CSRF-Token': csrfToken })
            },
            credentials: 'same-origin',
            body: JSON.stringify(userData)
          })
        : await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              ...(csrfToken && { 'X-CSRF-Token': csrfToken })
            },
            credentials: 'same-origin',
            body: JSON.stringify(userData)
          })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `HTTP ${response.status}`)
      }
      
      alert('User saved successfully!')
      setShowUserModal(false)
      setEditingUser(null)
      fetchUsers()
    } catch (err) {
      console.error('Failed to save user:', err)
      alert(err.message || 'Failed to save user')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      const response = await fetch(`${API_URL}/users/${userId}`, { 
        method: 'DELETE',
        headers: {
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        },
        credentials: 'same-origin'
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      alert('User deleted successfully!')
      fetchUsers()
    } catch (err) {
      console.error('Failed to delete user:', err)
      alert('Failed to delete user')
    }
  }

  const fetchSystemStats = async () => {
    try {
      const [ticketsRes, agentsRes] = await Promise.all([
        fetch(`${API_URL}/tickets`),
        fetch(`${API_URL}/users?role=Technical User,Technical Supervisor`)
      ])
      
      if (ticketsRes.ok && agentsRes.ok) {
        const tickets = await ticketsRes.json()
        const agents = await agentsRes.json()
        
        const ticketList = tickets.tickets || tickets || []
        const agentList = agents.users || agents || []
        
        const activeTickets = ticketList.filter(t => t.status !== 'Closed').length
        const totalAgents = agentList.filter(u => 
          u.role === 'Technical User' || u.role === 'Technical Supervisor'
        ).length
        
        // Calculate average resolution time from closed tickets
        const closedTickets = ticketList.filter(t => t.status === 'Closed' && t.resolved_at)
        const avgResolution = closedTickets.length > 0 
          ? closedTickets.reduce((sum, ticket) => {
              const created = new Date(ticket.created_at)
              const resolved = new Date(ticket.resolved_at)
              return sum + (resolved - created) / (1000 * 60 * 60) // hours
            }, 0) / closedTickets.length
          : 0
        
        setSystemStats({
          totalAgents,
          activeTickets,
          avgResolution: avgResolution.toFixed(1)
        })
      }
    } catch (err) {
      console.error('Failed to fetch system stats:', err)
    }
  }

  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Hotfix ServiceDesk - Admin Portal</h1>
            <div className="flex items-center gap-4">
              <NotificationBell user={user} onNotificationClick={handleNotificationClick} />
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
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 font-medium ${activeTab === 'dashboard' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-medium ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 font-medium ${activeTab === 'analytics' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('users')}>
                <div className="text-sm text-gray-600">Total Users</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">{users.length}</div>
              </div>
              {Object.entries(roleCounts).map(([role, count]) => (
                <div key={role} className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                  setActiveTab('users')
                  setUsers(allUsers.filter(u => u.role === role))
                }}>
                  <div className="text-sm text-gray-600">{role}</div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{count}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SLAAdherenceCard />
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">System Health</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">API Status</span>
                    <span className="text-green-600 font-semibold">Operational</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">Database</span>
                    <span className="text-green-600 font-semibold">Connected</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">Authentication</span>
                    <span className="text-green-600 font-semibold">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SLAAdherenceCard />
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">System Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="font-medium">Total Agents</span>
                    <span className="text-blue-600 font-semibold">{systemStats.totalAgents}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">Active Tickets</span>
                    <span className="text-green-600 font-semibold">{systemStats.activeTickets}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <span className="font-medium">Avg Resolution</span>
                    <span className="text-yellow-600 font-semibold">{systemStats.avgResolution}h</span>
                  </div>
                </div>
              </div>
            </div>
            <AgentPerformanceScorecard />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">User Management</h2>
              <button
                onClick={() => {
                  setEditingUser(null)
                  setShowUserModal(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add User
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleStyles(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setEditingUser(u)
                            setShowUserModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


      </main>

      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{editingUser ? 'Edit User' : 'Add User'}</h2>
              <UserForm user={editingUser} onSubmit={handleSaveUser} onCancel={() => {
                setShowUserModal(false)
                setEditingUser(null)
              }} />

            </div>
          </div>
        </div>
      )}

      {selectedTicket && (
        <TicketDetailDialog
          ticket={selectedTicket}
          currentUser={user}
          onClose={() => setSelectedTicket(null)}
          onUpdate={() => {}}
        />
      )}
      
      <Footer />
    </div>
  )
}
