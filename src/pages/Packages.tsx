import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import styles from './Packages.module.css'
import { parsePackageInput, generatePackageBadges, getInstallCommands, type PackageManager } from '../utils/packageBadge'
import PackageSearchDropdown from '../components/PackageSearchDropdown'
import RequestBadge from '../components/RequestBadge'
import { useBadgeTheme } from '../BadgeThemeContext'

type CopyTarget = 'version' | 'versionPrerelease' | 'downloads' | 'downloadsMonthly' | 'downloadsRecent' | 'combined' | 'commands' | `command-${number}`
type InputMode = 'manual' | 'search'
type Registry = 'npm' | 'pypi' | 'nuget' | 'rubygems' | 'crates' | 'maven'

function Packages() {
  const { badgeTheme } = useBadgeTheme()
  const [inputValue, setInputValue] = useState('')
  const [inputMode, setInputMode] = useState<InputMode>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [manualManager, setManualManager] = useState<PackageManager | ''>('')
  const [groupId, setGroupId] = useState('')
  const [artifactId, setArtifactId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [badgeData, setBadgeData] = useState<ReturnType<typeof generatePackageBadges> | null>(null)
  const [commands, setCommands] = useState<string[]>([])
  const [currentManager, setCurrentManager] = useState<PackageManager | null>(null)
  const [copiedTarget, setCopiedTarget] = useState<CopyTarget | null>(null)
  const [selectedRegistries, setSelectedRegistries] = useState<Set<Registry>>(
    new Set(['npm', 'nuget', 'rubygems', 'crates', 'maven'])
  )

  const showCopyState = (target: CopyTarget) => {
    setCopiedTarget(target)
    setTimeout(() => {
      setCopiedTarget(current => (current === target ? null : current))
    }, 2000)
  }

  const copyMarkdown = async (value: string, target: CopyTarget) => {
    try {
      await navigator.clipboard.writeText(value)
      showCopyState(target)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  // Helper to clear badge-related state
  const clearBadgeState = (opts?: { info?: boolean; error?: boolean }) => {
    setBadgeData(null)
    setCommands([])
    setCurrentManager(null)
    if (opts?.info) setInfo(null)
    if (opts?.error) setError(null)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setInputValue(value)
    
    if (inputMode === 'search') {
      setSearchQuery(value)
      setShowSearchDropdown(value.trim().length > 0)
    }
  }

  const handleSelectPackage = (packageName: string, registry: string) => {
    setInputValue(packageName)
    setSearchQuery('')
    setShowSearchDropdown(false)
    setInfo(`Selected: ${packageName} from ${registry.toUpperCase()}`)
    
    // Map registry to PackageManager type
    const managerMap: Record<string, PackageManager> = {
      npm: 'npm',
      nuget: 'nuget',
      pypi: 'pypi',
      maven: 'maven',
      rubygems: 'rubygems',
      crates: 'crates'
    }
    
    const manager = managerMap[registry]
    
    // For Maven packages, handle groupId:artifactId format
    if (manager === 'maven') {
      const parts = packageName.split(':')
      if (parts.length === 2) {
        setGroupId(parts[0])
        setArtifactId(parts[1])
        setManualManager('maven')
        const badges = generatePackageBadges('maven', null, parts[0], parts[1], badgeTheme)
        const cmds = getInstallCommands('maven', null, parts[0], parts[1])
        if (badges) {
          setError(null)
          setBadgeData(badges)
          setCommands(cmds)
          setCurrentManager('maven')
        }
      }
    } else {
      // For other package managers, generate badges automatically
      setManualManager(manager)
      const badges = generatePackageBadges(manager, packageName, undefined, undefined, badgeTheme)
      const cmds = getInstallCommands(manager, packageName)
      if (badges) {
        setError(null)
        setBadgeData(badges)
        setCommands(cmds)
        setCurrentManager(manager)
      }
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
    setGroupId('')
    setArtifactId('')
  }

  const handleRegistryToggle = (registry: Registry) => {
    setSelectedRegistries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(registry)) {
        // Don't allow deselecting all registries
        if (newSet.size > 1) {
          newSet.delete(registry)
        }
      } else {
        newSet.add(registry)
      }
      return newSet
    })
  }

  const handleGenerate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCopiedTarget(null)
    setShowSearchDropdown(false)

    // For Maven with manual input
    if (manualManager === 'maven' && groupId && artifactId) {
      const badges = generatePackageBadges('maven', null, groupId, artifactId, badgeTheme)
      const cmds = getInstallCommands('maven', null, groupId, artifactId)
      
      if (badges) {
        setError(null)
        setInfo(`Generating badges for Maven package: ${groupId}:${artifactId}`)
        setBadgeData(badges)
        setCommands(cmds)
        setCurrentManager('maven')
      } else {
        clearBadgeState({ info: true })
        setError('Unable to generate badges for this package.')
      }
      return
    }

    // Parse input
    const parsed = parsePackageInput(inputValue)

    // Determine which package manager to use
    const effectiveManager = manualManager || parsed.manager

    if (!effectiveManager) {
      clearBadgeState()
      setInfo(parsed.message ?? null)
      setError(parsed.error ?? 'Please select a package manager or provide a package URL.')
      return
    }

    // For Maven, ensure we have both fields
    if (effectiveManager === 'maven') {
      if (!parsed.groupId || !parsed.artifactId) {
        clearBadgeState({ info: true })
        setError('Maven packages require both Group ID and Artifact ID. Use format: groupId:artifactId')
        return
      }
    } else if (!parsed.packageId) {
      clearBadgeState({ info: true })
      setError('Please enter a valid package identifier.')
      return
    }

    // Generate badges and commands
    const badges = generatePackageBadges(
      effectiveManager,
      parsed.packageId,
      parsed.groupId,
      parsed.artifactId,
      badgeTheme
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
      clearBadgeState({ info: true })
      setError('Unable to generate badges for this package.')
    }
  }

  const handleCopy = async (target: CopyTarget) => {
    if (!badgeData) return

    let markdown = ''
    
    // Handle individual command copying
    if (target.startsWith('command-')) {
      const commandIndex = parseInt(target.split('-')[1], 10)
      const cmd = commands[commandIndex] || ''
      // Remove the comment line (e.g., "# .NET CLI\n") from the command
      const lines = cmd.split('\n')
      markdown = lines[0].startsWith('#') 
        ? lines.slice(1).join('\n').trim()
        : cmd.trim()
    } else {
      switch (target) {
        case 'version':
          markdown = badgeData.version.markdown
          break
        case 'versionPrerelease':
          markdown = badgeData.versionPrerelease?.markdown ?? ''
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
          if (badgeData.versionPrerelease) parts.push(badgeData.versionPrerelease.markdown)
          if (badgeData.downloads) parts.push(badgeData.downloads.markdown)
          if (badgeData.downloadsMonthly) parts.push(badgeData.downloadsMonthly.markdown)
          if (badgeData.downloadsRecent) parts.push(badgeData.downloadsRecent.markdown)
          markdown = parts.join('\n')
          break
        }
        case 'commands':
          markdown = commands.map(cmd => {
            // Format each command with proper markdown headings and code blocks
            const lines = cmd.split('\n')
            const titleLine = lines[0]
            const title = titleLine.startsWith('#') 
              ? titleLine.replace(/^#\s*/, '').trim()
              : null
            const codeContent = titleLine.startsWith('#') 
              ? lines.slice(1).join('\n').trim()
              : cmd.trim()
            
            if (title) {
              return `### ${title}\n\`\`\`bash\n${codeContent}\n\`\`\``
            }
            return `\`\`\`bash\n${codeContent}\n\`\`\``
          }).join('\n\n')
          break
      }
    }

    if (markdown) {
      await copyMarkdown(markdown, target)
    }
  }

  const showMavenFields = manualManager === 'maven' && inputMode === 'manual'

  return (
    <>
      <header className={`${styles.packagesHeader} packages-header`}>
        <p className={`${styles.eyebrow} eyebrow`}>Package Manager Badges</p>
        <h1>Create badges for package registries</h1>
        <p className={`${styles.subtitle} subtitle`}>
          Search for packages or manually enter package names to generate version and download badges
        </p>
      </header>

      <div className={`${styles.packagesPage} packages-page`}>
      <form className={`${styles.packagesForm} packages-form`} onSubmit={handleGenerate}>
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
        </div>

        {inputMode === 'search' && (
          <div className={styles.registryFilters}>
            <label className={styles.filterLabel}>Search in:</label>
            <div className={styles.checkboxGroup}>
              {(['npm', 'nuget', 'rubygems', 'crates', 'maven'] as const).map(registry => (
                <label key={registry} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedRegistries.has(registry)}
                    onChange={() => handleRegistryToggle(registry)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>
                    {registry === 'npm' && 'NPM'}
                    {registry === 'nuget' && 'NuGet'}
                    {registry === 'rubygems' && 'RubyGems'}
                    {registry === 'crates' && 'Crates.io'}
                    {registry === 'maven' && 'Maven'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className={`${styles.formRow} form-row`}>
          <div className="form-group flex-grow">
            <label htmlFor="packageInput">
              {inputMode === 'search' ? 'Search for package' : 'Package URL or Name'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="packageInput"
                type="text"
                placeholder={
                  inputMode === 'search'
                    ? 'Start typing to search... (e.g., express, react, django)'
                    : 'e.g. https://www.npmjs.com/package/express or express'
                }
                value={inputValue}
                onChange={handleInputChange}
                autoComplete="off"
              />
              {inputMode === 'search' && (
                <PackageSearchDropdown
                  searchQuery={searchQuery}
                  selectedRegistries={selectedRegistries}
                  onSelectPackage={handleSelectPackage}
                  isVisible={showSearchDropdown}
                  onClose={() => setShowSearchDropdown(false)}
                />
              )}
            </div>
            <span className="field-hint">
              {inputMode === 'search'
                ? 'Search across NPM, PyPI, NuGet, RubyGems, and Crates.io. Note: Search may not work in all browsers due to CORS restrictions. Use Manual Entry if search is unavailable.'
                : 'Supports URLs from npmjs.com, nuget.org, pypi.org, central.sonatype.com, rubygems.org, crates.io'}
            </span>
          </div>

          {inputMode === 'manual' && (
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
          )}
        </div>

        {showMavenFields && (
          <div className={`${styles.mavenFields} maven-fields`}>
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

        {inputMode === 'manual' && (
          <button type="submit" className="primary">
            Generate badges
          </button>
        )}
      </form>

      {error && <div className="form-alert error">{error}</div>}
      {info && !error && <div className="form-alert success">{info}</div>}

      {badgeData && !error && (
        <section className={`${styles.packagesOutput} packages-output`} aria-live="polite">
          <div className={`${styles.packagesPreview} packages-preview`}>
            <h2>Badge Preview</h2>
            <div className={`${styles.badgePreviewGrid} badge-preview-grid`}>
              <a href={badgeData.packageUrl} target="_blank" rel="noopener noreferrer">
                <img src={badgeData.version.imageUrl} alt="Version badge" />
              </a>
              {badgeData.versionPrerelease && (
                <a href={badgeData.packageUrl} target="_blank" rel="noopener noreferrer">
                  <img src={badgeData.versionPrerelease.imageUrl} alt="Prerelease version badge" />
                </a>
              )}
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

            {badgeData.versionPrerelease && (
              <article className="markdown-card">
                <header className="output-header">
                  <h3>Prerelease Version</h3>
                  <button type="button" className="copy-btn" onClick={() => handleCopy('versionPrerelease')}>
                    {copiedTarget === 'versionPrerelease' ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </header>
                <pre><code>{badgeData.versionPrerelease.markdown}</code></pre>
              </article>
            )}

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

          <div className={`${styles.combinedSection} combined-section`}>
            <article className="markdown-card">
              <header className="output-header">
                <h3>Combined Markdown</h3>
                <button type="button" className="copy-btn" onClick={() => handleCopy('combined')}>
                  {copiedTarget === 'combined' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </header>
              <pre><code>{[
                badgeData.version.markdown,
                badgeData.versionPrerelease?.markdown,
                badgeData.downloads?.markdown,
                badgeData.downloadsMonthly?.markdown,
                badgeData.downloadsRecent?.markdown
              ].filter(Boolean).join('\n')}</code></pre>
            </article>
          </div>

          {commands.length > 0 && (
            <div className={`${styles.installationSection} installation-section`}>
              <h2>Installation Commands</h2>
              <p className="section-description">
                Choose your preferred installation method:
              </p>
              
              <div className={`${styles.combinedCommands} combined-commands`}>
                <article className="markdown-card">
                  <header className="output-header">
                    <h3>Combined README Format</h3>
                    <button 
                      type="button" 
                      className="copy-btn" 
                      onClick={() => handleCopy('commands')}
                    >
                      {copiedTarget === 'commands' ? '✅ Copied!' : '📋 Copy All'}
                    </button>
                  </header>
                  <pre><code>{commands.map(cmd => {
                    // Format each command with proper markdown
                    const lines = cmd.split('\n')
                    const titleLine = lines[0]
                    const title = titleLine.startsWith('#') 
                      ? titleLine.replace(/^#\s*/, '').trim()
                      : null
                    const codeContent = titleLine.startsWith('#') 
                      ? lines.slice(1).join('\n').trim()
                      : cmd.trim()
                    
                    if (title) {
                      return `### ${title}\n\`\`\`bash\n${codeContent}\n\`\`\``
                    }
                    return `\`\`\`bash\n${codeContent}\n\`\`\``
                  }).join('\n\n')}</code></pre>
                </article>
              </div>

              <div className={styles.commandGrid}>
                {commands.map((cmd, index) => {
                  // Extract the title from the comment (e.g., "# .NET CLI" -> ".NET CLI")
                  const lines = cmd.split('\n')
                  const titleLine = lines[0]
                  const title = titleLine.startsWith('#') 
                    ? titleLine.replace(/^#\s*/, '').trim()
                    : `Option ${index + 1}`
                  const codeContent = titleLine.startsWith('#') 
                    ? lines.slice(1).join('\n').trim()
                    : cmd.trim()
                  
                  return (
                    <article key={index} className={`${styles.commandCard} markdown-card`}>
                      <header className="output-header">
                        <h3>{title}</h3>
                        <button 
                          type="button" 
                          className="copy-btn" 
                          onClick={() => handleCopy(`command-${index}` as CopyTarget)}
                        >
                          {copiedTarget === `command-${index}` ? '✅ Copied!' : '📋 Copy'}
                        </button>
                      </header>
                      <pre><code>{codeContent}</code></pre>
                    </article>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      )}
      
      <RequestBadge />
      </div>
    </>
  )
}

export default Packages
