import { useState } from 'react'
import cloudinaryService from '../../services/cloudinaryService'

export default function CloudinaryImageTest() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const testImageUpload = async () => {
    setLoading(true)
    try {
      // Create test image
      const canvas = document.createElement('canvas')
      canvas.width = 200
      canvas.height = 200
      const ctx = canvas.getContext('2d')
      
      // Draw a simple test pattern
      ctx.fillStyle = '#FF0000'
      ctx.fillRect(0, 0, 100, 100)
      ctx.fillStyle = '#00FF00'
      ctx.fillRect(100, 0, 100, 100)
      ctx.fillStyle = '#0000FF'
      ctx.fillRect(0, 100, 100, 100)
      ctx.fillStyle = '#FFFF00'
      ctx.fillRect(100, 100, 100, 100)
      
      canvas.toBlob(async (blob) => {
        const testFile = new File([blob], 'test-image.png', { type: 'image/png' })
        
        try {
          const uploadResult = await cloudinaryService.uploadFile(testFile, 'TEST-IMG', 1)
          setResult({
            success: true,
            ...uploadResult,
            testUrl: uploadResult.url
          })
        } catch (error) {
          setResult({
            success: false,
            error: error.message
          })
        } finally {
          setLoading(false)
        }
      }, 'image/png')
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      })
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white border rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-bold mb-3">Cloudinary Image Test</h3>
      
      <button 
        onClick={testImageUpload}
        disabled={loading}
        className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm disabled:opacity-50 mb-3"
      >
        {loading ? 'Uploading...' : 'Test Image Upload'}
      </button>
      
      {result && (
        <div className="space-y-2">
          <div className={`p-2 rounded text-xs ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
            {result.success ? '✅ Upload Success' : '❌ Upload Failed'}
          </div>
          
          {result.success && (
            <>
              <div className="text-xs">
                <strong>URL:</strong> 
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 break-all">
                  {result.url}
                </a>
              </div>
              
              <div className="text-xs">
                <strong>Size:</strong> {result.width}x{result.height} ({Math.round(result.bytes/1024)}KB)
              </div>
              
              <div className="border rounded p-2">
                <div className="text-xs mb-1">Preview:</div>
                <img 
                  src={result.url} 
                  alt="Test upload" 
                  className="max-w-full h-auto"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'block'
                  }}
                />
                <div style={{display: 'none'}} className="text-red-500 text-xs">
                  ❌ Image failed to load
                </div>
              </div>
            </>
          )}
          
          {result.error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              {result.error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}