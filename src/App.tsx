import { useState, useEffect } from 'react'
import { NavLink, Link, Outlet, Route, BrowserRouter, Routes, useLocation } from 'react-router-dom'
import styles from './App.module.css'
import Home from './pages/Home'
import MCP from './pages/MCP'
import Extensions from './pages/Extensions'
import Packages from './pages/Packages'
import Repository from './pages/Repository'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

type ThemeType = 'system' | 'light' | 'dark' | 'green' | 'tron' | 'pink'

const navItems = [
  { to: '/mcp', label: 'MCP', end: false },
  { to: '/extensions', label: 'Extensions', end: false },
  { to: '/packages', label: 'Packages', end: false },
  { to: '/repository', label: 'Repo', end: false },
  { to: '/profile', label: 'Profile', end: false },
]

function Layout() {
  const location = useLocation()
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('readme-badge-theme') as ThemeType
    return savedTheme || 'system'
  })

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Apply theme to document
  useEffect(() => {
    const applyTheme = (themeName: ThemeType) => {
      // Remove all theme classes
      document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-green', 'theme-tron', 'theme-pink')
      
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
    <div className={`${styles.appShell} app-shell`}>
      <div className={`${styles.appTopBar} app-top-bar`}>
        <Link to="/" className={`${styles.brand} brand`}>
          <span className={`${styles.brandMark} brand-mark`}>README</span>
          <span className={`${styles.brandText} brand-text`}>Badge Creator</span>
        </Link>
        <button
          className={`${styles.hamburgerButton} hamburger-button`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className={`${styles.hamburgerLine} hamburger-line`}></span>
          <span className={`${styles.hamburgerLine} hamburger-line`}></span>
          <span className={`${styles.hamburgerLine} hamburger-line`}></span>
        </button>
        <nav
          className={`${styles.appNav} app-nav ${mobileMenuOpen ? `${styles.mobileOpen} mobile-open` : ''}`}
          aria-label="Primary"
        >
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive
                  ? `${styles.navLink} nav-link ${styles.navLinkActive} active`
                  : `${styles.navLink} nav-link`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} nav-link ${styles.settingsLink} settings-link ${styles.navLinkActive} active`
                : `${styles.navLink} nav-link ${styles.settingsLink} settings-link`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className={`${styles.settingsIcon} settings-icon`}>⚙️</span>
            <span className={`${styles.settingsLabel} settings-label`}>Settings</span>
          </NavLink>
        </nav>
      </div>
      <main className={`${styles.appMain} app-main`}>
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
          <Route path="repository" element={<Repository />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
