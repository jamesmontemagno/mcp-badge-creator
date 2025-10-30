import { useState, useEffect } from 'react'
import { NavLink, Outlet, Route, BrowserRouter, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import MCP from './pages/MCP'
import Extensions from './pages/Extensions'
import Packages from './pages/Packages'
import Settings from './pages/Settings'

type ThemeType = 'system' | 'light' | 'dark' | 'green' | 'tron'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/mcp', label: 'MCP' },
  { to: '/extensions', label: 'Extensions' },
  { to: '/packages', label: 'Packages' },
]

function Layout() {
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('readme-badge-theme') as ThemeType
    return savedTheme || 'system'
  })

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Apply theme to document
  useEffect(() => {
    const applyTheme = (themeName: ThemeType) => {
      // Remove all theme classes
      document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-green', 'theme-tron')
      
      if (themeName === 'system') {
        // Use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.classList.add(prefersDark ? 'theme-dark' : 'theme-light')
      } else {
        document.documentElement.classList.add(`theme-${themeName}`)
      }
    }

    applyTheme(theme)
    localStorage.setItem('readme-badge-theme', theme)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="app-shell">
      <div className="app-top-bar">
        <div className="brand">
          <span className="brand-mark">README</span>
          <span className="brand-text">Badge Creator</span>
        </div>
        
        <button 
          className="hamburger-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <nav className={`app-nav ${mobileMenuOpen ? 'mobile-open' : ''}`} aria-label="Primary">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? 'nav-link settings-link active' : 'nav-link settings-link')}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="settings-icon">⚙️</span>
            <span className="settings-label">Settings</span>
          </NavLink>
        </nav>
      </div>
      <main className="app-main">
        <Outlet context={{ theme, setTheme }} />
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="mcp" element={<MCP />} />
          <Route path="extensions" element={<Extensions />} />
          <Route path="packages" element={<Packages />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
