import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { calculateHoursOpen, formatHoursOpen } from '../../utils/ticketUtils'

const API_URL = 'https://hotfix.onrender.com/api'

export default function TicketAgingAnalysis() {
  const [agingData, setAgingData] = useState({})

  useEffect(() => {
    fetch(`${API_URL}/tickets/analytics/aging`)
      .then(res => res.json())
      .then(setAgingData)
      .catch(console.error)
  }, [])

  const chartData = Object.entries(agingData).map(([bucket, data]) => ({
    bucket,
    count: data.count
  }))

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Ticket Aging Analysis</h3>
      {chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-3">
            {Object.entries(agingData).map(([bucket, data]) => (
              data.count > 0 && (
                <details key={bucket} className="border rounded-lg">
                  <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50 font-medium flex justify-between">
                    <span>{bucket}</span>
                    <span className="text-gray-600">{data.count} tickets</span>
                  </summary>
                  <div className="px-4 py-3 border-t bg-gray-50 space-y-2">
                    {data.tickets.map(ticket => {
                      const hoursOpen = calculateHoursOpen(ticket.created_at)
                      return (
                        <div key={ticket.id} className="flex justify-between items-center text-sm">
                          <div className="flex-1">
                            <span className="font-medium">{ticket.id}</span>
                            <span className="text-gray-600 ml-2">{ticket.title}</span>
                            <span className="text-gray-500 ml-2 text-xs">({formatHoursOpen(hoursOpen)} open)</span>
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
                      )
                    })}
                  </div>
                </details>
              )
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-center py-8">No aging data available</p>
      )}
    </div>
  )
}
