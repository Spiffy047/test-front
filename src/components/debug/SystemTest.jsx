import { useState } from 'react'
import { apiRequest } from '../../utils/simpleApi'
import cloudinaryService from '../../services/cloudinaryService'

export default function SystemTest() {
  const [results, setResults] = useState({})
  const [testing, setTesting] = useState(false)

  const runTest = async (testName, testFn) => {
    try {
      const result = await testFn()
      setResults(prev => ({ ...prev, [testName]: { success: true, ...result } }))
    } catch (error) {
      setResults(prev => ({ ...prev, [testName]: { success: false, error: error.message } }))
    }
  }

  const runAllTests = async () => {
    setTesting(true)
    setResults({})

    // API Health test removed - endpoint deprecated

    // 2. Authentication Test
    await runTest('Authentication', async () => {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
      })
      return { message: 'Login successful', token: !!data.access_token }
    })

    // 3. Users API
    await runTest('Users API', async () => {
      const data = await apiRequest('/users')
      return { message: `Found ${data.users?.length || 0} users`, count: data.users?.length }
    })

    // 4. Tickets API
    await runTest('Tickets API', async () => {
      const data = await apiRequest('/tickets')
      return { message: `Found ${data.tickets?.length || 0} tickets`, count: data.tickets?.length }
    })

    // 5. Analytics - SLA Adherence
    await runTest('SLA Analytics', async () => {
      const data = await apiRequest('/tickets/analytics/sla-adherence')
      return { message: `SLA: ${data.sla_adherence}%`, adherence: data.sla_adherence }
    })

    // 6. Analytics - Agent Performance
    await runTest('Agent Performance', async () => {
      const data = await apiRequest('/analytics/agent-performance-detailed')
      return { message: `Found ${data?.length || 0} agents`, count: data?.length }
    })

    // 7. Analytics - Ticket Aging
    await runTest('Ticket Aging', async () => {
      const data = await apiRequest('/analytics/ticket-aging')
      return { message: `${data.total_open_tickets} open tickets`, total: data.total_open_tickets }
    })

    // 8. Cloudinary Config
    await runTest('Cloudinary Config', async () => {
      const cloudName = cloudinaryService.cloudName
      const uploadPreset = cloudinaryService.uploadPreset
      return { 
        message: `Cloud: ${cloudName}, Preset: ${uploadPreset}`,
        configured: !!(cloudName && uploadPreset)
      }
    })

    // 9. Messages API
    await runTest('Messages API', async () => {
      const data = await apiRequest('/messages/ticket/TKT-1001/timeline')
      return { message: `Timeline has ${data?.length || 0} messages`, count: data?.length }
    })

    // 10. Alerts API
    await runTest('Alerts API', async () => {
      const data = await apiRequest('/alerts/1/count')
      return { message: `User has ${data.count} alerts`, count: data.count }
    })

    // 11. Ticket Creation
    await runTest('Ticket Creation', async () => {
      const newTicket = {
        title: 'Test Ticket - System Test',
        description: 'Automated test ticket creation',
        priority: 'Medium',
        category: 'Software',
        created_by: 1
      }
      const data = await apiRequest('/tickets', {
        method: 'POST',
        body: JSON.stringify(newTicket)
      })
      return { message: `Created ticket ${data.ticket_id}`, ticket_id: data.ticket_id }
    })

    // 12. Ticket Detail
    await runTest('Ticket Detail', async () => {
      const data = await apiRequest('/tickets/TKT-1001')
      return { message: `Loaded ticket ${data.ticket_id}`, status: data.status }
    })

    // 13. Timeline Messages
    await runTest('Timeline Messages', async () => {
      const testMessage = {
        ticket_id: 'TKT-1001',
        sender_id: 1,
        message: 'Test message from system test'
      }
      const data = await apiRequest('/messages', {
        method: 'POST',
        body: JSON.stringify(testMessage)
      })
      return { message: `Added message to timeline`, id: data.id }
    })

    // 14. Cloudinary Upload Test
    await runTest('Cloudinary Upload', async () => {
      try {
        // Create a small test file
        const canvas = document.createElement('canvas')
        canvas.width = 100
        canvas.height = 100
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#FF0000'
        ctx.fillRect(0, 0, 100, 100)
        
        return new Promise((resolve) => {
          canvas.toBlob(async (blob) => {
            const testFile = new File([blob], 'test.png', { type: 'image/png' })
            const result = await cloudinaryService.uploadFile(testFile, 'TEST-SYSTEM', 1)
            resolve({ message: `Upload successful`, url: result.url })
          })
        })
      } catch (error) {
        throw new Error(`Upload failed: ${error.message}`)
      }
    })

    setTesting(false)
  }

  const getStatusColor = (result) => {
    if (!result) return 'bg-gray-100'
    return result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  return (
    <div className="fixed top-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-md z-50 max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">System Test</h3>
        <button 
          onClick={runAllTests}
          disabled={testing}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Run Tests'}
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        {[
          'Authentication', 
          'Users API',
          'Tickets API',
          'SLA Analytics',
          'Agent Performance',
          'Ticket Aging',
          'Cloudinary Config',
          'Messages API',
          'Alerts API',
          'Ticket Creation',
          'Ticket Detail',
          'Timeline Messages',
          'Cloudinary Upload'
        ].map(test => (
          <div key={test} className={`p-2 rounded ${getStatusColor(results[test])}`}>
            <div className="font-medium">{test}</div>
            {results[test] && (
              <div className="text-xs mt-1">
                {results[test].success ? '✅' : '❌'} {results[test].message || results[test].error}
              </div>
            )}
          </div>
        ))}
      </div>

      {Object.keys(results).length > 0 && (
        <div className="mt-3 pt-3 border-t text-xs">
          <div className="font-medium">Summary:</div>
          <div>
            ✅ {Object.values(results).filter(r => r.success).length} passed
          </div>
          <div>
            ❌ {Object.values(results).filter(r => !r.success).length} failed
          </div>
        </div>
      )}
    </div>
  )
}