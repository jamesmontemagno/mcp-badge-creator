import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import '../App.css'

type ThemeType = 'system' | 'light' | 'dark' | 'green' | 'tron' | 'pink'

interface OutletContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
}

function Settings() {
  const { theme, setTheme } = useOutletContext<OutletContextType>()
  const [copyNotificationDuration, setCopyNotificationDuration] = useState(() => {
    const saved = localStorage.getItem('readme-copy-notification-duration')
    return saved ? parseInt(saved) : 2000
  })

  const [defaultBadgeText, setDefaultBadgeText] = useState(() => {
    return localStorage.getItem('readme-default-badge-text') || 'Install in'
  })

  const [showCopyNotifications, setShowCopyNotifications] = useState(() => {
    const saved = localStorage.getItem('readme-show-copy-notifications')
    return saved !== 'false'
  })

  useEffect(() => {
    localStorage.setItem('readme-copy-notification-duration', copyNotificationDuration.toString())
  }, [copyNotificationDuration])

  useEffect(() => {
    localStorage.setItem('readme-default-badge-text', defaultBadgeText)
  }, [defaultBadgeText])

  useEffect(() => {
    localStorage.setItem('readme-show-copy-notifications', showCopyNotifications.toString())
  }, [showCopyNotifications])

  const resetToDefaults = () => {
    setTheme('system')
    setCopyNotificationDuration(2000)
    setDefaultBadgeText('Install in')
    setShowCopyNotifications(true)
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>⚙️ Settings</h1>
        <p className="subtitle">Customize your badge creator experience</p>
      </header>

      <div className="settings-grid">
        {/* Theme Settings Card */}
        <div className="settings-card">
          <h2>🎨 Theme</h2>
          <p className="settings-description">Choose your preferred color scheme</p>
          
          <div className="theme-options">
            {[
              { value: 'system', label: 'System', description: 'Follow your OS theme' },
              { value: 'light', label: 'Light', description: 'Clean and bright' },
              { value: 'dark', label: 'Dark', description: 'Easy on the eyes' },
              { value: 'green', label: 'Green', description: 'VS Code Insiders style' },
              { value: 'tron', label: 'Tron', description: 'Neon cyberpunk' },
              { value: 'pink', label: 'Pink', description: 'Vibrant and fun' },
            ].map((option) => (
              <label key={option.value} className="theme-option">
                <input
                  type="radio"
                  name="theme"
                  value={option.value}
                  checked={theme === option.value}
                  onChange={(e) => setTheme(e.target.value as ThemeType)}
                />
                <div className="theme-option-content">
                  <span className="theme-option-label">{option.label}</span>
                  <span className="theme-option-description">{option.description}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Notification Settings Card */}
        <div className="settings-card">
          <h2>🔔 Notifications</h2>
          <p className="settings-description">Control copy feedback messages</p>
          
          <div className="setting-group">
            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={showCopyNotifications}
                onChange={(e) => setShowCopyNotifications(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <span className="setting-label">Show copy notifications</span>
            </label>
            <p className="setting-hint">Display "Copied!" message when copying to clipboard</p>
          </div>

          {showCopyNotifications && (
            <div className="setting-group">
              <label htmlFor="duration" className="setting-label">Notification duration</label>
              <div className="duration-control">
                <input
                  id="duration"
                  type="range"
                  min="1000"
                  max="5000"
                  step="500"
                  value={copyNotificationDuration}
                  onChange={(e) => setCopyNotificationDuration(parseInt(e.target.value))}
                />
                <span className="duration-value">{copyNotificationDuration / 1000}s</span>
              </div>
            </div>
          )}
        </div>

        {/* Badge Settings Card */}
        <div className="settings-card">
          <h2>🎖️ Badge Defaults</h2>
          <p className="settings-description">Set default values for badge generation</p>
          
          <div className="setting-group">
            <label htmlFor="badgeText" className="setting-label">Default badge text</label>
            <input
              id="badgeText"
              type="text"
              value={defaultBadgeText}
              onChange={(e) => setDefaultBadgeText(e.target.value)}
              placeholder="Install in"
              className="setting-input"
            />
            <p className="setting-hint">Default text shown on badges (e.g., "Install in")</p>
          </div>

          <div className="badge-preview-sample">
            <p className="preview-label">Preview:</p>
            <img 
              src={`https://img.shields.io/badge/${defaultBadgeText.replace(/\s/g, '_')}-VS_Code-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white`}
              alt="Badge preview"
            />
          </div>
        </div>

        {/* About Card */}
        <div className="settings-card settings-about">
          <h2>ℹ️ About</h2>
          <p className="settings-description">README Badge Creator</p>
          
          <div className="about-info">
            <p>Generate beautiful badges and installation instructions for Model Context Protocol servers and VS Code extensions.</p>
            <div className="about-links">
              <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer">
                Learn about MCP ↗
              </a>
              <a href="https://github.com/jamesmontemagno/mcp-badge-creator" target="_blank" rel="noopener noreferrer">
                View on GitHub ↗
              </a>
            </div>
          </div>

          <button onClick={resetToDefaults} className="reset-button">
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
