import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './components/ui/ToastProvider.jsx'
import { initTranslation } from './utils/translation.js'
import { EN, isEnglish } from './i18n'
import { setDictionary } from './i18n/domTranslate.js'
import { startWebVitals } from './utils/webVitals.js'
import { initTagManager } from './utils/tagManager.js'

// Vitesse réelle des visiteurs (Core Web Vitals), envoyée au backend.
startWebVitals()
// Google Tag Manager : seulement après accord pour les cookies optionnels.
initTagManager()

function start() {
  initTranslation()
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
    </StrictMode>,
  )
}

// En anglais, le dictionnaire des pages non traduites dans le code (tableau de bord,
// éditeur…) est chargé avant le premier affichage : pas d'éclair de français.
// En français, rien de plus à charger.
if (isEnglish) {
  import('./i18n/en-app.js')
    .then(({ default: EN_APP }) => setDictionary({ ...EN_APP, ...EN }))
    .catch(() => setDictionary(EN))
    .finally(start)
} else {
  start()
}
