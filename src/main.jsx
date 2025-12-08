import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CultivationProvider } from './context/CultivationContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CultivationProvider>
      <App />
    </CultivationProvider>
  </StrictMode>,
)