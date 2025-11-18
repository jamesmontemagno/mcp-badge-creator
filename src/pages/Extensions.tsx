import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import styles from './Extensions.module.css'
import { generateExtensionBadges, parseExtensionInput } from '../utils/extensionBadge'
import SearchDropdown from '../components/SearchDropdown'
import type { SortBy } from '../utils/marketplaceApi'
import RequestBadge from '../components/RequestBadge'
import { useBadgeTheme } from '../BadgeThemeContext'

type BadgeVariant = 'stable' | 'insiders' | 'install' | 'rating' | 'installs' | 'downloads' | 'version' | 'lastUpdated' | 'releaseDate' | 'about' | 'all'
type InputMode = 'manual' | 'search'

function Extensions() {
  const { badgeTheme } = useBadgeTheme()
  const [inputValue, setInputValue] = useState('')
  const [inputMode, setInputMode] = useState<InputMode>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('relevance')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [badgeData, setBadgeData] = useState<ReturnType<typeof generateExtensionBadges> | null>(null)
  const [copiedVariant, setCopiedVariant] = useState<BadgeVariant | null>(null)
  const [selectedInstallBadges, setSelectedInstallBadges] = useState(new Set(['stable', 'insiders']))
  const [selectedAboutBadges, setSelectedAboutBadges] = useState(new Set(['rating', 'installs', 'version']))

  const showCopyState = (variant: BadgeVariant) => {
    setCopiedVariant(variant)
    setTimeout(() => {
      setCopiedVariant(current => (current === variant ? null : current))
    }, 2000)
  }

  const copyMarkdown = async (value: string, variant: BadgeVariant) => {
    await navigator.clipboard.writeText(value)
    showCopyState(variant)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setInputValue(value)
    
    if (inputMode === 'search') {
      setSearchQuery(value)
      setShowSearchDropdown(value.trim().length > 0)
    }
  }

  const handleSelectExtension = (extensionId: string) => {
    setInputValue(extensionId)
    setSearchQuery('')
    setShowSearchDropdown(false)
    setInfo(`Selected: ${extensionId}`)
    // Automatically generate badges when extension is selected from search
    const parsed = parseExtensionInput(extensionId)
    if (parsed.extensionId) {
      setError(null)
      setBadgeData(generateExtensionBadges(parsed.extensionId, badgeTheme))
    }
  }

  const handleModeToggle = (mode: InputMode) => {
    setInputMode(mode)
    setInputValue('')
    setSearchQuery('')
    setShowSearchDropdown(false)
    setError(null)
    setInfo(null)
    setBadgeData(null)
  }

  const handleGenerate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setShowSearchDropdown(false)
    const parsed = parseExtensionInput(inputValue)
    setCopiedVariant(null)

    if (!parsed.extensionId) {
      setBadgeData(null)
      setInfo(null)
      setError(parsed.error ?? 'Unable to determine extension identifier.')
      return
    }

    setError(null)
    setInfo(parsed.message ?? null)
    setBadgeData(generateExtensionBadges(parsed.extensionId, badgeTheme))
  }

  const handleCopy = async (variant: BadgeVariant) => {
    if (!badgeData) {
      return
    }

    let markdown: string
    switch (variant) {
      case 'stable':
        markdown = badgeData.stable.markdown
        break
      case 'insiders':
        markdown = badgeData.insiders.markdown
        break
      case 'install':
        markdown = badgeData.installMarkdown
        break
      case 'rating':
        markdown = badgeData.about.rating.markdown
        break
      case 'installs':
        markdown = badgeData.about.installs.markdown
        break
      case 'downloads':
        markdown = badgeData.about.downloads.markdown
        break
      case 'version':
        markdown = badgeData.about.version.markdown
        break
      case 'lastUpdated':
        markdown = badgeData.about.lastUpdated.markdown
        break
      case 'releaseDate':
        markdown = badgeData.about.releaseDate.markdown
        break
      case 'about':
        markdown = badgeData.aboutMarkdown
        break
      case 'all':
        markdown = badgeData.allMarkdown
        break
      default:
        return
    }
    
    await copyMarkdown(markdown, variant)
  }

  // Helper to extract image and link URLs from markdown (supports linked and unlinked badges)
  const parseBadgeMarkdown = (markdown: string): { imageUrl: string; linkUrl?: string } => {
    // Linked form: [![Alt](imageUrl)](linkUrl)
    const linkMatch = markdown.match(/^\[!\[[^\]]*\]\(([^)]+)\)\]\(([^)]+)\)$/)
    if (linkMatch) {
      return { imageUrl: linkMatch[1], linkUrl: linkMatch[2] }
    }
    // Image only form: ![Alt](imageUrl)
    const imgMatch = markdown.match(/!\[[^\]]*\]\(([^)]+)\)/)
    if (imgMatch) {
      return { imageUrl: imgMatch[1] }
    }
    return { imageUrl: '' }
  }

  const toggleInstallBadge = (badge: string) => {
    setSelectedInstallBadges(prev => {
      const updated = new Set(prev)
      if (updated.has(badge)) {
        updated.delete(badge)
      } else {
        updated.add(badge)
      }
      return updated
    })
  }

  const toggleAboutBadge = (badge: string) => {
    setSelectedAboutBadges(prev => {
      const updated = new Set(prev)
      if (updated.has(badge)) {
        updated.delete(badge)
      } else {
        updated.add(badge)
      }
      return updated
    })
  }

  const selectAllInstallBadges = () => {
    setSelectedInstallBadges(new Set(['stable', 'insiders']))
  }

  const deselectAllInstallBadges = () => {
    setSelectedInstallBadges(new Set())
  }

  const selectAllAboutBadges = () => {
    setSelectedAboutBadges(new Set(['rating', 'installs', 'downloads', 'version', 'lastUpdated', 'releaseDate']))
  }

  const deselectAllAboutBadges = () => {
    setSelectedAboutBadges(new Set())
  }

  return (
    <>
      <header className={`${styles.extensionsHeader} extensions-header`}>
        <p className={`${styles.eyebrow} eyebrow`}>VS Code Extensions</p>
        <h1>Create badges for Marketplace listings</h1>
        <p className={`${styles.subtitle} subtitle`}>
          Search for extensions by name or paste a URL, identifier, or display name. We will detect the marketplace ID 
          and craft badges for both VS Code and VS Code Insiders.
        </p>
      </header>

      <div className={`${styles.extensionsPage} extensions-page`}>
        <form className={`${styles.extensionsForm} extensions-form`} onSubmit={handleGenerate}>
          <div className={styles.inputModeToggle}>
            <label className={styles.toggleLabel}>Input mode:</label>
            <div className={styles.toggleButtons}>
              <button
                type="button"
                className={inputMode === 'search' ? styles.toggleActive : ''}
                onClick={() => handleModeToggle('search')}
              >
                🔍 Search
              </button>
              <button
                type="button"
                className={inputMode === 'manual' ? styles.toggleActive : ''}
                onClick={() => handleModeToggle('manual')}
              >
                ✏️ Manual Entry
              </button>
            </div>
            {inputMode === 'search' && (
              <div className={styles.sortControl}>
                <label htmlFor="sortBy" className={styles.sortLabel}>Sort by:</label>
                <select
                  id="sortBy"
                  className={styles.sortSelect}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                >
                  <option value="installs">Most Downloads</option>
                  <option value="rating">Highest Rated</option>
                  <option value="relevance">Relevance</option>
                  <option value="publishedDate">Recently Published</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            )}
          </div>

          <label htmlFor="extensionInput">
            {inputMode === 'search' ? 'Search for extension' : 'Extension reference'}
          </label>
          
          <div style={{ position: 'relative' }}>
            <input
              id="extensionInput"
              type="text"
              placeholder={
                inputMode === 'search'
                  ? 'Start typing to search... (e.g., Python, ESLint, Prettier)'
                  : 'e.g. https://marketplace.visualstudio.com/items?itemName=ms-python.python'
              }
              value={inputValue}
              onChange={handleInputChange}
              autoComplete="off"
            />
            {inputMode === 'search' && (
              <SearchDropdown
                searchQuery={searchQuery}
                sortBy={sortBy}
                onSelectExtension={handleSelectExtension}
                isVisible={showSearchDropdown}
                onClose={() => setShowSearchDropdown(false)}
              />
            )}
          </div>

          <span className="field-hint">
            {inputMode === 'search'
              ? 'Search the VS Code Marketplace and select an extension from the results. Note: Search may not work in all browsers due to CORS restrictions. Use Manual Entry if search is unavailable.'
              : 'Accepts Marketplace URLs, publisher.extension IDs, or display names.'}
          </span>
          
          {badgeData && (
            <fieldset className={styles.badgeFieldset}>
              <legend>🎨 Select Badges to Display</legend>
              
              <div className={styles.badgeSectionMargin}>
                <div className={styles.badgeSectionHeader}>
                  <div className={styles.badgeSectionTitle}>📦 Install Badges</div>
                  <div className={styles.badgeSectionButtons}>
                    <button type="button" onClick={selectAllInstallBadges} className={styles.selectButton}>Select All</button>
                    <button type="button" onClick={deselectAllInstallBadges} className={styles.selectButton}>Deselect All</button>
                  </div>
                </div>
                <div className={styles.badgeGrid}>
                  <label className={styles.badgeCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedInstallBadges.has('stable')}
                      onChange={() => toggleInstallBadge('stable')}
                    />
                    <span className={styles.badgeEmoji}>💻</span> VS Code
                  </label>
                  <label className={styles.badgeCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedInstallBadges.has('insiders')}
                      onChange={() => toggleInstallBadge('insiders')}
                    />
                    <span className={styles.badgeEmoji}>🚀</span> VS Code Insiders
                  </label>
                </div>
              </div>
              
              <div>
                <div className={styles.badgeSectionHeader}>
                  <div className={styles.badgeSectionTitle}>📊 Marketplace Badges</div>
                  <div className={styles.badgeSectionButtons}>
                    <button type="button" onClick={selectAllAboutBadges} className={styles.selectButton}>Select All</button>
                    <button type="button" onClick={deselectAllAboutBadges} className={styles.selectButton}>Deselect All</button>
                  </div>
                </div>
                <div className={styles.badgeGrid}>
                  <label className={styles.badgeCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedAboutBadges.has('rating')}
                      onChange={() => toggleAboutBadge('rating')}
                    />
                    <span className={styles.badgeEmoji}>⭐</span> Rating
                  </label>
                  <label className={styles.badgeCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedAboutBadges.has('installs')}
                      onChange={() => toggleAboutBadge('installs')}
                    />
                    <span className={styles.badgeEmoji}>📥</span> Installs
                  </label>
                  <label className={styles.badgeCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedAboutBadges.has('downloads')}
                      onChange={() => toggleAboutBadge('downloads')}
                    />
                    <span className={styles.badgeEmoji}>⬇️</span> Downloads
                  </label>
                  <label className={styles.badgeCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedAboutBadges.has('version')}
                      onChange={() => toggleAboutBadge('version')}
                    />
                    <span className={styles.badgeEmoji}>🔢</span> Version
                  </label>
                  <label className={styles.badgeCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedAboutBadges.has('lastUpdated')}
                      onChange={() => toggleAboutBadge('lastUpdated')}
                    />
                    <span className={styles.badgeEmoji}>🕐</span> Last Updated
                  </label>
                  <label className={styles.badgeCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedAboutBadges.has('releaseDate')}
                      onChange={() => toggleAboutBadge('releaseDate')}
                    />
                    <span className={styles.badgeEmoji}>📅</span> Release Date
                  </label>
                </div>
              </div>
            </fieldset>
          )}
          
          {inputMode === 'manual' && (
            <button type="submit" className="primary">
              Generate badges
            </button>
          )}
          </form>

      {error && <div className="form-alert error">{error}</div>}
      {info && !error && <div className="form-alert success">{info}</div>}

      {badgeData && !error && (
        <section className={`${styles.extensionsOutput} extensions-output`} aria-live="polite">
          <div className={`${styles.extensionsPreview} extensions-preview`}>
            <h2>Preview</h2>
            
            <h3>Install</h3>
            <div className={`${styles.extensionsPreviewRow} extensions-preview-row`}>
              <a href={badgeData.stable.extensionUri} target="_blank" rel="noopener noreferrer">
                <img src={badgeData.stable.badgeUrl} alt="Install in VS Code" />
              </a>
              <a href={badgeData.insiders.extensionUri} target="_blank" rel="noopener noreferrer">
                <img src={badgeData.insiders.badgeUrl} alt="Install in VS Code Insiders" />
              </a>
            </div>
            
            <h3>About</h3>
            <div className={`${styles.extensionsPreviewRow} extensions-preview-row`}>
              <a href={badgeData.about.rating.marketplaceUrl} target="_blank" rel="noopener noreferrer">
                <img src={badgeData.about.rating.badgeUrl} alt="Visual Studio Marketplace Rating" />
              </a>
              <a href={badgeData.about.installs.marketplaceUrl} target="_blank" rel="noopener noreferrer">
                <img src={badgeData.about.installs.badgeUrl} alt="Visual Studio Marketplace Installs" />
              </a>
              <a href={badgeData.about.version.marketplaceUrl} target="_blank" rel="noopener noreferrer">
                <img src={badgeData.about.version.badgeUrl} alt="Visual Studio Marketplace Version" />
              </a>
            </div>
            <div className={`${styles.extensionsPreviewRow} extensions-preview-row`}>
              <a href={badgeData.about.lastUpdated.marketplaceUrl} target="_blank" rel="noopener noreferrer">
                <img src={badgeData.about.lastUpdated.badgeUrl} alt="Visual Studio Marketplace Last Updated" />
              </a>
              <a href={badgeData.about.releaseDate.marketplaceUrl} target="_blank" rel="noopener noreferrer">
                <img src={badgeData.about.releaseDate.badgeUrl} alt="Visual Studio Marketplace Release Date" />
              </a>
            </div>
          </div>

          <div className={`${styles.markdownColumns} markdown-columns`}>
            <article className={`${styles.markdownCard} markdown-card`}>
              <header className="output-header">
                <h3>VS Code Markdown</h3>
                <button type="button" className="copy-btn" onClick={() => handleCopy('stable')}>
                  {copiedVariant === 'stable' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </header>
              <div className={styles.cardBadgePreview}>
                {(() => {
                  const { imageUrl, linkUrl } = parseBadgeMarkdown(badgeData.stable.markdown)
                  return linkUrl ? (
                    <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                      <img src={imageUrl} alt="Install in VS Code" />
                    </a>
                  ) : (
                    <img src={imageUrl} alt="Install in VS Code" />
                  )
                })()}
              </div>
              <pre><code>{badgeData.stable.markdown}</code></pre>
            </article>

            <article className={`${styles.markdownCard} markdown-card`}>
              <header className="output-header">
                <h3>VS Code Insiders Markdown</h3>
                <button type="button" className="copy-btn" onClick={() => handleCopy('insiders')}>
                  {copiedVariant === 'insiders' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </header>
              <div className={styles.cardBadgePreview}>
                {(() => {
                  const { imageUrl, linkUrl } = parseBadgeMarkdown(badgeData.insiders.markdown)
                  return linkUrl ? (
                    <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                      <img src={imageUrl} alt="Install in VS Code Insiders" />
                    </a>
                  ) : (
                    <img src={imageUrl} alt="Install in VS Code Insiders" />
                  )
                })()}
              </div>
              <pre><code>{badgeData.insiders.markdown}</code></pre>
            </article>
          </div>

          <div className={`${styles.combinedMarkdown} combined-markdown`}>
            <header className="output-header">
              <h3>Install Section - All Badges</h3>
              <button type="button" className="copy-btn" onClick={() => handleCopy('install')}>
                {copiedVariant === 'install' ? '✅ Copied!' : '📋 Copy'}
              </button>
            </header>
            <pre><code>{badgeData.installMarkdown}</code></pre>
          </div>

          <div className={`${styles.markdownColumns} markdown-columns`}>
            <article className={`${styles.markdownCard} markdown-card`}>
              <header className="output-header">
                <h3>Rating Badge</h3>
                <button type="button" className="copy-btn" onClick={() => handleCopy('rating')}>
                  {copiedVariant === 'rating' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </header>
              <div className={styles.cardBadgePreview}>
                {(() => {
                  const { imageUrl, linkUrl } = parseBadgeMarkdown(badgeData.about.rating.markdown)
                  return linkUrl ? (
                    <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                      <img src={imageUrl} alt="Visual Studio Marketplace Rating" />
                    </a>
                  ) : (
                    <img src={imageUrl} alt="Visual Studio Marketplace Rating" />
                  )
                })()}
              </div>
              <pre><code>{badgeData.about.rating.markdown}</code></pre>
            </article>

            <article className={`${styles.markdownCard} markdown-card`}>
              <header className="output-header">
                <h3>Installs Badge</h3>
                <button type="button" className="copy-btn" onClick={() => handleCopy('installs')}>
                  {copiedVariant === 'installs' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </header>
              <div className={styles.cardBadgePreview}>
                {(() => {
                  const { imageUrl, linkUrl } = parseBadgeMarkdown(badgeData.about.installs.markdown)
                  return linkUrl ? (
                    <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                      <img src={imageUrl} alt="Visual Studio Marketplace Installs" />
                    </a>
                  ) : (
                    <img src={imageUrl} alt="Visual Studio Marketplace Installs" />
                  )
                })()}
              </div>
              <pre><code>{badgeData.about.installs.markdown}</code></pre>
            </article>
          </div>

          <div className={`${styles.markdownColumns} markdown-columns`}>
            <article className={`${styles.markdownCard} markdown-card`}>
              <header className="output-header">
                <h3>Downloads Badge</h3>
                <button type="button" className="copy-btn" onClick={() => handleCopy('downloads')}>
                  {copiedVariant === 'downloads' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </header>
              <div className={styles.cardBadgePreview}>
                {(() => {
                  const { imageUrl, linkUrl } = parseBadgeMarkdown(badgeData.about.downloads.markdown)
                  return linkUrl ? (
                    <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                      <img src={imageUrl} alt="Visual Studio Marketplace Downloads" />
                    </a>
                  ) : (
                    <img src={imageUrl} alt="Visual Studio Marketplace Downloads" />
                  )
                })()}
              </div>
              <pre><code>{badgeData.about.downloads.markdown}</code></pre>
            </article>

            <article className={`${styles.markdownCard} markdown-card`}>
              <header className="output-header">
                <h3>Version Badge</h3>
                <button type="button" className="copy-btn" onClick={() => handleCopy('version')}>
                  {copiedVariant === 'version' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </header>
              <div className={styles.cardBadgePreview}>
                {(() => {
                  const { imageUrl, linkUrl } = parseBadgeMarkdown(badgeData.about.version.markdown)
                  return linkUrl ? (
                    <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                      <img src={imageUrl} alt="Visual Studio Marketplace Version" />
                    </a>
                  ) : (
                    <img src={imageUrl} alt="Visual Studio Marketplace Version" />
                  )
                })()}
              </div>
              <pre><code>{badgeData.about.version.markdown}</code></pre>
            </article>

            <article className={`${styles.markdownCard} markdown-card`}>
              <header className="output-header">
                <h3>Last Updated Badge</h3>
                <button type="button" className="copy-btn" onClick={() => handleCopy('lastUpdated')}>
                  {copiedVariant === 'lastUpdated' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </header>
              <div className={styles.cardBadgePreview}>
                {(() => {
                  const { imageUrl, linkUrl } = parseBadgeMarkdown(badgeData.about.lastUpdated.markdown)
                  return linkUrl ? (
                    <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                      <img src={imageUrl} alt="Visual Studio Marketplace Last Updated" />
                    </a>
                  ) : (
                    <img src={imageUrl} alt="Visual Studio Marketplace Last Updated" />
                  )
                })()}
              </div>
              <pre><code>{badgeData.about.lastUpdated.markdown}</code></pre>
            </article>
          </div>

          <div className={`${styles.combinedMarkdown} combined-markdown`}>
            <header className="output-header">
              <h3>Release Date Badge</h3>
              <button type="button" className="copy-btn" onClick={() => handleCopy('releaseDate')}>
                {copiedVariant === 'releaseDate' ? '✅ Copied!' : '📋 Copy'}
              </button>
            </header>
            <div className={styles.cardBadgePreview}>
              {(() => {
                const { imageUrl, linkUrl } = parseBadgeMarkdown(badgeData.about.releaseDate.markdown)
                return linkUrl ? (
                  <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                    <img src={imageUrl} alt="Visual Studio Marketplace Release Date" />
                  </a>
                ) : (
                  <img src={imageUrl} alt="Visual Studio Marketplace Release Date" />
                )
              })()}
            </div>
            <pre><code>{badgeData.about.releaseDate.markdown}</code></pre>
          </div>

          <div className={`${styles.combinedMarkdown} combined-markdown`}>
            <header className="output-header">
              <h3>About Section - All Badges</h3>
              <button type="button" className="copy-btn" onClick={() => handleCopy('about')}>
                {copiedVariant === 'about' ? '✅ Copied!' : '📋 Copy'}
              </button>
            </header>
            <pre><code>{badgeData.aboutMarkdown}</code></pre>
          </div>

          <div className={`${styles.combinedMarkdown} combined-markdown`}>
            <header className="output-header">
              <h3>All Badges - Install & About</h3>
              <button type="button" className="copy-btn" onClick={() => handleCopy('all')}>
                {copiedVariant === 'all' ? '✅ Copied!' : '📋 Copy'}
              </button>
            </header>
            <pre><code>{badgeData.allMarkdown}</code></pre>
          </div>
        </section>
      )}
      
      <RequestBadge />
      </div>
    </>
  )
}

export default Extensions
