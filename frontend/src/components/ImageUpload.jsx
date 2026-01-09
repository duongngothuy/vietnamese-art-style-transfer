// frontend/src/components/ImageUpload.jsx

import { useState } from 'react'
import axios from 'axios'

function ImageUpload() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [selectedStyle, setSelectedStyle] = useState('lacquer')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)

  const artStyles = [
    {
      id: 'lacquer',
      name: 'Lacquer Painting',
      description: 'Glossy, layered traditional style with gold accents',
      color: 'bg-yellow-400'
    },
    {
      id: 'silk',
      name: 'Silk Painting',
      description: 'Delicate, flowing brushstrokes with soft transitions',
      color: 'bg-blue-200'
    },
    {
      id: 'dongho',
      name: 'Dong Ho Prints',
      description: 'Bold, colorful folk art with geometric patterns',
      color: 'bg-red-200'
    }
  ]

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB')
        return
      }
      
      setSelectedImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setResult(null)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    
    if (file) {
      const fakeEvent = { target: { files: [file] } }
      handleFileSelect(fakeEvent)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const processImage = async () => {
    console.log('processImage called!')
    
    if (!selectedImage) {
      alert('Please select an image first')
      return
    }

    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append('image', selectedImage)
      formData.append('style', selectedStyle)

      console.log('Sending request to backend...')

      const response = await axios.post(
        'https://vietnamese-art-style-transfer.onrender.com/api/style-transfer',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      console.log('Backend response:', response.data)
      setResult(response.data)
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Error processing image. Check console for details.')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadImage = (base64Data, style) => {
    const link = document.createElement('a')
    link.href = `data:image/jpeg;base64,${base64Data}`
    link.download = `vietnamese-art-${style}-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const shareImage = async (base64Data) => {
    if (navigator.share) {
      // Convert base64 to blob for sharing
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/jpeg' })
      const file = new File([blob], 'vietnamese-art.jpg', { type: 'image/jpeg' })
      
      try {
        await navigator.share({
          title: 'Vietnamese Art Style Transfer',
          text: 'Check out my photo transformed with traditional Vietnamese art!',
          files: [file]
        })
      } catch (error) {
        console.log('Sharing failed:', error)
        copyToClipboard(base64Data)
      }
    } else {
      copyToClipboard(base64Data)
    }
  }

  const copyToClipboard = (base64Data) => {
    const imageUrl = `data:image/jpeg;base64,${base64Data}`
    navigator.clipboard.writeText(imageUrl)
    alert('Image data copied to clipboard!')
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-2xl font-semibold mb-6 text-blue-900">
        Transform Your Photo
      </h2>

      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-500 transition-colors duration-200"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {!previewUrl ? (
          <div>
            <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">Drag and drop your image here, or</p>
            <label className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 cursor-pointer inline-block">
              Choose File
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 5MB</p>
          </div>
        ) : (
          <div>
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
            />
            <button
              onClick={() => {
                setSelectedImage(null)
                setPreviewUrl(null)
                setResult(null)
              }}
              className="mt-4 text-red-600 hover:text-red-800"
            >
              Remove Image
            </button>
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Choose Art Style:</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {artStyles.map((style) => (
              <label
                key={style.id}
                className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedStyle === style.id
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="style"
                  value={style.id}
                  checked={selectedStyle === style.id}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="hidden"
                />
                <div className={`w-12 h-12 ${style.color} rounded-lg mb-3 mx-auto`}></div>
                <h4 className="font-semibold text-center">{style.name}</h4>
                <p className="text-sm text-gray-600 text-center mt-1">{style.description}</p>
              </label>
            ))}
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="mt-6 text-center">
          <button
            onClick={processImage}
            disabled={isProcessing}
            className={`bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isProcessing ? 'Processing...' : 'Apply Art Style'}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Processing Complete!</h3>
          <p className="text-green-700">{result.message}</p>
          
          {result.styled_image?.styled_image_base64 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Your Vietnamese Art Style Transfer:</h4>
              <div className="flex justify-center">
                <img 
                  src={`data:image/jpeg;base64,${result.styled_image.styled_image_base64}`}
                  alt="Styled artwork"
                  className="max-w-full max-h-96 rounded-lg shadow-md"
                  onError={(e) => console.log('Image load error:', e)}
                  onLoad={() => console.log('Image loaded successfully!')}
                />
              </div>
              
              {/* Download Button */}
              <div className="text-center mt-4">
                <button
                  onClick={() => downloadImage(result.styled_image.styled_image_base64, selectedStyle)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 mr-4"
                >
                  📥 Download Artwork
                </button>
                <button
                  onClick={() => shareImage(result.styled_image.styled_image_base64)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  📤 Share
                </button>
              </div>
              
              <div className="mt-2 text-sm text-gray-600 text-center">
                <p><strong>Style:</strong> {result.selected_style?.name}</p>
                <p><strong>Effect:</strong> {result.selected_style?.characteristics}</p>
                {result.smart_crop?.crop_detected && (
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <p><strong>🤖 AI Smart Crop:</strong> {result.smart_crop.detection_type}</p>
                    <p className="text-xs">{result.smart_crop.recommendation}</p>
                    <p className="text-xs">Confidence: {(result.smart_crop.confidence * 100).toFixed(0)}%</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-green-600">View Technical Details</summary>
            <pre className="text-xs text-green-600 mt-2 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}

export default ImageUpload