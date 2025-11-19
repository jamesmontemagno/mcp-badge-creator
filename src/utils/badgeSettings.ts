import { useState, useEffect } from 'react'

/**
 * Badge style options supported by shields.io
 */
export type BadgeStyle = 'flat-square' | 'flat' | 'plastic' | 'for-the-badge'

/**
 * Badge settings interface
 */
export interface BadgeSettings {
  badgeStyle: BadgeStyle
  showBadgeLogos: boolean
}

/**
 * LocalStorage keys for badge settings
 */
const BADGE_STYLE_KEY = 'readme-badge-style'
const SHOW_BADGE_LOGOS_KEY = 'readme-show-badge-logos'

/**
 * Default badge settings
 */
const DEFAULT_SETTINGS: BadgeSettings = {
  badgeStyle: 'flat-square',
  showBadgeLogos: true,
}

/**
 * Hook to access global badge settings from localStorage
 * @returns Current badge settings
 */
export function useBadgeSettings(): BadgeSettings {
  const [badgeStyle, setBadgeStyle] = useState<BadgeStyle>(() => {
    try {
      const saved = localStorage.getItem(BADGE_STYLE_KEY)
      return (saved as BadgeStyle) || DEFAULT_SETTINGS.badgeStyle
    } catch {
      return DEFAULT_SETTINGS.badgeStyle
    }
  })

  const [showBadgeLogos, setShowBadgeLogos] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SHOW_BADGE_LOGOS_KEY)
      return saved !== null ? saved === 'true' : DEFAULT_SETTINGS.showBadgeLogos
    } catch {
      return DEFAULT_SETTINGS.showBadgeLogos
    }
  })

  // Listen for storage changes from Settings page
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const style = localStorage.getItem(BADGE_STYLE_KEY)
        if (style) setBadgeStyle(style as BadgeStyle)
        
        const logos = localStorage.getItem(SHOW_BADGE_LOGOS_KEY)
        if (logos !== null) setShowBadgeLogos(logos === 'true')
      } catch {
        // Ignore errors
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return { badgeStyle, showBadgeLogos }
}

/**
 * Get badge settings synchronously (for use outside React components)
 * @returns Current badge settings from localStorage
 */
export function getBadgeSettings(): BadgeSettings {
  try {
    const badgeStyle = localStorage.getItem(BADGE_STYLE_KEY) as BadgeStyle || DEFAULT_SETTINGS.badgeStyle
    const showBadgeLogos = localStorage.getItem(SHOW_BADGE_LOGOS_KEY) !== null 
      ? localStorage.getItem(SHOW_BADGE_LOGOS_KEY) === 'true' 
      : DEFAULT_SETTINGS.showBadgeLogos

    return { badgeStyle, showBadgeLogos }
  } catch {
    return DEFAULT_SETTINGS
  }
}

/**
 * Save badge style to localStorage
 * @param style Badge style to save
 */
export function saveBadgeStyle(style: BadgeStyle): void {
  try {
    localStorage.setItem(BADGE_STYLE_KEY, style)
  } catch {
    // Ignore errors
  }
}

/**
 * Save badge logo visibility to localStorage
 * @param show Whether to show badge logos
 */
export function saveBadgeLogos(show: boolean): void {
  try {
    localStorage.setItem(SHOW_BADGE_LOGOS_KEY, show.toString())
  } catch {
    // Ignore errors
  }
}
