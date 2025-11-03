// Cloudinary service for frontend file uploads
class CloudinaryService {
  constructor() {
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dn1dznhej'
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'servicedesk_preset'
  }

  async uploadFile(file, ticketId, userId) {
    if (!this.cloudName || !this.uploadPreset) {
      throw new Error('Cloudinary configuration missing')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', this.uploadPreset)
    formData.append('folder', `servicedesk/tickets/${ticketId}`)
    formData.append('public_id', `attachment_${userId}_${ticketId}_${Date.now()}`)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`,
      { method: 'POST', body: formData }
    )

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }

    const result = await response.json()
    
    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width || 0,
      height: result.height || 0,
      format: result.format || 'unknown',
      bytes: result.bytes || 0,
      resource_type: result.resource_type
    }
  }
}

export default new CloudinaryService()