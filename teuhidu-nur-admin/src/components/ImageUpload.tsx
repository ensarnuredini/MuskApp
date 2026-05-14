import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

interface ImageUploadProps {
  currentUrl?: string
  onUpload: (url: string) => void
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ currentUrl, onUpload }) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    setUploading(true)
    setProgress(0)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = fileName

      // Simulate progress since Supabase JS doesn't provide upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      clearInterval(progressInterval)

      if (uploadError) throw uploadError

      setProgress(100)

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      onUpload(urlData.publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
      setPreview(currentUrl ?? null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Product Image
      </label>

      {preview && (
        <div className="relative w-32 h-40 rounded-lg overflow-hidden border border-gray-200">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 disabled:opacity-50"
      />

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-amber-600 h-2 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
