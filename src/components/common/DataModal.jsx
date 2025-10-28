import { getPriorityStyles, getStatusStyles } from '../../utils/styleHelpers'

const ModalHeader = ({ title, onClose }) => (
  <div className="flex justify-between items-center p-6 border-b">
    <h2 className="text-xl font-bold">{title}</h2>
    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
  </div>
)

const EmptyState = () => (
  <div className="p-6 text-center text-gray-500">No data available</div>
)

export default function DataModal({ title, data, onClose }) {
  const modalClasses = "bg-white rounded-lg shadow-xl w-full max-h-[80vh] overflow-hidden"
  const overlayClasses = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  
  if (!data) {
    return (
      <div className={overlayClasses} onClick={onClose}>
        <div className={modalClasses} style={{maxWidth: '76rem'}} onClick={e => e.stopPropagation()}>
          <ModalHeader title={title} onClose={onClose} />
          <EmptyState />
        </div>
      </div>
    )
  }

  return (
    <div className={overlayClasses} onClick={onClose}>
      <div className={modalClasses} style={{maxWidth: '76rem'}} onClick={e => e.stopPropagation()}>
        <ModalHeader title={title} onClose={onClose} />
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          {!Array.isArray(data) || data.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No data available</div>
          ) : (
            <div className="space-y-3">
              {data.map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-lg">{item.id || item.title}</div>
                    <div className="flex gap-2">
                      {item.status && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyles(item.status)}`}>
                          {item.status}
                        </span>
                      )}
                      {item.priority && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityStyles(item.priority)}`}>
                          {item.priority}
                        </span>
                      )}
                    </div>
                  </div>
                  {item.title && <div className="text-gray-900 mb-1">{item.title}</div>}
                  {item.description && <div className="text-gray-600 text-sm mb-2">{item.description}</div>}
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    {item.category && <div>Category: {item.category}</div>}
                    {item.created_at && <div>Created: {new Date(item.created_at).toLocaleString()}</div>}
                    {item.assigned_to && <div>Assigned: {item.assigned_to}</div>}
                    {item.created_by_name && <div>Created by: {item.created_by_name}</div>}
                    {item.sla_violated !== undefined && (
                      <div className={item.sla_violated ? 'text-red-600 font-medium' : 'text-green-600'}>
                        SLA: {item.sla_violated ? 'Violated' : 'Met'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
