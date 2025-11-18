import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { BadgeTheme } from './types/badgeTheme'
import { DEFAULT_BADGE_THEMES } from './types/badgeTheme'

interface BadgeThemeContextType {
  badgeTheme: BadgeTheme
  setBadgeTheme: (theme: BadgeTheme) => void
  updateBadgeTheme: (updates: Partial<BadgeTheme>) => void
}

const BadgeThemeContext = createContext<BadgeThemeContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export function useBadgeTheme() {
  const context = useContext(BadgeThemeContext)
  if (context === undefined) {
    throw new Error('useBadgeTheme must be used within a BadgeThemeProvider')
  }
  return context
}

interface BadgeThemeProviderProps {
  children: ReactNode
}

export function BadgeThemeProvider({ children }: BadgeThemeProviderProps) {
  const [badgeTheme, setBadgeTheme] = useState<BadgeTheme>(() => {
    const saved = localStorage.getItem('badge-theme-settings')
    return saved ? JSON.parse(saved) : {
      style: 'flat-square',
      colorScheme: 'default',
      customColors: DEFAULT_BADGE_THEMES.default.customColors,
      logoColor: 'white',
      showLogo: true
    }
  })

  useEffect(() => {
    localStorage.setItem('badge-theme-settings', JSON.stringify(badgeTheme))
  }, [badgeTheme])

  const updateBadgeTheme = (updates: Partial<BadgeTheme>) => {
    setBadgeTheme(prev => ({ ...prev, ...updates }))
  }

  return (
    <BadgeThemeContext.Provider value={{ badgeTheme, setBadgeTheme, updateBadgeTheme }}>
      {children}
    </BadgeThemeContext.Provider>
  )
}