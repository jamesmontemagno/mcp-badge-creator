import { describe, it, expect } from 'vitest'
import { generateExtensionBadges, parseExtensionInput } from './extensionBadge'

describe('generateExtensionBadges', () => {
  it('should generate stable, insiders, and about badges', () => {
    const extensionId = 'ms-python.python'
    const result = generateExtensionBadges(extensionId)

    expect(result.extensionId).toBe(extensionId)
    expect(result.stable).toBeDefined()
    expect(result.insiders).toBeDefined()
    expect(result.about).toBeDefined()
    expect(result.about.rating).toBeDefined()
    expect(result.about.installs).toBeDefined()
    expect(result.about.version).toBeDefined()
    expect(result.about.lastUpdated).toBeDefined()
    expect(result.about.releaseDate).toBeDefined()
  })

  it('should generate correct rating badge URL', () => {
    const extensionId = 'ms-python.python'
    const result = generateExtensionBadges(extensionId)

    expect(result.about.rating.badgeUrl).toBe(
      'https://img.shields.io/visual-studio-marketplace/r/ms-python.python?style=flat-square'
    )
    expect(result.about.rating.marketplaceUrl).toBe(
      'https://marketplace.visualstudio.com/items?itemName=ms-python.python'
    )
  })

  it('should generate correct installs badge URL', () => {
    const extensionId = 'ms-python.python'
    const result = generateExtensionBadges(extensionId)

    expect(result.about.installs.badgeUrl).toBe(
      'https://img.shields.io/visual-studio-marketplace/i/ms-python.python?style=flat-square'
    )
  })

  it('should generate correct version badge URL', () => {
    const extensionId = 'ms-python.python'
    const result = generateExtensionBadges(extensionId)

    expect(result.about.version.badgeUrl).toBe(
      'https://img.shields.io/visual-studio-marketplace/v/ms-python.python?style=flat-square'
    )
  })

  it('should generate correct last updated badge URL', () => {
    const extensionId = 'ms-python.python'
    const result = generateExtensionBadges(extensionId)

    expect(result.about.lastUpdated.badgeUrl).toBe(
      'https://img.shields.io/visual-studio-marketplace/last-updated/ms-python.python?style=flat-square'
    )
  })

  it('should generate correct release date badge URL', () => {
    const extensionId = 'ms-python.python'
    const result = generateExtensionBadges(extensionId)

    expect(result.about.releaseDate.badgeUrl).toBe(
      'https://img.shields.io/visual-studio-marketplace/release-date/ms-python.python?style=flat-square'
    )
  })

  it('should generate correct rating markdown', () => {
    const extensionId = 'ms-python.python'
    const result = generateExtensionBadges(extensionId)

    expect(result.about.rating.markdown).toBe(
      '[![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/ms-python.python?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=ms-python.python)'
    )
  })

  it('should generate install markdown with both VS Code badges', () => {
    const extensionId = 'ms-python.python'
    const result = generateExtensionBadges(extensionId)

    expect(result.installMarkdown).toContain(result.stable.markdown)
    expect(result.installMarkdown).toContain(result.insiders.markdown)
  })

  it('should generate about markdown with all marketplace badges', () => {
    const extensionId = 'ms-python.python'
    const result = generateExtensionBadges(extensionId)

    expect(result.aboutMarkdown).toContain(result.about.rating.markdown)
    expect(result.aboutMarkdown).toContain(result.about.installs.markdown)
    expect(result.aboutMarkdown).toContain(result.about.version.markdown)
    expect(result.aboutMarkdown).toContain(result.about.lastUpdated.markdown)
    expect(result.aboutMarkdown).toContain(result.about.releaseDate.markdown)
  })

  it('should generate all markdown with install and about sections', () => {
    const extensionId = 'ms-python.python'
    const result = generateExtensionBadges(extensionId)

    expect(result.allMarkdown).toContain('### Install')
    expect(result.allMarkdown).toContain('### About')
    expect(result.allMarkdown).toContain(result.stable.markdown)
    expect(result.allMarkdown).toContain(result.insiders.markdown)
    expect(result.allMarkdown).toContain(result.about.rating.markdown)
    expect(result.allMarkdown).toContain(result.about.installs.markdown)
    expect(result.allMarkdown).toContain(result.about.version.markdown)
    expect(result.allMarkdown).toContain(result.about.lastUpdated.markdown)
    expect(result.allMarkdown).toContain(result.about.releaseDate.markdown)
  })
})

describe('parseExtensionInput', () => {
  it('should parse extension ID from URL with itemName parameter', () => {
    const url = 'https://marketplace.visualstudio.com/items?itemName=ms-python.python'
    const result = parseExtensionInput(url)

    expect(result.extensionId).toBe('ms-python.python')
    expect(result.source).toBe('url')
  })

  it('should parse extension ID from well-formed identifier', () => {
    const id = 'ms-python.python'
    const result = parseExtensionInput(id)

    expect(result.extensionId).toBe('ms-python.python')
    expect(result.source).toBe('id')
  })

  it('should return error for empty input', () => {
    const result = parseExtensionInput('')

    expect(result.extensionId).toBeNull()
    expect(result.error).toBeDefined()
  })
})
