// frontend/src/App.jsx

import { useState, useEffect } from 'react'
import axios from 'axios'
import ImageUpload from './components/ImageUpload'

function App() {
  // State to store backend connection status
  const [backendStatus, setBackendStatus] = useState('connecting...')
  const [backendData, setBackendData] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  // Function to test backend connection
  const testBackendConnection = async () => {
    try {
      // Make API call to our backend
      const response = await axios.get('http://localhost:8000/api/test')
      
      setBackendData(response.data)
      setBackendStatus('Connected successfully!')
      setIsConnected(true)
      
      console.log('Backend response:', response.data)
    } catch (error) {
      setBackendStatus('Connection failed - make sure backend is running')
      setIsConnected(false)
      console.error('Backend connection error:', error)
    }
  }

  // Test connection when component loads
  useEffect(() => {
    testBackendConnection()
  }, [])

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #fef3c7, #fbbf24, #dc2626)', padding: '0'}}>
      {/* Header */}
      <header style={{background: 'linear-gradient(to right, #b45309, #dc2626)', color: '#fef3c7', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}>
        <div style={{maxWidth: '72rem', margin: '0 auto', padding: '2rem 1rem'}}>
          <div style={{textAlign: 'center'}}>
            <h1 style={{fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
              🎨 Vietnamese Art Style Transfer
            </h1>
            <p style={{color: '#fde68a', fontSize: '1.125rem'}}>
              Transform your photos with traditional Vietnamese art styles using AI
            </p>
            <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.875rem'}}>
              <span style={{backgroundColor: '#991b1b', border: '1px solid #fde047', padding: '0.25rem 0.75rem', borderRadius: '9999px'}}>AI Face Detected Crop</span>
              <span style={{backgroundColor: '#991b1b', border: '1px solid #fde047', padding: '0.25rem 0.75rem', borderRadius: '9999px'}}>Cultural Inspired</span>
              <span style={{backgroundColor: '#991b1b', border: '1px solid #fde047', padding: '0.25rem 0.75rem', borderRadius: '9999px'}}>Real-time Processing</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{maxWidth: '64rem', margin: '0 auto', padding: '2rem 1rem'}}>
        {/* Image Upload Component */}
        <ImageUpload />

        {/* Features Section */}
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div className="bg-amber-50 rounded-xl shadow-lg p-6 border-2 border-amber-200">
            <div className="text-center mb-4">
              <h3 className="inline-block bg-red-700 text-yellow-100 px-4 py-2 rounded-lg font-bold text-lg shadow-md border-2 border-yellow-400">✓ AI features</h3>
            </div>
            <ul className="space-y-2 text-amber-900">
              <li>• Smart face & object detection for optimal cropping</li>
              <li>• Real-time style transfer processing</li>
              <li>• Different Vietnamese art style options</li>
              <li>• High-quality image output with download function</li>
            </ul>
          </div>
          
          <div className="bg-amber-50 rounded-xl shadow-lg p-6 border-2 border-amber-200">
            <div className="text-center mb-4">
              <h3 className="inline-block bg-red-700 text-yellow-100 px-4 py-2 rounded-lg font-bold text-lg shadow-md border-2 border-yellow-400">✓ Cultural Heritage</h3>
            </div>
            <ul className="space-y-2 text-amber-900">
              <li>• Lacquer painting: 1000+ year traditional art</li>
              <li>• Silk painting: Delicate French-influenced style</li>
              <li>• Dong Ho prints: UNESCO recognized folk art</li>
              <li>• Preserving Vietnamese artistic traditions</li>
            </ul>
          </div>
        </div>

        {/* Art Styles Preview */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4 text-vietnamese-blue">
            Available Art Styles
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="w-16 h-16 bg-vietnamese-gold rounded-lg mx-auto mb-3"></div>
              <h3 className="font-semibold">Lacquer Painting</h3>
              <p className="text-sm text-gray-600">Glossy, layered traditional style</p>
            </div>
            
            <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="w-16 h-16 bg-blue-200 rounded-lg mx-auto mb-3"></div>
              <h3 className="font-semibold">Silk Painting</h3>
              <p className="text-sm text-gray-600">Delicate, flowing brushstrokes</p>
            </div>
            
            <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="w-16 h-16 bg-red-200 rounded-lg mx-auto mb-3"></div>
              <h3 className="font-semibold">Dong Ho Prints</h3>
              <p className="text-sm text-gray-600">Bold, colorful folk art</p>
            </div>
          </div>
          
          <p className="text-center text-gray-500 mt-6">
            New figures coming soon! 
          </p>
        </div>
      </main>
    </div>
  )
}

export default App