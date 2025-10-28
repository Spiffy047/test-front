import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'


const API_URL = 'https://hotfix.onrender.com/api'

export default function TicketAgingAnalysis() {
  const [agingData, setAgingData] = useState({})

  useEffect(() => {
    fetch(`${API_URL}/analytics/ticket-aging`)
      .then(res => res.json())
      .then(setAgingData)
      .catch(console.error)
  }, [])

  const chartData = agingData.aging_data || []
  const hasData = chartData.some(item => item.count > 0)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Ticket Aging Analysis</h3>
      {hasData ? (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Total Open Tickets: {agingData.total_open_tickets || 0} | Average Age: {agingData.average_age_hours || 0}h
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age_range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {chartData.map(item => (
              <div key={item.age_range} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                <div className="text-sm text-gray-600">{item.age_range}</div>
              </div>
            ))}
          </div>
          {agingData.buckets && Object.entries(agingData.buckets).map(([range, tickets]) => (
            tickets.length > 0 && (
              <details key={range} className="mt-4 border rounded-lg">
                <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50 font-medium flex justify-between">
                  <span>{range}</span>
                  <span className="text-gray-600">{tickets.length} tickets</span>
                </summary>
                <div className="px-4 py-3 border-t bg-gray-50 space-y-2">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="flex justify-between items-center text-sm">
                      <div className="flex-1">
                        <span className="font-medium">{ticket.id}</span>
                        <span className="text-gray-600 ml-2">{ticket.title}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          ticket.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                          ticket.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                          ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.priority}
                        </span>
                        {ticket.sla_violated && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                            SLA Violated
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )
          ))}
        </>
      ) : (
        <p className="text-gray-500 text-center py-8">No aging data available</p>
      )}
    </div>
  )
}
