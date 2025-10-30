import { useState } from 'react'
import type { FormEvent } from 'react'
import './Packages.css'
import { parsePackageInput, generatePackageBadges, getInstallCommands, type PackageManager } from '../utils/packageBadge'

type CopyTarget = 'version' | 'downloads' | 'downloadsMonthly' | 'downloadsRecent' | 'combined' | 'commands'

function Packages() {
  const [inputValue, setInputValue] = useState('')
  const [manualManager, setManualManager] = useState<PackageManager | ''>('')
  const [groupId, setGroupId] = useState('')
  const [artifactId, setArtifactId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [badgeData, setBadgeData] = useState<ReturnType<typeof generatePackageBadges> | null>(null)
  const [commands, setCommands] = useState<string[]>([])
  const [currentManager, setCurrentManager] = useState<PackageManager | null>(null)
  const [copiedTarget, setCopiedTarget] = useState<CopyTarget | null>(null)

  const showCopyState = (target: CopyTarget) => {
    setCopiedTarget(target)
    setTimeout(() => {
      setCopiedTarget(current => (current === target ? null : current))
    }, 2000)
  }

  const copyMarkdown = async (value: string, target: CopyTarget) => {
    await navigator.clipboard.writeText(value)
    showCopyState(target)
  }

  const handleGenerate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCopiedTarget(null)

    // For Maven with manual input
    if (manualManager === 'maven' && groupId && artifactId) {
      const badges = generatePackageBadges('maven', null, groupId, artifactId)
      const cmds = getInstallCommands('maven', null, groupId, artifactId)
      
      if (badges) {
        setError(null)
        setInfo(`Generating badges for Maven package: ${groupId}:${artifactId}`)
        setBadgeData(badges)
        setCommands(cmds)
        setCurrentManager('maven')
      }
      return
    }

    // Parse input
    const parsed = parsePackageInput(inputValue)

    // Determine which package manager to use
    const effectiveManager = manualManager || parsed.manager

    if (!effectiveManager) {
      setBadgeData(null)
      setCommands([])
      setCurrentManager(null)
      setInfo(parsed.message ?? null)
      setError(parsed.error ?? 'Please select a package manager or provide a package URL.')
      return
    }

    // For Maven, ensure we have both fields
    if (effectiveManager === 'maven') {
      if (!parsed.groupId || !parsed.artifactId) {
        setBadgeData(null)
        setCommands([])
        setCurrentManager(null)
        setInfo(null)
        setError('Maven packages require both Group ID and Artifact ID. Use format: groupId:artifactId')
        return
      }
    } else if (!parsed.packageId) {
      setBadgeData(null)
      setCommands([])
      setCurrentManager(null)
      setInfo(null)
      setError('Please enter a valid package identifier.')
      return
    }

    // Generate badges and commands
    const badges = generatePackageBadges(
      effectiveManager,
      parsed.packageId,
      parsed.groupId,
      parsed.artifactId
    )
    const cmds = getInstallCommands(
      effectiveManager,
      parsed.packageId,
      parsed.groupId,
      parsed.artifactId
    )

    if (badges) {
      setError(null)
      setInfo(parsed.message ?? `Generating badges for ${effectiveManager.toUpperCase()} package`)
      setBadgeData(badges)
      setCommands(cmds)
      setCurrentManager(effectiveManager)
    } else {
      setError('Unable to generate badges for this package.')
      setBadgeData(null)
      setCommands([])
      setCurrentManager(null)
    }
  }

  const handleCopy = async (target: CopyTarget) => {
    if (!badgeData) return

    let markdown = ''
    switch (target) {
      case 'version':
        markdown = badgeData.version.markdown
        break
      case 'downloads':
        markdown = badgeData.downloads?.markdown ?? ''
        break
      case 'downloadsMonthly':
        markdown = badgeData.downloadsMonthly?.markdown ?? ''
        break
      case 'downloadsRecent':
        markdown = badgeData.downloadsRecent?.markdown ?? ''
        break
      case 'combined': {
        const parts = [badgeData.version.markdown]
        if (badgeData.downloads) parts.push(badgeData.downloads.markdown)
        if (badgeData.downloadsMonthly) parts.push(badgeData.downloadsMonthly.markdown)
        if (badgeData.downloadsRecent) parts.push(badgeData.downloadsRecent.markdown)
        markdown = parts.join('\n')
        break
      }
      case 'commands':
        markdown = commands.join('\n\n')
        break
    }

    if (markdown) {
      await copyMarkdown(markdown, target)
    }
  }

  const showMavenFields = manualManager === 'maven'

  return (
    <div className="packages-page container">
      <header className="packages-header">
        <p className="eyebrow">Package Manager Badges</p>
        <h1>Create badges for package registries</h1>
        <p className="subtitle">
          Generate version and download badges for NPM, NuGet, PyPI, Maven Central, RubyGems, and Crates.io packages.
          Paste a package URL or enter package details manually.
        </p>
      </header>

      <form className="packages-form" onSubmit={handleGenerate}>
        <div className="form-row">
          <div className="form-group flex-grow">
            <label htmlFor="packageInput">Package URL or Name</label>
            <input
              id="packageInput"
              type="text"
              placeholder="e.g. https://www.npmjs.com/package/express or express"
              value={inputValue}
              onChange={event => setInputValue(event.target.value)}
            />
            <span className="field-hint">
              Supports URLs from npmjs.com, nuget.org, pypi.org, central.sonatype.com, rubygems.org, crates.io
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="packageManager">Package Manager</label>
            <select
              id="packageManager"
              value={manualManager}
              onChange={event => setManualManager(event.target.value as PackageManager | '')}
            >
              <option value="">Auto-detect</option>
              <option value="npm">NPM</option>
              <option value="nuget">NuGet</option>
              <option value="pypi">PyPI</option>
              <option value="maven">Maven Central</option>
              <option value="rubygems">RubyGems</option>
              <option value="crates">Crates.io</option>
            </select>
          </div>
        </div>

        {showMavenFields && (
          <div className="maven-fields">
            <div className="form-group">
              <label htmlFor="groupId">Group ID</label>
              <input
                id="groupId"
                type="text"
                placeholder="e.g. com.google.guava"
                value={groupId}
                onChange={event => setGroupId(event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="artifactId">Artifact ID</label>
              <input
                id="artifactId"
                type="text"
                placeholder="e.g. guava"
                value={artifactId}
                onChange={event => setArtifactId(event.target.value)}
              />
            </div>
          </div>
        )}

        <button type="submit" className="primary">
          Generate badges
        </button>
      </form>

      {error && <div className="form-alert error">{error}</div>}
      {info && !error && <div className="form-alert success">{info}</div>}

      {badgeData && !error && (
        <section className="packages-output" aria-live="polite">
          <div className="packages-preview">
            <h2>Badge Preview</h2>
            <div className="badge-preview-grid">
              <a href={badgeData.packageUrl} target="_blank" rel="noopener noreferrer">
                <img src={badgeData.version.imageUrl} alt="Version badge" />
              </a>
              {badgeData.downloads && (
                <a href={badgeData.packageUrl} target="_blank" rel="noopener noreferrer">
                  <img src={badgeData.downloads.imageUrl} alt="Downloads badge" />
                </a>
              )}
              {badgeData.downloadsMonthly && (
                <a href={badgeData.packageUrl} target="_blank" rel="noopener noreferrer">
                  <img src={badgeData.downloadsMonthly.imageUrl} alt="Monthly downloads badge" />
                </a>
              )}
              {badgeData.downloadsRecent && (
                <a href={badgeData.packageUrl} target="_blank" rel="noopener noreferrer">
                  <img src={badgeData.downloadsRecent.imageUrl} alt="Recent downloads badge" />
                </a>
              )}
            </div>
            <p className="preview-link">
              <a href={badgeData.packageUrl} target="_blank" rel="noopener noreferrer">
                View on {currentManager?.toUpperCase()} →
              </a>
            </p>
          </div>

          <div className="markdown-columns">
            <article className="markdown-card">
              <header className="output-header">
                <h3>Version Badge</h3>
                <button type="button" className="copy-btn" onClick={() => handleCopy('version')}>
                  {copiedTarget === 'version' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </header>
              <pre><code>{badgeData.version.markdown}</code></pre>
            </article>

            {badgeData.downloads && (
              <article className="markdown-card">
                <header className="output-header">
                  <h3>Total Downloads</h3>
                  <button type="button" className="copy-btn" onClick={() => handleCopy('downloads')}>
                    {copiedTarget === 'downloads' ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </header>
                <pre><code>{badgeData.downloads.markdown}</code></pre>
              </article>
            )}

            {badgeData.downloadsMonthly && (
              <article className="markdown-card">
                <header className="output-header">
                  <h3>Monthly Downloads</h3>
                  <button type="button" className="copy-btn" onClick={() => handleCopy('downloadsMonthly')}>
                    {copiedTarget === 'downloadsMonthly' ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </header>
                <pre><code>{badgeData.downloadsMonthly.markdown}</code></pre>
              </article>
            )}

            {badgeData.downloadsRecent && (
              <article className="markdown-card">
                <header className="output-header">
                  <h3>Recent Downloads</h3>
                  <button type="button" className="copy-btn" onClick={() => handleCopy('downloadsRecent')}>
                    {copiedTarget === 'downloadsRecent' ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </header>
                <pre><code>{badgeData.downloadsRecent.markdown}</code></pre>
              </article>
            )}
          </div>

          <div className="combined-section">
            <article className="markdown-card">
              <header className="output-header">
                <h3>Combined Markdown</h3>
                <button type="button" className="copy-btn" onClick={() => handleCopy('combined')}>
                  {copiedTarget === 'combined' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </header>
              <pre><code>{[
                badgeData.version.markdown,
                badgeData.downloads?.markdown,
                badgeData.downloadsMonthly?.markdown,
                badgeData.downloadsRecent?.markdown
              ].filter(Boolean).join('\n')}</code></pre>
            </article>
          </div>

          {commands.length > 0 && (
            <div className="installation-section">
              <header className="output-header">
                <h3>Installation Commands</h3>
                <button type="button" className="copy-btn" onClick={() => handleCopy('commands')}>
                  {copiedTarget === 'commands' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </header>
              <div className="command-blocks">
                {commands.map((cmd, index) => (
                  <pre key={index}><code>{cmd}</code></pre>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default Packages
