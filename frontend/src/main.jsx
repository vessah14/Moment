import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './components/ui/ToastProvider.jsx'
import { installStaleBuildRecovery } from './utils/staleBuild.js'
import { initTranslation } from './utils/translation.js'
import { startWebVitals } from './utils/webVitals.js'

// Nouvelle version mise en ligne pendant la visite : rechargement automatique (une fois).
installStaleBuildRecovery()
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
