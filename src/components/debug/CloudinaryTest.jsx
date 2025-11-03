import { useState } from 'react'
import cloudinaryService from '../../services/cloudinaryService'

export default function CloudinaryTest() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState(null)

  const checkConfig = () => {
    const config = {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dn1dznhej',
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'servicedesk_preset',
      configured: !!(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
    }
    setConfig(config)
  }

  const testUpload = async () => {
    if (!file) return
    
    setLoading(true)
    try {
      const result = await cloudinaryService.uploadFile(file, 'TEST-001', 1)
      setResult({ success: true, ...result })
    } catch (error) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed top-4 left-4 bg-white border rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="font-bold mb-3">Cloudinary Test</h3>
      
      <div className="space-y-3">
        <button 
          onClick={checkConfig}
          className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm"
        >
          Check Config
        </button>
        
        {config && (
          <div className="text-xs bg-gray-100 p-2 rounded">
            <pre>{JSON.stringify(config, null, 2)}</pre>
          </div>
        )}
        
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full text-sm"
        />
        
        <button 
          onClick={testUpload}
          disabled={!file || loading}
          className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Test Upload'}
        </button>
        
        {result && (
          <div className="text-xs bg-gray-100 p-2 rounded max-h-32 overflow-auto">
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}