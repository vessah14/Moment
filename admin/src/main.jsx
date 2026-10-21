import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { installStaleBuildRecovery } from './utils/staleBuild.js'

// Nouvelle version mise en ligne pendant la visite : rechargement automatique (une fois).
installStaleBuildRecovery()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
