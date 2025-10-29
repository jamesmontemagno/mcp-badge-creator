import { useState } from 'react'
import type { FormEvent } from 'react'
import '../App.css'
import { generateExtensionBadges, parseExtensionInput } from '../utils/extensionBadge'

type BadgeVariant = 'stable' | 'insiders' | 'combined'

function Extensions() {
  const [inputValue, setInputValue] = useState('')
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

  const handleGenerate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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
    <div className="extensions-page container">
      <header className="extensions-header">
        <p className="eyebrow">VS Code Extensions</p>
        <h1>Create badges for Marketplace listings</h1>
        <p className="subtitle">
          Paste an extension URL, identifier, or display name. We will detect the marketplace ID and craft badges
          for both VS Code and VS Code Insiders.
        </p>
      </header>

      <form className="extensions-form" onSubmit={handleGenerate}>
        <label htmlFor="extensionInput">Extension reference</label>
        <input
          id="extensionInput"
          type="text"
          placeholder="e.g. https://marketplace.visualstudio.com/items?itemName=ms-python.python"
          value={inputValue}
          onChange={event => setInputValue(event.target.value)}
        />
        <span className="field-hint">Accepts Marketplace URLs, publisher.extension IDs, or display names.</span>
        <button type="submit" className="primary">
          Generate badges
        </button>
      </form>

      {error && <div className="form-alert error">{error}</div>}
      {info && !error && <div className="form-alert success">{info}</div>}

      {badgeData && !error && (
        <section className="extensions-output" aria-live="polite">
          <div className="extensions-preview">
            <h2>Preview</h2>
            <div className="extensions-preview-row">
              <a href={badgeData.stable.marketplaceUrl} target="_blank" rel="noopener noreferrer">
                <img src={badgeData.stable.badgeUrl} alt="Install in VS Code" />
              </a>
              <a href={badgeData.insiders.marketplaceUrl} target="_blank" rel="noopener noreferrer">
                <img src={badgeData.insiders.badgeUrl} alt="Install in VS Code Insiders" />
              </a>
            </div>
          </div>

          <div className="markdown-columns">
            <article className="markdown-card">
              <header className="output-header">
                <h3>VS Code Markdown</h3>
                <button type="button" className="copy-btn" onClick={() => handleCopy('stable')}>
                  {copiedVariant === 'stable' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </header>
              <pre><code>{badgeData.stable.markdown}</code></pre>
            </article>

            <article className="markdown-card">
              <header className="output-header">
                <h3>VS Code Insiders Markdown</h3>
                <button type="button" className="copy-btn" onClick={() => handleCopy('insiders')}>
                  {copiedVariant === 'insiders' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </header>
              <pre><code>{badgeData.insiders.markdown}</code></pre>
            </article>
          </div>

          <div className="combined-markdown">
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
  )
}

export default Extensions
