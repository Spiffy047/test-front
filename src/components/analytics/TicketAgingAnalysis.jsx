import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'


const API_URL = 'https://hotfix.onrender.com/api'

export default function TicketAgingAnalysis() {
  const [agingData, setAgingData] = useState({})

  useEffect(() => {
    fetch(`${API_URL}/tickets/analytics/aging`)
      .then(res => res.json())
      .then(setAgingData)
      .catch(console.error)
  }, [])

  const chartData = agingData.aging_data || []

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Ticket Aging Analysis</h3>
      {chartData.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Total Open Tickets: {agingData.total_open_tickets} | Average Age: {agingData.average_age_hours}h
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
        </>
      ) : (
        <p className="text-gray-500 text-center py-8">No aging data available</p>
      )}
    </div>
  )
}
