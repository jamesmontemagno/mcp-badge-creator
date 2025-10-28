import { NavLink, Outlet, Route, BrowserRouter, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import MCP from './pages/MCP'
import Extensions from './pages/Extensions'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/mcp', label: 'MCP Badges' },
  { to: '/extensions', label: 'VS Code Extensions' },
]

function Layout() {
  return (
    <div className="app-shell">
      <div className="app-top-bar">
        <div className="brand">
          <span className="brand-mark">MCP</span>
          <span className="brand-text">Badge Creator</span>
        </div>
        <nav className="app-nav" aria-label="Primary">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <main className="app-main">
        <Outlet />
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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
