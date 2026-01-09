import ImageUpload from './components/ImageUpload'

function App() {
  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #fef3c7, #fbbf24, #dc2626)'}}>
      <header style={{background: 'linear-gradient(to right, #b45309, #dc2626)', color: '#fef3c7', padding: '3rem 1rem', textAlign: 'center'}}>
        <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
          Vietnamese Art Style Transfer
        </h1>
        <p style={{color: '#fde68a', fontSize: '1.125rem'}}>
          Transform your photos with traditional Vietnamese art styles
        </p>
      </header>

      <main style={{maxWidth: '900px', margin: '3rem auto', padding: '0 1rem'}}>
        <ImageUpload />
      </main>
    </div>
  )
}

export default App