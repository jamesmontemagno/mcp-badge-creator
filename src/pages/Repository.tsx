import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import styles from './Repository.module.css'
import {
  parseRepositoryInput,
  validateWorkflowFilename,
  getSemanticDefaultColor,
  generateRepositoryBadges,
  type BadgeConfig,
} from '../utils/repositoryBadge'

type InputMode = 'manual' | 'search'
type PreviewMode = 'grouped' | 'flat'

const WORKFLOW_PRESETS = ['ci.yml', 'test.yml', 'build.yml', 'deploy.yml', 'release.yml', 'lint.yml']

function Repository() {
  const [inputValue, setInputValue] = useState('')
  const [inputMode] = useState<InputMode>('manual') // Search not implemented yet
  const [error, setError] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('grouped')
  const [copiedBadge, setCopiedBadge] = useState<string | null>(null)
  const [customWorkflowFilename, setCustomWorkflowFilename] = useState('')
  const [workflowValidationError, setWorkflowValidationError] = useState<string | null>(null)
  const [selectedWorkflowPresets, setSelectedWorkflowPresets] = useState<Set<string>>(new Set())

  // Badge configurations
  const [badgeConfigs, setBadgeConfigs] = useState<BadgeConfig[]>([
    // Essential Badges
    { type: 'stars', enabled: false, customColor: `#${getSemanticDefaultColor('stars')}` },
    { type: 'license', enabled: false, customColor: `#${getSemanticDefaultColor('license')}` },
    { type: 'contributors', enabled: false, customColor: `#${getSemanticDefaultColor('contributors')}` },
    { type: 'release', enabled: false, customColor: `#${getSemanticDefaultColor('release')}` },
    // Advanced Badges
    { type: 'forks', enabled: false, customColor: `#${getSemanticDefaultColor('forks')}` },
    { type: 'issues', enabled: false, customColor: `#${getSemanticDefaultColor('issues')}` },
    { type: 'language', enabled: false, customColor: `#${getSemanticDefaultColor('language')}` },
    { type: 'codeSize', enabled: false, customColor: `#${getSemanticDefaultColor('codeSize')}` },
    { type: 'lastCommit', enabled: false, customColor: `#${getSemanticDefaultColor('lastCommit')}` },
    { type: 'repoSize', enabled: false, customColor: `#${getSemanticDefaultColor('repoSize')}` },
  ])

  const [workflowConfigs, setWorkflowConfigs] = useState<BadgeConfig[]>([])

  const showCopyState = (badge: string) => {
    setCopiedBadge(badge)
    setTimeout(() => {
      setCopiedBadge(current => (current === badge ? null : current))
    }, 2000)
  }

  const copyMarkdown = async (value: string, badge: string) => {
    await navigator.clipboard.writeText(value)
    showCopyState(badge)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
    setError(null)
  }

  const handleBadgeToggle = (type: BadgeConfig['type']) => {
    setBadgeConfigs(configs =>
      configs.map(config =>
        config.type === type ? { ...config, enabled: !config.enabled } : config
      )
    )
  }

  const handleColorChange = (type: BadgeConfig['type'], color: string) => {
    setBadgeConfigs(configs =>
      configs.map(config =>
        config.type === type ? { ...config, customColor: color } : config
      )
    )
  }

  const handleColorReset = (type: BadgeConfig['type']) => {
    setBadgeConfigs(configs =>
      configs.map(config =>
        config.type === type
          ? { ...config, customColor: `#${getSemanticDefaultColor(type)}` }
          : config
      )
    )
  }

  const handleWorkflowPresetClick = (workflowFile: string) => {
    const newSelected = new Set(selectedWorkflowPresets)
    
    if (newSelected.has(workflowFile)) {
      // Deselect
      newSelected.delete(workflowFile)
      setWorkflowConfigs(configs => configs.filter(c => c.workflowFile !== workflowFile))
    } else {
      // Select
      newSelected.add(workflowFile)
      setWorkflowConfigs(configs => [
        ...configs,
        {
          type: 'workflow',
          enabled: true,
          customColor: `#${getSemanticDefaultColor('workflow')}`,
          workflowFile,
        },
      ])
    }
    
    setSelectedWorkflowPresets(newSelected)
  }

  const handleCustomWorkflowChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setCustomWorkflowFilename(value)
    
    if (value.trim() === '') {
      setWorkflowValidationError(null)
      return
    }
    
    if (!validateWorkflowFilename(value)) {
      setWorkflowValidationError('Workflow filename must end with .yml or .yaml')
    } else {
      setWorkflowValidationError(null)
    }
  }

  const handleAddCustomWorkflow = () => {
    if (!customWorkflowFilename.trim() || !validateWorkflowFilename(customWorkflowFilename)) {
      setWorkflowValidationError('Please enter a valid workflow filename (.yml or .yaml)')
      return
    }
    
    // Check if already exists
    if (workflowConfigs.some(c => c.workflowFile === customWorkflowFilename)) {
      setWorkflowValidationError('This workflow is already added')
      return
    }
    
    setWorkflowConfigs(configs => [
      ...configs,
      {
        type: 'workflow',
        enabled: true,
        customColor: `#${getSemanticDefaultColor('workflow')}`,
        workflowFile: customWorkflowFilename,
      },
    ])
    
    setCustomWorkflowFilename('')
    setWorkflowValidationError(null)
  }

  const handleWorkflowToggle = (workflowFile: string) => {
    setWorkflowConfigs(configs =>
      configs.map(config =>
        config.workflowFile === workflowFile
          ? { ...config, enabled: !config.enabled }
          : config
      )
    )
  }

  const handleWorkflowColorChange = (workflowFile: string, color: string) => {
    setWorkflowConfigs(configs =>
      configs.map(config =>
        config.workflowFile === workflowFile ? { ...config, customColor: color } : config
      )
    )
  }

  const handleWorkflowColorReset = (workflowFile: string) => {
    setWorkflowConfigs(configs =>
      configs.map(config =>
        config.workflowFile === workflowFile
          ? { ...config, customColor: `#${getSemanticDefaultColor('workflow')}` }
          : config
      )
    )
  }

  const handleRemoveWorkflow = (workflowFile: string) => {
    setWorkflowConfigs(configs => configs.filter(c => c.workflowFile !== workflowFile))
    setSelectedWorkflowPresets(prev => {
      const newSet = new Set(prev)
      newSet.delete(workflowFile)
      return newSet
    })
  }

  const handleGenerate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCopiedBadge(null)

    const parsed = parseRepositoryInput(inputValue)
    if (!parsed) {
      setError('Unable to parse repository input. Please enter a valid GitHub repository URL (e.g., github.com/owner/repo) or owner/repo format.')
      return
    }

    setError(null)
  }

  const repoInfo = parseRepositoryInput(inputValue)
  const allConfigs = [...badgeConfigs, ...workflowConfigs]
  const badges = repoInfo ? generateRepositoryBadges(repoInfo, allConfigs) : []

  const essentialBadges = badges.filter(b => ['stars', 'license', 'contributors', 'release'].includes(b.type))
  const workflowBadges = badges.filter(b => b.type === 'workflow')
  const advancedBadges = badges.filter(b => ['forks', 'issues', 'language', 'codeSize', 'lastCommit', 'repoSize'].includes(b.type))

  const combinedMarkdown = badges.map(b => b.markdown).join(' ')

  const getBadgeLabel = (type: BadgeConfig['type']): string => {
    const labels: Record<BadgeConfig['type'], string> = {
      stars: '⭐ Stars',
      forks: '🍴 Forks',
      issues: '🐛 Issues',
      license: '📄 License',
      workflow: '✅ Workflow Status',
      contributors: '👥 Contributors',
      release: '📦 Release',
      language: '💻 Language',
      codeSize: '📊 Code Size',
      lastCommit: '🕒 Last Commit',
      repoSize: '💾 Repo Size',
    }
    return labels[type]
  }

  const renderBadgeRow = (config: BadgeConfig) => (
    <div key={config.type} className={styles.badgeCheckboxRow}>
      <label>
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={() => handleBadgeToggle(config.type)}
        />
        {getBadgeLabel(config.type)}
      </label>
      {config.enabled && (
        <div className={styles.colorControls}>
          <input
            type="color"
            className={styles.colorPicker}
            value={config.customColor}
            onChange={e => handleColorChange(config.type, e.target.value)}
            title="Choose badge color"
          />
          <button
            type="button"
            className={styles.resetColorBtn}
            onClick={() => handleColorReset(config.type)}
            title="Reset to default color"
            aria-label="Reset color"
          >
            ↺
          </button>
        </div>
      )}
    </div>
  )

  const renderWorkflowRow = (config: BadgeConfig) => (
    <div key={config.workflowFile} className={styles.badgeCheckboxRow}>
      <label>
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={() => handleWorkflowToggle(config.workflowFile!)}
        />
        ✅ {config.workflowFile?.replace(/\.(yml|yaml)$/, '')}
      </label>
      <div className={styles.colorControls}>
        {config.enabled && (
          <>
            <input
              type="color"
              className={styles.colorPicker}
              value={config.customColor}
              onChange={e => handleWorkflowColorChange(config.workflowFile!, e.target.value)}
              title="Choose badge color"
            />
            <button
              type="button"
              className={styles.resetColorBtn}
              onClick={() => handleWorkflowColorReset(config.workflowFile!)}
              title="Reset to default color"
              aria-label="Reset color"
            >
              ↺
            </button>
          </>
        )}
        <button
          type="button"
          className={styles.removeWorkflowBtn}
          onClick={() => handleRemoveWorkflow(config.workflowFile!)}
          title="Remove workflow"
          aria-label="Remove workflow"
        >
          ✕
        </button>
      </div>
    </div>
  )

  return (
    <>
      <header className={styles.repositoryHeader}>
        <p className={styles.eyebrow}>GitHub Repository</p>
        <h1>Create badges for repository stats</h1>
        <p className={styles.subtitle}>
          Enter a GitHub repository URL or owner/repo format to generate customizable badges for stars, 
          workflows, contributors, and more.
        </p>
      </header>

      <div className={styles.repositoryPage}>
        <form className={styles.repositoryForm} onSubmit={handleGenerate}>
          <label htmlFor="repositoryInput">
            {inputMode === 'search' ? 'Search for repository' : 'Repository reference'}
          </label>

          <input
            id="repositoryInput"
            type="text"
            placeholder="e.g. https://github.com/facebook/react or facebook/react"
            value={inputValue}
            onChange={handleInputChange}
            autoComplete="off"
          />

          <span className="field-hint">
            Accepts GitHub repository URLs (github.com/owner/repo) or direct format (owner/repo).
          </span>

          {/* Essential Badges Section */}
          <div className={styles.sectionHeader}>
            <h3>Essential Badges</h3>
          </div>
          {badgeConfigs
            .filter(c => ['stars', 'license', 'contributors', 'release'].includes(c.type))
            .map(renderBadgeRow)}

          {/* CI/CD Workflows Section */}
          <div className={styles.sectionHeader}>
            <h3>CI/CD Workflows</h3>
          </div>
          
          <div className={styles.workflowChips}>
            {WORKFLOW_PRESETS.map(workflow => (
              <button
                key={workflow}
                type="button"
                className={`${styles.workflowChip} ${
                  selectedWorkflowPresets.has(workflow) ? styles.workflowChipActive : ''
                }`}
                onClick={() => handleWorkflowPresetClick(workflow)}
              >
                {selectedWorkflowPresets.has(workflow) && '✓ '}
                {workflow}
              </button>
            ))}
          </div>

          <div className={styles.customWorkflowInput}>
            <label htmlFor="customWorkflow">Custom workflow filename</label>
            <div className={styles.customWorkflowControls}>
              <input
                id="customWorkflow"
                type="text"
                placeholder="e.g. custom-ci.yml"
                value={customWorkflowFilename}
                onChange={handleCustomWorkflowChange}
              />
              <button
                type="button"
                className={styles.addWorkflowBtn}
                onClick={handleAddCustomWorkflow}
                disabled={!customWorkflowFilename.trim() || !!workflowValidationError}
              >
                Add Workflow
              </button>
            </div>
            {workflowValidationError && (
              <span className={styles.validationError}>{workflowValidationError}</span>
            )}
          </div>

          {workflowConfigs.length > 0 && (
            <div className={styles.workflowList}>
              {workflowConfigs.map(renderWorkflowRow)}
            </div>
          )}

          {/* Advanced Badges Section */}
          <div className={styles.sectionHeader}>
            <h3>Advanced Badges</h3>
          </div>
          {badgeConfigs
            .filter(c => ['forks', 'issues', 'language', 'codeSize', 'lastCommit', 'repoSize'].includes(c.type))
            .map(renderBadgeRow)}

          <button type="submit" className="primary">
            Generate badges
          </button>
        </form>

        {error && <div className="form-alert error">{error}</div>}

        {repoInfo && badges.length > 0 && !error && (
          <section className={styles.repositoryOutput} aria-live="polite">
            {/* Preview Display Toggle */}
            <div className={styles.previewHeader}>
              <h2>Preview</h2>
              <div className={styles.previewToggle}>
                <button
                  type="button"
                  className={previewMode === 'grouped' ? styles.previewToggleActive : ''}
                  onClick={() => setPreviewMode('grouped')}
                >
                  Grouped
                </button>
                <button
                  type="button"
                  className={previewMode === 'flat' ? styles.previewToggleActive : ''}
                  onClick={() => setPreviewMode('flat')}
                >
                  Flat
                </button>
              </div>
            </div>

            {previewMode === 'grouped' ? (
              <div className={styles.previewGrouped}>
                {essentialBadges.length > 0 && (
                  <div className={styles.previewSection}>
                    <div className={styles.previewSectionHeader}>Essential</div>
                    <div className={styles.previewRow}>
                      {essentialBadges.map(badge => (
                        <img
                          key={badge.type}
                          src={badge.markdown.match(/\((https:\/\/[^)]+)\)/)?.[1]}
                          alt={badge.label}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {workflowBadges.length > 0 && (
                  <div className={styles.previewSection}>
                    <div className={styles.previewSectionHeader}>CI/CD</div>
                    <div className={styles.previewRow}>
                      {workflowBadges.map((badge, idx) => (
                        <img
                          key={`${badge.type}-${idx}`}
                          src={badge.markdown.match(/\((https:\/\/[^)]+)\)/)?.[1]}
                          alt={badge.label}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {advancedBadges.length > 0 && (
                  <div className={styles.previewSection}>
                    <div className={styles.previewSectionHeader}>Advanced</div>
                    <div className={styles.previewRow}>
                      {advancedBadges.map(badge => (
                        <img
                          key={badge.type}
                          src={badge.markdown.match(/\((https:\/\/[^)]+)\)/)?.[1]}
                          alt={badge.label}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.previewFlat}>
                {badges.map((badge, idx) => (
                  <img
                    key={`${badge.type}-${idx}`}
                    src={badge.markdown.match(/\((https:\/\/[^)]+)\)/)?.[1]}
                    alt={badge.label}
                  />
                ))}
              </div>
            )}

            {/* Combined Markdown - Moved to Top */}
            <div className={styles.combinedMarkdown}>
              <header className="output-header">
                <h3>Combined Markdown</h3>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => copyMarkdown(combinedMarkdown, 'combined')}
                >
                  {copiedBadge === 'combined' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </header>
              <pre>
                <code>{combinedMarkdown}</code>
              </pre>
            </div>

            {/* Individual Badge Markdown Cards with Previews */}
            <div className={styles.markdownColumns}>
              {badges.map((badge, idx) => (
                <article key={`${badge.type}-${idx}`} className={styles.markdownCard}>
                  <header className="output-header">
                    <h3>{badge.label}</h3>
                    <button
                      type="button"
                      className="copy-btn"
                      onClick={() => copyMarkdown(badge.markdown, `${badge.type}-${idx}`)}
                    >
                      {copiedBadge === `${badge.type}-${idx}` ? '✅ Copied!' : '📋 Copy'}
                    </button>
                  </header>
                  <div className={styles.cardBadgePreview}>
                    <img
                      src={badge.markdown.match(/\((https:\/\/[^)]+)\)/)?.[1]}
                      alt={badge.label}
                    />
                  </div>
                  <pre>
                    <code>{badge.markdown}</code>
                  </pre>
                </article>
              ))}
            </div>
          </section>
        )}
        
        <div className={styles.requestBadgeSection}>
          <p className={styles.requestBadgeText}>
            Need a badge type that's not listed?
          </p>
          <a
            href="https://github.com/jamesmontemagno/mcp-badge-creator/issues/new?template=badge-request.yml"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.requestBadgeBtn}
          >
            Request a Badge
          </a>
        </div>
      </div>
    </>
  )
}

export default Repository
