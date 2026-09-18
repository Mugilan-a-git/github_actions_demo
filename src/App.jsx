import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [version, setVersion] = useState('')
  const [updateState, setUpdateState] = useState('idle') // idle, checking, available, downloading, downloaded, up-to-date, error
  const [updateMessage, setUpdateMessage] = useState(null)
  const [updateVersion, setUpdateVersion] = useState('')
  const [downloadProgress, setDownloadProgress] = useState(0)

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getVersion().then(setVersion)
      
      window.electronAPI.onUpdateProgress((progress) => {
        setDownloadProgress(Math.round(progress.percent))
      })

      window.electronAPI.onUpdateDownloaded((info) => {
        setUpdateState('downloaded')
        setUpdateMessage(`Update downloaded: ${info.version}`)
      })
    }
  }, [])

  const handleCheckForUpdates = async () => {
    if (!window.electronAPI) return;
    
    setUpdateState('checking')
    setUpdateMessage('Checking for updates...')
    
    try {
      const result = await window.electronAPI.checkForUpdates()
      if (result?.status === 'available') {
        setUpdateState('available')
        setUpdateVersion(result.version)
        setUpdateMessage(`Update available: ${result.version}`)
      } else if (result?.status === 'not-available') {
        setUpdateState('up-to-date')
        setUpdateMessage('You are up to date.')
      } else if (result?.status === 'error') {
        setUpdateState('error')
        setUpdateMessage('Update check failed.')
      } else {
        setUpdateState('idle')
        setUpdateMessage(null)
      }
    } catch (error) {
      console.error(error)
      setUpdateState('error')
      setUpdateMessage('Update check failed.')
    }
  }

  const handleDownloadUpdate = async () => {
    if (!window.electronAPI || updateState !== 'available') return;
    
    setUpdateState('downloading')
    setDownloadProgress(0)
    setUpdateMessage('Downloading update...')
    
    try {
      const result = await window.electronAPI.downloadUpdate()
      if (result?.status === 'error') {
        setUpdateState('error')
        setUpdateMessage('Update download failed.')
      }
    } catch (error) {
      console.error(error)
      setUpdateState('error')
      setUpdateMessage('Update download failed.')
    }
  }

  const handleInstallUpdate = () => {
    if (!window.electronAPI || updateState !== 'downloaded') return;
    window.electronAPI.installUpdate()
  }

  return (
    <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>Hello World version 3.0</h1>
      <p>React + Electron</p>
      {version && <p>Version: {version}</p>}
      
      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={handleCheckForUpdates} 
          disabled={updateState === 'checking' || updateState === 'downloading'}
          style={{ padding: '10px 20px', cursor: (updateState === 'checking' || updateState === 'downloading') ? 'not-allowed' : 'pointer', marginRight: '10px' }}
        >
          {updateState === 'checking' ? 'Checking...' : 'Check for Updates'}
        </button>
        
        {updateState === 'available' && (
          <button 
            onClick={handleDownloadUpdate}
            style={{ padding: '10px 20px', cursor: 'pointer', marginRight: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Download Update
          </button>
        )}

        {updateState === 'downloaded' && (
          <button 
            onClick={handleInstallUpdate}
            style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Restart & Install
          </button>
        )}
        
        {updateMessage && (
          <div style={{ marginTop: '15px' }}>
            <p style={{ 
              color: updateState === 'error' ? 'red' : updateState === 'downloaded' ? 'green' : 'blue' 
            }}>
              {updateMessage}
            </p>
            {updateState === 'downloading' && (
              <div style={{ marginTop: '10px', width: '200px', margin: '10px auto', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${downloadProgress}%`, backgroundColor: '#007bff', height: '10px' }}></div>
                <small>{downloadProgress}%</small>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
