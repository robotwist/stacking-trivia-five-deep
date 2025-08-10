import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './pwa.css'
import App from './App.jsx'
import { initPWA } from './utils/pwa.js'
import performanceMonitor from './utils/performance.js'

// Initialize performance monitoring
performanceMonitor.init()

// Initialize PWA features
initPWA()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
