import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { polyfillCountryFlagEmojis } from 'country-flag-emoji-polyfill'
import './index.css'
import App from './App.jsx'

// Windows/Chromium não renderiza bandeiras unicode nativamente — carrega fonte Twemoji só nesses casos.
polyfillCountryFlagEmojis()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
