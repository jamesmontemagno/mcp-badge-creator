import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import styles from './Extensions.module.css'
import { generateExtensionBadges, parseExtensionInput } from '../utils/extensionBadge'
import SearchDropdown from '../components/SearchDropdown'
import type { SortBy } from '../utils/marketplaceApi'

type BadgeVariant = 'stable' | 'insiders' | 'combined'
type InputMode = 'manual' | 'search'

function Extensions() {
  const [inputValue, setInputValue] = useState('')
  const [inputMode, setInputMode] = useState<InputMode>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('relevance')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [badgeData, setBadgeData] = useState<ReturnType<typeof generateExtensionBadges> | null>(null)
  const [copiedVariant, setCopiedVariant] = useState<BadgeVariant | null>(null)

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
      setBadgeData(generateExtensionBadges(parsed.extensionId))
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
    setBadgeData(generateExtensionBadges(parsed.extensionId))
  }

  const handleCopy = async (variant: BadgeVariant) => {
    if (!badgeData) {
      return
    }

    const markdown =
      variant === 'stable'
        ? badgeData.stable.markdown
        : variant === 'insiders'
        ? badgeData.insiders.markdown
        : badgeData.combinedMarkdown
    await copyMarkdown(markdown, variant)
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
            <div className={`${styles.extensionsPreviewRow} extensions-preview-row`}>
              <a href={badgeData.stable.extensionUri} target="_blank" rel="noopener noreferrer">
                <img src={badgeData.stable.badgeUrl} alt="Install in VS Code" />
              </a>
              <a href={badgeData.insiders.extensionUri} target="_blank" rel="noopener noreferrer">
                <img src={badgeData.insiders.badgeUrl} alt="Install in VS Code Insiders" />
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
              <pre><code>{badgeData.stable.markdown}</code></pre>
            </article>

            <article className={`${styles.markdownCard} markdown-card`}>
              <header className="output-header">
                <h3>VS Code Insiders Markdown</h3>
                <button type="button" className="copy-btn" onClick={() => handleCopy('insiders')}>
                  {copiedVariant === 'insiders' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </header>
              <pre><code>{badgeData.insiders.markdown}</code></pre>
            </article>
          </div>

          <div className={`${styles.combinedMarkdown} combined-markdown`}>
            <header className="output-header">
              <h3>Combined Markdown</h3>
              <button type="button" className="copy-btn" onClick={() => handleCopy('combined')}>
                {copiedVariant === 'combined' ? '✅ Copied!' : '📋 Copy'}
              </button>
            </header>
            <pre><code>{badgeData.combinedMarkdown}</code></pre>
          </div>
        </section>
      )}
      </div>
    </>
  )
}

export default Extensions
