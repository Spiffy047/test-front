import { useState, useEffect, useRef } from 'react'
import { API_CONFIG } from '../../config/api'
import { secureApiRequest } from '../../utils/api'

const API_URL = API_CONFIG.BASE_URL

export default function TicketDetailDialog({ ticket, onClose, currentUser, onUpdate }) {
  const [messages, setMessages] = useState([])
  const [activities, setActivities] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editedTicket, setEditedTicket] = useState(ticket)
  const [agents, setAgents] = useState([])
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)
  const scrollRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchMessages()
    fetchActivities()
    fetchAgents()
    fetchAttachments()
  }, [ticket.id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, activities])

  const fetchMessages = async () => {
    try {
      // Use ticket_id (TKT-XXXX format) for timeline endpoint
      const ticketIdentifier = ticket.ticket_id || ticket.id
      console.log(`Fetching timeline for: ${ticketIdentifier}`)
      const data = await secureApiRequest(`/messages/ticket/${ticketIdentifier}/timeline`)
      console.log('Timeline data received:', data)
      setMessages(Array.isArray(data) ? data : data.messages || [])
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      setMessages([])
    }
  }

  const fetchActivities = async () => {
    try {
      const data = await secureApiRequest(`/tickets/${ticket.id}/activities`)
      setActivities(data || [])
    } catch (err) {
      console.error('Failed to fetch activities:', err)
      setActivities([])
    }
  }

  const fetchAgents = async () => {
    try {
      const data = await secureApiRequest('/agents/assignable')
      setAgents(data || [])
    } catch (err) {
      console.error('Failed to fetch agents:', err)
      setAgents([])
    }
  }

  const fetchAttachments = async () => {
    try {
      const data = await secureApiRequest(`/files/ticket/${ticket.id}`)
      setAttachments(data || [])
    } catch (err) {
      console.error('Failed to fetch attachments:', err)
      setAttachments([])
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    
    // Use consistent field names and ticket_id format
    formData.append('file', file)  // Use 'file' field name for /files/upload endpoint
    formData.append('ticket_id', ticket.ticket_id || ticket.id)
    formData.append('user_id', currentUser.id)
    
    console.log('Uploading file:', file.name, 'to ticket:', ticket.ticket_id || ticket.id)
    
    try {
      const result = await secureApiRequest('/files/upload', {
        method: 'POST',
        body: formData
      })
      
      console.log('Upload result:', result)
      
      // Refresh messages to show the uploaded file in timeline
      await fetchMessages()
      fetchAttachments()
      alert('File uploaded successfully!')
    } catch (err) {
      console.error('Failed to upload file:', err)
      alert(`Failed to upload file: ${err.message}`)
    }
    
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      // Use ticket_id (TKT-XXXX format) for message creation
      const ticketIdentifier = ticket.ticket_id || ticket.id
      console.log(`Sending message to ticket: ${ticketIdentifier}`)
      
      const response = await secureApiRequest('/messages', {
        method: 'POST',
        body: JSON.stringify({
          ticket_id: ticketIdentifier,
          sender_id: currentUser.id,
          sender_name: currentUser.name,
          sender_role: currentUser.role,
          message: newMessage
        })
      })
      
      console.log('Message sent response:', response)
      setNewMessage('')
      await fetchMessages()
    } catch (err) {
      console.error('Failed to send message:', err)
      alert(`Failed to send message: ${err.message}`)
    }
  }

  const handleSaveChanges = async () => {
    try {
      await secureApiRequest(`/tickets/${ticket.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editedTicket,
          performed_by: currentUser.id,
          performed_by_name: currentUser.name
        })
      })
      setIsEditing(false)
      onUpdate()
      fetchActivities()
      alert('Ticket updated successfully!')
    } catch (err) {
      console.error('Failed to update ticket:', err)
      alert(`Failed to update ticket: ${err.message}`)
    }
  }

  const timeline = [...messages, ...activities]
    .sort((a, b) => new Date(a.timestamp || a.created_at) - new Date(b.timestamp || b.created_at))

  const canEdit = currentUser.role !== 'Normal User' || (currentUser.role === 'Normal User' && ticket.created_by === currentUser.id && ticket.status !== 'Closed')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] flex flex-col" style={{maxWidth: '76rem'}}>
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{ticket.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{ticket.ticket_id || ticket.id}</p>
            </div>
            <div className="flex items-center gap-2">
              {ticket.sla_violated && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
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
              {canEdit && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-b">
          <p className="text-gray-700 mb-4">{ticket.description}</p>
          
          {attachments.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments ({attachments.length})</h4>
              <div className="flex flex-wrap gap-2">
                {attachments.map(att => (
                  <a
                    key={att.id}
                    href={`${API_URL.replace('/api', '')}${att.download_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm flex items-center gap-2"
                  >
                    {att.filename} ({att.file_size_mb}MB)
                  </a>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Agent</label>
              {isEditing ? (
                <select
                  value={editedTicket.assigned_to || ''}
                  onChange={(e) => setEditedTicket({...editedTicket, assigned_to: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Unassigned</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900">{ticket.assigned_to ? (ticket.assigned_agent_name || `Agent ${ticket.assigned_to}`) : 'Unassigned'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
              <p className="text-gray-900">{new Date(ticket.created_at).toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              {isEditing ? (
                <select
                  value={editedTicket.status}
                  onChange={(e) => setEditedTicket({...editedTicket, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="New">New</option>
                  <option value="Open">Open</option>
                  <option value="Pending">Pending</option>
                  <option value="Closed">Closed</option>
                </select>
              ) : (
                <p className="text-gray-900">{ticket.status}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              {isEditing ? (
                <select
                  value={editedTicket.priority}
                  onChange={(e) => setEditedTicket({...editedTicket, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              ) : (
                <p className="text-gray-900">{ticket.priority}</p>
              )}
            </div>
          </div>
          {isEditing && (
            <button
              onClick={handleSaveChanges}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Save Changes
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50" ref={scrollRef}>
          <h3 className="text-lg font-semibold mb-4">Timeline</h3>
          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div key={item.id || index} className={`flex gap-3 ${item.type === 'message' || item.message ? 'items-start' : 'items-center'}`}>
                {item.type === 'message' || item.message ? (
                  <>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      item.sender_role === 'Normal User' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {item.sender_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium text-gray-900">{item.sender_name}</span>
                            <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                              item.sender_role === 'Normal User' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {item.sender_role}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{item.message}</p>
                        {item.image_url && (
                          <div className="mt-3">
                            <img 
                              src={item.image_url} 
                              alt="Attachment" 
                              className="max-w-sm max-h-64 rounded-lg border cursor-pointer hover:opacity-90"
                              onClick={() => window.open(item.image_url, '_blank')}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 text-xs">S</span>
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-lg p-3">
                      <p className="text-sm text-gray-700">{item.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        by {item.performed_by_name} • {new Date(item.timestamp || item.created_at).toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t bg-white">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
            />
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,*/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Attach'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
