import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BadgeThemeProvider } from './BadgeThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BadgeThemeProvider>
      <App />
    </BadgeThemeProvider>
  </StrictMode>,
)
