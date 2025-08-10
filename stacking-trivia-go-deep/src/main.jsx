import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './pwa.css'
import App from './App.jsx'
import TopLevelErrorBoundary from './components/TopLevelErrorBoundary.jsx'
import { initPWA } from './utils/pwa.js'
import performanceMonitor from './utils/performance.js'

// Add immediate console output to check if script is running
console.log('%c🚀 MAIN.JSX: Script started!', 'color: green; font-size: 16px; font-weight: bold;');
console.log('🔍 Environment check:', {
  NODE_ENV: import.meta.env.NODE_ENV,
  location: window.location.href,
  userAgent: navigator.userAgent.substring(0, 50)
});

console.log('📊 Main.jsx: Initializing performance monitor...');
// Initialize performance monitoring
try {
  performanceMonitor.init()
  console.log('✅ Performance monitor initialized');
} catch (error) {
  console.error('❌ Performance monitor error:', error);
}

console.log('📱 Main.jsx: Initializing PWA...');
// Initialize PWA features
try {
  initPWA()
  console.log('✅ PWA initialized');
} catch (error) {
  console.error('❌ PWA initialization error:', error);
}

console.log('⚛️ Main.jsx: Creating React root...');
try {
  const rootElement = document.getElementById('root');
  console.log('🎯 Root element found:', !!rootElement);
  
  const root = createRoot(rootElement);
  console.log('🌳 React root created successfully');
  
  console.log('🎬 Main.jsx: Rendering App component...');
  root.render(
    <StrictMode>
      <TopLevelErrorBoundary>
        <App />
      </TopLevelErrorBoundary>
    </StrictMode>,
  )
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('❌ CRITICAL ERROR in main.jsx:', error);
  // Fallback error display
  document.body.innerHTML = `
    <div style="padding: 20px; color: red; font-family: monospace;">
      <h2>App Loading Error</h2>
      <p>Error: ${error.message}</p>
      <p>Check browser console for details</p>
    </div>
  `;
}
