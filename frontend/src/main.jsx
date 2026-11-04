import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './components/ui/ToastProvider.jsx'
import { initTranslation } from './utils/translation.js'
import { startWebVitals } from './utils/webVitals.js'

initTranslation()
// Vitesse réelle des visiteurs (Core Web Vitals), envoyée au backend.
startWebVitals()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
