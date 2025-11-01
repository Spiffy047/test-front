import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { secureApiRequest } from '../../utils/api'


export default function RealtimeSLADashboard({ onCardClick }) {
  const [slaData, setSlaData] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [allTickets, setAllTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSLAData()
    const interval = setInterval(fetchSLAData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSLAData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [slaData, ticketsData] = await Promise.all([
        secureApiRequest('/sla/realtime-adherence').catch(err => {
          console.error('Failed to fetch SLA data:', err)
          return {}
        }),
        secureApiRequest('/tickets').catch(err => {
          console.error('Failed to fetch tickets:', err)
          return []
        })
      ])
      
      setSlaData(slaData || {})
      setAllTickets(Array.isArray(ticketsData) ? ticketsData : [])
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Failed to fetch SLA data:', err)
      setError(err.message || 'Failed to load SLA dashboard data')
      setSlaData(null)
      setAllTickets([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Real-Time SLA Adherence</h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading SLA dashboard...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Real-Time SLA Adherence</h3>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 font-medium">Error Loading Dashboard</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
        </div>
      </div>
    )
  }

  if (!slaData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Real-Time SLA Adherence</h3>
        <div className="text-center text-gray-500 py-8">No SLA data available</div>
      </div>
    )
  }

  const priorityChartData = slaData?.priority_breakdown ? Object.entries(slaData.priority_breakdown).map(([priority, data]) => ({
    priority,
    'Met SLA': data?.met_sla || 0,
    'Violated SLA': data?.violated_sla || 0,
    adherence: data?.adherence_percentage || 0
  })) : []

  const timeAnalysisData = slaData?.time_analysis ? Object.entries(slaData.time_analysis).map(([period, data]) => ({
    period: period.replace('last_', '').replace('h', ' hours').replace('d', ' days'),
    'Met SLA': data?.met_sla || 0,
    'Violated': data?.violated_sla || 0,
    adherence: data?.adherence_percentage || 0
  })) : []

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Real-Time SLA Adherence</h3>
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate?.toLocaleTimeString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onCardClick?.({ title: 'All Tickets', data: allTickets })}>
            <div className="text-sm text-gray-600">Total Tickets</div>
            <div className="text-3xl font-bold text-blue-600">{slaData?.overall?.total_tickets || 0}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onCardClick?.({ title: 'Met SLA (Closed)', data: Array.isArray(allTickets) ? allTickets.filter(t => t?.status === 'Closed' && !t?.sla_violated) : [] })}>
            <div className="text-sm text-gray-600">Met SLA (Closed)</div>
            <div className="text-3xl font-bold text-green-600">{slaData?.overall?.closed_met_sla || 0}</div>
            <div className="text-xs text-gray-500 mt-1">
              {slaData?.overall?.closed_adherence_percentage || 0}% adherence
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onCardClick?.({ title: 'Violated SLA Tickets', data: Array.isArray(allTickets) ? allTickets.filter(t => t?.sla_violated) : [] })}>
            <div className="text-sm text-gray-600">Violated SLA</div>
            <div className="text-3xl font-bold text-red-600">
              {(slaData?.overall?.closed_violated_sla || 0) + (slaData?.overall?.open_violated || 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {slaData?.overall?.open_violated || 0} currently open
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onCardClick?.({ title: 'At Risk Tickets', data: Array.isArray(allTickets) ? allTickets.filter(t => t?.status !== 'Closed' && !t?.sla_violated) : [] })}>
            <div className="text-sm text-gray-600">At Risk</div>
            <div className="text-3xl font-bold text-amber-600">{slaData?.overall?.open_at_risk || 0}</div>
            <div className="text-xs text-gray-500 mt-1">
              Open tickets near SLA
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3">SLA Adherence by Priority</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Met SLA" fill="#10b981" />
              <Bar dataKey="Violated SLA" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-semibold mb-3">Priority Breakdown</h4>
            <div className="space-y-3">
              {slaData?.priority_breakdown ? Object.entries(slaData.priority_breakdown).map(([priority, data]) => (
                <div key={priority} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-medium px-2 py-1 rounded text-sm ${
                      priority === 'Critical' ? 'bg-red-100 text-red-800' :
                      priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {priority}
                    </span>
                    <span className={`font-bold ${
                      (data?.adherence_percentage || 0) >= 90 ? 'text-green-600' :
                      (data?.adherence_percentage || 0) >= 75 ? 'text-amber-600' :
                      'text-red-600'
                    }`}>
                      {data?.adherence_percentage || 0}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {data?.met_sla || 0} met / {data?.violated_sla || 0} violated
                    <span className="ml-2 text-xs">
                      (Target: {data?.target_hours || 0}h)
                    </span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (data?.adherence_percentage || 0) >= 90 ? 'bg-green-500' :
                        (data?.adherence_percentage || 0) >= 75 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${data?.adherence_percentage || 0}%` }}
                    />
                  </div>
                </div>
              )) : <div className="text-gray-500">No priority data available</div>}
            </div>
          </div>

          <div>
            <h4 className="text-md font-semibold mb-3">Average Resolution Times</h4>
            <div className="space-y-3">
              {slaData?.average_resolution_times ? Object.entries(slaData.average_resolution_times).map(([priority, data]) => (
                <div key={priority} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{priority}</span>
                    <span className={`font-bold ${
                      data?.within_target ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {data?.average_hours || 0}h
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Target: {data?.target_hours || 0}h
                    {data?.within_target ? (
                      <span className="ml-2 text-green-600">Within target</span>
                    ) : (
                      <span className="ml-2 text-red-600">Exceeds target</span>
                    )}
                  </div>
                </div>
              )) : <div className="text-gray-500">No resolution time data available</div>}
            </div>
          </div>
        </div>

        {timeAnalysisData.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-semibold mb-3">Time-Based Analysis</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={timeAnalysisData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Met SLA" fill="#10b981" />
                <Bar dataKey="Violated" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">SLA Targets</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {slaData?.sla_targets ? Object.entries(slaData.sla_targets).map(([priority, hours]) => (
            <div key={priority} className="bg-white rounded p-2">
              <span className="font-medium">{priority}:</span> {hours || 0}h
            </div>
          )) : <div className="text-gray-500">No SLA targets available</div>}
        </div>
      </div>
    </div>
  )
}
