// Environment Check Component for debugging
import { getApiUrl } from '../../utils/apiUrl'

export default function EnvCheck() {
  const envInfo = {
    VITE_API_URL: import.meta.env?.VITE_API_URL,
    MODE: import.meta.env?.MODE,
    DEV: import.meta.env?.DEV,
    PROD: import.meta.env?.PROD,
    API_CONFIG_BASE_URL: (() => {
      try {
        return getApiUrl()
      } catch (e) {
        return 'Error: ' + e.message
      }
    })(),
    CLOUDINARY_CLOUD_NAME: import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Environment Debug</h4>
      {Object.entries(envInfo).map(([key, value]) => (
        <div key={key} className="mb-1">
          <span className="text-yellow-300">{key}:</span> {String(value) || 'undefined'}
        </div>
      ))}
    </div>
  )
}