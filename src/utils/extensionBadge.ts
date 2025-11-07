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
    .replace(/[()[\]{}'"`]/g, '')
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

const badgeMarkdown = (label: string, color: string, extensionId: string, uriScheme: string) => {
  const encodedLabel = encodeURIComponent(label)
  const badgeUrl = `https://img.shields.io/badge/${encodedLabel}-Install-${color}?logo=visualstudiocode&logoColor=white`
  const extensionUri = `${uriScheme}:extension/${extensionId}`
  return {
    markdown: `[![Install in ${label}](${badgeUrl})](${extensionUri})`,
    badgeUrl,
    extensionUri,
  }
}

const marketplaceBadges = (extensionId: string) => {
  const marketplaceUrl = `https://marketplace.visualstudio.com/items?itemName=${extensionId}`
  
  const createBadge = (metricType: string, altText: string) => {
    const badgeUrl = `https://img.shields.io/visual-studio-marketplace/${metricType}/${extensionId}`
    return {
      markdown: `[![${altText}](${badgeUrl})](${marketplaceUrl})`,
      badgeUrl,
      marketplaceUrl,
    }
  }
  
  return {
    rating: createBadge('r', 'Visual Studio Marketplace Rating'),
    installs: createBadge('i', 'Visual Studio Marketplace Installs'),
    version: createBadge('v', 'Visual Studio Marketplace Version'),
    lastUpdated: createBadge('last-updated', 'Visual Studio Marketplace Last Updated'),
    releaseDate: createBadge('release-date', 'Visual Studio Marketplace Release Date'),
  }
}

export const generateExtensionBadges = (extensionId: string) => {
  const stable = badgeMarkdown('VS Code', '0098FF', extensionId, 'vscode')
  const insiders = badgeMarkdown('VS Code Insiders', '24bfa5', extensionId, 'vscode-insiders')
  const about = marketplaceBadges(extensionId)

  // Install section markdown
  const installMarkdown = `${stable.markdown}\n${insiders.markdown}`
  
  // About section markdown
  const aboutMarkdown = `${about.rating.markdown}\n${about.installs.markdown}\n${about.version.markdown}\n${about.lastUpdated.markdown}\n${about.releaseDate.markdown}`
  
  // Combined markdown with both sections
  const allMarkdown = `### Install\n\n${installMarkdown}\n\n### About\n\n${aboutMarkdown}`

  return {
    extensionId,
    stable,
    insiders,
    about,
    installMarkdown,
    aboutMarkdown,
    allMarkdown,
  }
}
