import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [version, setVersion] = useState('')

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getVersion().then(setVersion)
    }
  }, [])

  return (
    <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>Hello World</h1>
      <p>React + Electron</p>
      {version && <p>Version: {version}</p>}
    </div>
  )
}

export default App
