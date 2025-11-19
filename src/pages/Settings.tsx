import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import styles from './Settings.module.css'
import type { BadgeStyle, BadgeColorScheme } from '../types/badgeTheme'
import { useBadgeTheme } from '../BadgeThemeContext'

// Import the constants from the badgeTheme module
import { 
  DEFAULT_BADGE_THEMES as THEMES,
  BADGE_STYLE_DESCRIPTIONS as STYLES,
  BADGE_COLOR_SCHEME_DESCRIPTIONS as COLOR_SCHEMES
} from '../types/badgeTheme'

type ThemeType = 'system' | 'light' | 'dark' | 'green' | 'tron' | 'pink'

interface OutletContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
}

function Settings() {
  const { theme, setTheme } = useOutletContext<OutletContextType>()
  const { badgeTheme, setBadgeTheme } = useBadgeTheme()
  
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

  useEffect(() => {
    localStorage.setItem('badge-theme-settings', JSON.stringify(badgeTheme))
  }, [badgeTheme])

  const resetToDefaults = () => {
    setTheme('system')
    setCopyNotificationDuration(2000)
    setDefaultBadgeText('Install in')
    setShowCopyNotifications(true)
    setBadgeTheme({
      style: 'flat-square',
      colorScheme: 'default',
      customColors: THEMES.default.customColors,
      logoColor: 'white',
      showLogo: true
    })
  }

  const handleColorSchemeChange = (colorScheme: BadgeColorScheme) => {
    const newTheme = { 
      ...badgeTheme, 
      colorScheme,
      ...THEMES[colorScheme]
    }
    setBadgeTheme(newTheme)
  }

  const handleStyleChange = (style: BadgeStyle) => {
    setBadgeTheme({ ...badgeTheme, style })
  }

  return (
    <>
      <header className={`${styles.settingsHeader} settings-header`}>
        <p className={`${styles.eyebrow} eyebrow`}>Preferences</p>
        <h1>Settings</h1>
        <p className={`${styles.subtitle} subtitle`}>Customize your badge creator experience</p>
      </header>

      <div className={`${styles.settingsPage} settings-page`}>
      <div className={`${styles.settingsGrid} settings-grid`}>
        {/* Theme Settings Card */}
        <div className={`${styles.settingsCard} settings-card`}>
          <h2>🎨 Theme</h2>
          <p className={`${styles.settingsDescription} settings-description`}>Choose your preferred color scheme</p>
          
          <div className={`${styles.themeOptions} theme-options`}>
            {[
              { value: 'system', label: 'System', description: 'Follow your OS theme' },
              { value: 'light', label: 'Light', description: 'Clean and bright' },
              { value: 'dark', label: 'Dark', description: 'Easy on the eyes' },
              { value: 'green', label: 'Green', description: 'VS Code Insiders style' },
              { value: 'tron', label: 'Tron', description: 'Neon cyberpunk' },
              { value: 'pink', label: 'Pink', description: 'Vibrant and fun' },
            ].map((option) => (
              <label key={option.value} className={`${styles.themeOption} theme-option`}>
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
        <div className={`${styles.settingsCard} settings-card`}>
          <h2>🔔 Notifications</h2>
          <p className={`${styles.settingsDescription} settings-description`}>Control copy feedback messages</p>
          
          <div className={`${styles.settingGroup} setting-group`}>
            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={showCopyNotifications}
                onChange={(e) => setShowCopyNotifications(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <span className={`${styles.settingLabel} setting-label`}>Show copy notifications</span>
            </label>
            <p className={`${styles.settingHint} setting-hint`}>Display "Copied!" message when copying to clipboard</p>
          </div>

          {showCopyNotifications && (
            <div className={`${styles.settingGroup} setting-group`}>
              <label htmlFor="duration" className={`${styles.settingLabel} setting-label`}>Notification duration</label>
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
        <div className={`${styles.settingsCard} settings-card`}>
          <h2>🎖️ Badge Defaults</h2>
          <p className={`${styles.settingsDescription} settings-description`}>Set default values for badge generation</p>
          
          <div className={`${styles.settingGroup} setting-group`}>
            <label htmlFor="badgeText" className={`${styles.settingLabel} setting-label`}>Default badge text</label>
            <input
              id="badgeText"
              type="text"
              value={defaultBadgeText}
              onChange={(e) => setDefaultBadgeText(e.target.value)}
              placeholder="Install in"
              className="setting-input"
            />
            <p className={`${styles.settingHint} setting-hint`}>Default text shown on badges (e.g., "Install in")</p>
          </div>

          <div className={`${styles.badgePreviewSample} badge-preview-sample`}>
            <p className={`${styles.previewLabel} preview-label`}>Preview:</p>
            <img 
              src={`https://img.shields.io/badge/${defaultBadgeText.replace(/\s/g, '_')}-VS_Code-${badgeTheme.customColors?.vscode || '0098FF'}?style=${badgeTheme.style}&logo=${badgeTheme.showLogo ? 'visualstudiocode' : ''}&logoColor=${badgeTheme.logoColor}`}
              alt="Badge preview"
            />
          </div>
        </div>

        {/* Badge Theme Settings Card */}
        <div className={`${styles.settingsCard} settings-card ${styles.fullWidth}`}>
          <h2>🎨 Badge Theme</h2>
          <p className={`${styles.settingsDescription} settings-description`}>Customize badge appearance using shield.io standards</p>
          
          <div className={styles.badgeThemeGrid}>
            <div className={`${styles.settingGroup} setting-group`}>
              <label htmlFor="badgeStyle" className={`${styles.settingLabel} setting-label`}>Badge Style</label>
              <select
                id="badgeStyle"
                value={badgeTheme.style}
                onChange={(e) => handleStyleChange(e.target.value as BadgeStyle)}
                className={styles.selectInput}
              >
                {Object.entries(STYLES).map(([style, description]) => (
                  <option key={style} value={style}>
                    {style} - {description}
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles.settingGroup} setting-group`}>
              <label htmlFor="colorScheme" className={`${styles.settingLabel} setting-label`}>Color Scheme</label>
              <select
                id="colorScheme"
                value={badgeTheme.colorScheme}
                onChange={(e) => handleColorSchemeChange(e.target.value as BadgeColorScheme)}
                className={styles.selectInput}
              >
                {Object.entries(COLOR_SCHEMES).map(([scheme, description]) => (
                  <option key={scheme} value={scheme}>
                    {scheme.charAt(0).toUpperCase() + scheme.slice(1)} - {description}
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles.settingGroup} setting-group`}>
              <label htmlFor="logoColor" className={`${styles.settingLabel} setting-label`}>Logo Color</label>
              <select
                id="logoColor"
                value={badgeTheme.logoColor}
                onChange={(e) => setBadgeTheme({ ...badgeTheme, logoColor: e.target.value as 'white' | 'black' | 'auto' })}
                className={styles.selectInput}
              >
                <option value="white">White</option>
                <option value="black">Black</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div className={`${styles.settingGroup} setting-group ${styles.toggleGroup}`}>
              <label className={styles.settingToggle}>
                <input
                  type="checkbox"
                  checked={badgeTheme.showLogo || false}
                  onChange={(e) => setBadgeTheme({ ...badgeTheme, showLogo: e.target.checked })}
                />
                <span className={styles.toggleSlider}></span>
                <span className={`${styles.settingLabel} setting-label`}>Show logos</span>
              </label>
            </div>
          </div>

          <div className={`${styles.badgePreviewSample} badge-preview-sample`}>
            <p className={`${styles.previewLabel} preview-label`}>Live Preview:</p>
            <div className={styles.badgePreviewGrid}>
              <div className={styles.previewItem}>
                <span className={styles.previewItemLabel}>VS Code</span>
                <img 
                  src={`https://img.shields.io/badge/${defaultBadgeText.replace(/\s/g, '_')}-VS_Code-${badgeTheme.customColors?.vscode || '0098FF'}?style=${badgeTheme.style}&logo=${badgeTheme.showLogo ? 'visualstudiocode' : ''}&logoColor=${badgeTheme.logoColor}`}
                  alt="VS Code badge preview"
                />
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewItemLabel}>Insiders</span>
                <img 
                  src={`https://img.shields.io/badge/${defaultBadgeText.replace(/\s/g, '_')}-VS_Code_Insiders-${badgeTheme.customColors?.vscodeInsiders || '24bfa5'}?style=${badgeTheme.style}&logo=${badgeTheme.showLogo ? 'visualstudiocode' : ''}&logoColor=${badgeTheme.logoColor}`}
                  alt="VS Code Insiders badge preview"
                />
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewItemLabel}>Visual Studio</span>
                <img 
                  src={`https://img.shields.io/badge/${defaultBadgeText.replace(/\s/g, '_')}-Visual_Studio-${badgeTheme.customColors?.visualStudio || 'C16FDE'}?style=${badgeTheme.style}&logo=${badgeTheme.showLogo ? 'visualstudio' : ''}&logoColor=${badgeTheme.logoColor}`}
                  alt="Visual Studio badge preview"
                />
              </div>
            </div>
          </div>
        </div>

        {/* About Card */}
        <div className={`${styles.settingsCard} settings-card settings-about`}>
          <h2>ℹ️ About</h2>
          
          <div className={`${styles.aboutInfo} about-info`}>
            <p>Created by <a href="https://github.com/jamesmontemagno" target="_blank" rel="noopener noreferrer">James Montemagno</a> using <a href="https://code.visualstudio.com/" target="_blank" rel="noopener noreferrer">VS Code</a> and <a href="https://github.com/features/copilot" target="_blank" rel="noopener noreferrer">GitHub Copilot</a>.</p>
            <p>Badges powered by <a href="https://shields.io/" target="_blank" rel="noopener noreferrer">Shields.io</a>.</p>
            <p>To increase GitHub rate limits on badges, consider setting up a <a href="https://shields.io/blog/token-pool" target="_blank" rel="noopener noreferrer">Shields.io token pool</a>.</p>
            <div className={`${styles.aboutLinks} about-links`}>
              <a href="https://github.com/jamesmontemagno/mcp-badge-creator" target="_blank" rel="noopener noreferrer">
                View on GitHub ↗
              </a>
            </div>
          </div>

          <button onClick={resetToDefaults} className={`${styles.resetButton} reset-button`}>
            Reset to Defaults
          </button>
        </div>
      </div>
      </div>
    </>
  )
}

export default Settings
