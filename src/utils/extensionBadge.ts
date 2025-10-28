export type ExtensionSource = 'url' | 'id' | 'display'

export interface ExtensionParseResult {
  extensionId: string | null
  source?: ExtensionSource
  message?: string
  error?: string
}

const DISPLAY_PATTERNS = [
  { regex: /\s+-\s+/, label: '-' },
  { regex: /\s+–\s+/, label: '–' },
  { regex: /\s+—\s+/, label: '—' },
  { regex: /\s*:\s*/, label: ':' },
  { regex: /\s*\|\s*/, label: '|' },
  { regex: /\s*\/\s*/, label: '/' },
  { regex: /\s+by\s+/i, label: 'by', reverse: true },
]

const sanitizeSegment = (segment: string) => {
  return segment
    .trim()
    .replace(/[()\[\]{}'"`]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

const buildFromDisplayName = (value: string) => {
  const normalized = value.trim()
  if (!normalized) {
    return null
  }

  for (const pattern of DISPLAY_PATTERNS) {
    const parts = normalized.split(pattern.regex).map(part => part.trim()).filter(Boolean)
    if (parts.length >= 2) {
      const ordered = pattern.reverse ? parts.reverse() : parts
      const publisher = sanitizeSegment(ordered[0])
      const extensionName = sanitizeSegment(ordered.slice(1).join(' '))
      if (publisher && extensionName) {
        return {
          id: `${publisher}.${extensionName}`,
          message: `Converted display name using separator "${pattern.label}".`,
        }
      }
    }
  }

  const words = normalized.split(/\s+/)
  if (words.length >= 2) {
    const publisher = sanitizeSegment(words[0])
    const extensionName = sanitizeSegment(words.slice(1).join(' '))
    if (publisher && extensionName) {
      return {
        id: `${publisher}.${extensionName}`,
        message: 'Converted from display name by splitting into publisher and extension.',
      }
    }
  }

  return null
}

export const parseExtensionInput = (value: string): ExtensionParseResult => {
  const trimmed = value.trim()

  if (!trimmed) {
    return { extensionId: null, error: 'Enter an extension URL, ID, or display name.' }
  }

  try {
    const asUrl = new URL(trimmed)
    const itemNameParam = asUrl.searchParams.get('itemName')
    if (itemNameParam) {
      return { extensionId: itemNameParam, source: 'url', message: 'Parsed extension ID from Marketplace URL query.' }
    }

    const pathMatch = asUrl.pathname.match(/items\/([^/]+)/i)
    if (pathMatch?.[1]) {
      return { extensionId: pathMatch[1], source: 'url', message: 'Extracted extension ID from Marketplace URL path.' }
    }
  } catch {
    // Ignore URL parsing errors
  }

  const idCandidate = trimmed.replace(/\s+/g, '')
  if (/^[\w-]+\.[\w-]+$/i.test(idCandidate)) {
    return { extensionId: idCandidate, source: 'id', message: 'Detected well-formed extension identifier.' }
  }

  const displayConversion = buildFromDisplayName(trimmed)
  if (displayConversion) {
    return { extensionId: displayConversion.id, source: 'display', message: displayConversion.message }
  }

  return {
    extensionId: null,
    error: 'Unable to detect extension identifier. Try entering a Marketplace URL or publisher.extension ID.',
  }
}

const MARKETPLACE_URL = 'https://marketplace.visualstudio.com/items'

const badgeMarkdown = (label: string, color: string, extensionId: string) => {
  const encodedLabel = encodeURIComponent(label)
  const badgeUrl = `https://img.shields.io/badge/${encodedLabel}-Install-${color}?logo=visualstudiocode&logoColor=white`
  const marketplaceUrl = `${MARKETPLACE_URL}?itemName=${extensionId}`
  return {
    markdown: `[![Install in ${label}](${badgeUrl})](${marketplaceUrl})`,
    badgeUrl,
    marketplaceUrl,
  }
}

export const generateExtensionBadges = (extensionId: string) => {
  const stable = badgeMarkdown('VS Code', '0098FF', extensionId)
  const insiders = badgeMarkdown('VS Code Insiders', '24bfa5', extensionId)

  return {
    extensionId,
    stable,
    insiders,
    combinedMarkdown: `${stable.markdown}\n${insiders.markdown}`,
  }
}
