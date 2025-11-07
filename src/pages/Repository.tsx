import { useState, useEffect } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import styles from './Repository.module.css'
import {
  parseRepositoryInput,
  validateWorkflowFilename,
  getSemanticDefaultColor,
  generateRepositoryBadges,
  type BadgeConfig,
} from '../utils/repositoryBadge'
import RequestBadge from '../components/RequestBadge'

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
  const [defaultBranch, setDefaultBranch] = useState<string>('main')

  // Badge configurations
  const [badgeConfigs, setBadgeConfigs] = useState<BadgeConfig[]>([
    // Essential Badges
    { type: 'stars', enabled: false, customColor: `#${getSemanticDefaultColor('stars')}` },
    { type: 'license', enabled: false, customColor: `#${getSemanticDefaultColor('license')}` },
    { type: 'contributors', enabled: false, customColor: `#${getSemanticDefaultColor('contributors')}` },
    { type: 'release', enabled: false, customColor: `#${getSemanticDefaultColor('release')}` },
    { type: 'coverage', enabled: false, customColor: `#${getSemanticDefaultColor('coverage')}` },
    { type: 'openssf', enabled: false, customColor: `#${getSemanticDefaultColor('openssf')}` },
    // Advanced Badges
    { type: 'forks', enabled: false, customColor: `#${getSemanticDefaultColor('forks')}` },
    { type: 'issues', enabled: false, customColor: `#${getSemanticDefaultColor('issues')}` },
    { type: 'language', enabled: false, customColor: `#${getSemanticDefaultColor('language')}` },
    { type: 'codeSize', enabled: false, customColor: `#${getSemanticDefaultColor('codeSize')}` },
    { type: 'lastCommit', enabled: false, customColor: `#${getSemanticDefaultColor('lastCommit')}` },
    { type: 'repoSize', enabled: false, customColor: `#${getSemanticDefaultColor('repoSize')}` },
  ])
  // Local storage persistence keys
  const BADGE_KEY = 'repositoryBadgeConfigs'
  const WORKFLOW_KEY = 'repositoryWorkflowConfigs'
  const BRANCH_KEY = 'repositoryDefaultBranch'

  // Load persisted configs on mount
  useEffect(() => {
    try {
      const storedBadges = localStorage.getItem(BADGE_KEY)
      if (storedBadges) {
        const parsed: BadgeConfig[] = JSON.parse(storedBadges)
        if (Array.isArray(parsed)) {
          setBadgeConfigs(prev => prev.map(p => {
            const found = parsed.find(b => b.type === p.type)
            return found ? { ...p, enabled: !!found.enabled, customColor: found.customColor || p.customColor, label: found.label } : p
          }))
        }
      }
      const storedWorkflows = localStorage.getItem(WORKFLOW_KEY)
      if (storedWorkflows) {
        const parsedWf: BadgeConfig[] = JSON.parse(storedWorkflows)
        if (Array.isArray(parsedWf)) {
          const wf = parsedWf.filter(w => w.type === 'workflow' && w.workflowFile)
          setWorkflowConfigs(wf.map(w => ({ ...w, type: 'workflow' })) as BadgeConfig[])
          setSelectedWorkflowPresets(new Set(wf.filter(w => WORKFLOW_PRESETS.includes(w.workflowFile || '')).map(w => w.workflowFile!)))
        }
      }
      const storedBranch = localStorage.getItem(BRANCH_KEY)
      if (storedBranch) {
        setDefaultBranch(storedBranch)
      }
    } catch {
      // ignore corrupt storage
    }
  }, [])

  // Persist badge configs
  const persistBadges = (configs: BadgeConfig[]) => {
    try { localStorage.setItem(BADGE_KEY, JSON.stringify(configs)) } catch { /* ignore */ }
  }
  const persistWorkflows = (configs: BadgeConfig[]) => {
    try { localStorage.setItem(WORKFLOW_KEY, JSON.stringify(configs)) } catch { /* ignore */ }
  }
  const persistBranch = (branch: string) => {
    try { localStorage.setItem(BRANCH_KEY, branch) } catch { /* ignore */ }
  }

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
    setBadgeConfigs(configs => {
      const updated = configs.map(config =>
        config.type === type ? { ...config, enabled: !config.enabled } : config
      )
      persistBadges(updated)
      return updated
    })
  }

  const handleColorChange = (type: BadgeConfig['type'], color: string) => {
    setBadgeConfigs(configs => {
      const updated = configs.map(config =>
        config.type === type ? { ...config, customColor: color } : config
      )
      persistBadges(updated)
      return updated
    })
  }

  const handleColorReset = (type: BadgeConfig['type']) => {
    setBadgeConfigs(configs => {
      const updated = configs.map(config =>
        config.type === type
          ? { ...config, customColor: `#${getSemanticDefaultColor(type)}` }
          : config
      )
      persistBadges(updated)
      return updated
    })
  }

  const handleWorkflowPresetClick = (workflowFile: string) => {
    const newSelected = new Set(selectedWorkflowPresets)
    
    if (newSelected.has(workflowFile)) {
      // Deselect
      newSelected.delete(workflowFile)
      setWorkflowConfigs(configs => {
        const updated = configs.filter(c => c.workflowFile !== workflowFile)
        persistWorkflows(updated)
        return updated
      })
    } else {
      // Select
      newSelected.add(workflowFile)
      setWorkflowConfigs(configs => {
        const newWorkflow: BadgeConfig = {
          type: 'workflow',
          enabled: true,
          customColor: `#${getSemanticDefaultColor('workflow')}`,
          workflowFile,
        }
        const updated: BadgeConfig[] = [...configs, newWorkflow]
        persistWorkflows(updated)
        return updated
      })
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
    
    setWorkflowConfigs(configs => {
      const newWorkflow: BadgeConfig = {
        type: 'workflow',
        enabled: true,
        customColor: `#${getSemanticDefaultColor('workflow')}`,
        workflowFile: customWorkflowFilename,
      }
      const updated: BadgeConfig[] = [...configs, newWorkflow]
      persistWorkflows(updated)
      return updated
    })
    
    setCustomWorkflowFilename('')
    setWorkflowValidationError(null)
  }

  const handleWorkflowToggle = (workflowFile: string) => {
    setWorkflowConfigs(configs => {
      const updated: BadgeConfig[] = configs.map(config =>
        config.workflowFile === workflowFile
          ? { ...config, enabled: !config.enabled, type: 'workflow' }
          : config
      )
      persistWorkflows(updated)
      return updated
    })
  }

  const handleWorkflowColorChange = (workflowFile: string, color: string) => {
    setWorkflowConfigs(configs => {
      const updated: BadgeConfig[] = configs.map(config =>
        config.workflowFile === workflowFile ? { ...config, customColor: color, type: 'workflow' } : config
      )
      persistWorkflows(updated)
      return updated
    })
  }

  const handleWorkflowColorReset = (workflowFile: string) => {
    setWorkflowConfigs(configs => {
      const updated: BadgeConfig[] = configs.map(config =>
        config.workflowFile === workflowFile
          ? { ...config, customColor: `#${getSemanticDefaultColor('workflow')}`, type: 'workflow' }
          : config
      )
      persistWorkflows(updated)
      return updated
    })
  }

  const handleRemoveWorkflow = (workflowFile: string) => {
    setWorkflowConfigs(configs => {
      const updated: BadgeConfig[] = configs.filter(c => c.workflowFile !== workflowFile).map(c => ({ ...c, type: 'workflow' }))
      persistWorkflows(updated)
      return updated
    })
    setSelectedWorkflowPresets(prev => {
      const newSet = new Set(prev)
      newSet.delete(workflowFile)
      return newSet
    })
  }

  // Select/Clear essential badges
  const selectAllEssential = () => {
    setBadgeConfigs(configs => {
      const updated = configs.map(c =>
        ['stars','license','contributors','release','coverage','openssf'].includes(c.type) ? { ...c, enabled: true } : c
      )
      persistBadges(updated)
      return updated
    })
  }
  const clearAllEssential = () => {
    setBadgeConfigs(configs => {
      const updated = configs.map(c =>
        ['stars','license','contributors','release','coverage','openssf'].includes(c.type) ? { ...c, enabled: false } : c
      )
      persistBadges(updated)
      return updated
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
  const badges = repoInfo ? generateRepositoryBadges(repoInfo, allConfigs, defaultBranch || 'main') : []

  const essentialBadges = badges.filter(b => ['stars', 'license', 'contributors', 'release','coverage','openssf'].includes(b.type))
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
      coverage: '✅ Coverage',
      openssf: '🛡️ OpenSSF',
    }
    return labels[type]
  }

  const getBadgeDescription = (type: BadgeConfig['type']): string => {
    const desc: Record<BadgeConfig['type'], string> = {
      stars: 'Number of users who have starred this repository.',
      license: 'Repository license as detected by GitHub.',
      contributors: 'Total contributors with commits merged into the default branch.',
      release: 'Latest published GitHub release tag.',
      forks: 'Number of times this repository has been forked.',
      issues: 'Count of open GitHub issues.',
      language: 'Primary language used in the repository.',
      codeSize: 'Aggregated code size as reported by GitHub.',
      lastCommit: 'Time of the last commit to the default branch.',
      repoSize: 'Total repository size including all files.',
      workflow: 'Status of the selected GitHub Actions workflow file.',
      coverage: 'Test coverage percentage (Codecov).',
      openssf: 'OpenSSF Scorecard security & best practices score.'
    }
    return desc[type]
  }

  const renderBadgeRow = (config: BadgeConfig) => (
    <div key={config.type} className={styles.badgeCheckboxRow}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'0.5rem'}}>
        <label>
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={() => handleBadgeToggle(config.type)}
            aria-describedby={`desc-${config.type}`}
          />
          {getBadgeLabel(config.type)}
        </label>
        <span className={styles.tooltipWrapper}>
          <button type="button" className={styles.infoIcon} aria-describedby={`desc-${config.type}`} aria-label={`${getBadgeLabel(config.type)} info`}>
            i
          </button>
          <span className={styles.tooltipBubble}>{getBadgeDescription(config.type)}</span>
        </span>
      </div>
      <span id={`desc-${config.type}`} className={styles.badgeDescriptionVisuallyHidden}>{getBadgeDescription(config.type)}</span>
      {config.enabled && config.type !== 'stars' && (
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
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'0.5rem'}}>
        <label>
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={() => handleWorkflowToggle(config.workflowFile!)}
            aria-describedby={`desc-workflow-${config.workflowFile}`}
          />
          ✅ {config.workflowFile?.replace(/\.(yml|yaml)$/,'')}
        </label>
        <span className={styles.tooltipWrapper}>
          <button type="button" className={styles.infoIcon} aria-describedby={`desc-workflow-${config.workflowFile}`} aria-label={`Workflow ${config.workflowFile} info`}>
            i
          </button>
          <span className={styles.tooltipBubble}>{getBadgeDescription('workflow')}</span>
        </span>
      </div>
      <span id={`desc-workflow-${config.workflowFile}`} className={styles.badgeDescriptionVisuallyHidden}>{getBadgeDescription('workflow')}</span>
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
          <div className={styles.inlineFieldsRow}>
            <div className={styles.inlineField}>
              <label htmlFor="defaultBranch">Default branch</label>
              <input
                id="defaultBranch"
                type="text"
                value={defaultBranch}
                onChange={e => { setDefaultBranch(e.target.value.trim() || 'main'); persistBranch(e.target.value.trim() || 'main') }}
                placeholder="main"
                autoComplete="off"
              />
              <span className="field-hint">Used for license & last commit links (defaults to main)</span>
            </div>
          </div>

          <span className="field-hint">
            Accepts GitHub repository URLs (github.com/owner/repo) or direct format (owner/repo).
          </span>

          {/* Essential Badges Section */}
          <fieldset className={styles.badgeFieldset}>
            <legend>Essential Badges</legend>
            <div className={styles.fieldsetActions}>
              <button type="button" onClick={selectAllEssential}>Select All</button>
              <button type="button" onClick={clearAllEssential}>Clear All</button>
            </div>
            <div className={styles.badgeGrid}>
              {badgeConfigs
                .filter(c => ['stars', 'license', 'contributors', 'release','coverage','openssf'].includes(c.type))
                .map(renderBadgeRow)}
            </div>
          </fieldset>

          {/* CI/CD Workflows Section (fieldset style) */}
          <fieldset className={styles.badgeFieldset}>
            <legend>CI/CD Workflows</legend>
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
          </fieldset>

          {/* Advanced Badges Section */}
          <fieldset id="advanced-badges" className={styles.badgeFieldset}>
            <legend>Advanced Badges</legend>
            <div className={styles.badgeGrid}>
              {badgeConfigs
                .filter(c => ['forks', 'issues', 'language', 'codeSize', 'lastCommit', 'repoSize'].includes(c.type))
                .map(renderBadgeRow)}
            </div>
          </fieldset>

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
                        (() => {
                          const { imageUrl, linkUrl } = parseBadgeMarkdown(badge.markdown)
                          return linkUrl ? (
                            <a key={badge.type} href={linkUrl} target="_blank" rel="noopener noreferrer">
                              <img src={imageUrl} alt={badge.label} />
                            </a>
                          ) : (
                            <img key={badge.type} src={imageUrl} alt={badge.label} />
                          )
                        })()
                      ))}
                    </div>
                  </div>
                )}

                {workflowBadges.length > 0 && (
                  <div className={styles.previewSection}>
                    <div className={styles.previewSectionHeader}>CI/CD</div>
                    <div className={styles.previewRow}>
                      {workflowBadges.map((badge, idx) => (
                        (() => {
                          const { imageUrl, linkUrl } = parseBadgeMarkdown(badge.markdown)
                          return linkUrl ? (
                            <a key={`${badge.type}-${idx}`} href={linkUrl} target="_blank" rel="noopener noreferrer">
                              <img src={imageUrl} alt={badge.label} />
                            </a>
                          ) : (
                            <img key={`${badge.type}-${idx}`} src={imageUrl} alt={badge.label} />
                          )
                        })()
                      ))}
                    </div>
                  </div>
                )}

                {advancedBadges.length > 0 && (
                  <div className={styles.previewSection}>
                    <div className={styles.previewSectionHeader}>Advanced</div>
                    <div className={styles.previewRow}>
                      {advancedBadges.map(badge => (
                        (() => {
                          const { imageUrl, linkUrl } = parseBadgeMarkdown(badge.markdown)
                          return linkUrl ? (
                            <a key={badge.type} href={linkUrl} target="_blank" rel="noopener noreferrer">
                              <img src={imageUrl} alt={badge.label} />
                            </a>
                          ) : (
                            <img key={badge.type} src={imageUrl} alt={badge.label} />
                          )
                        })()
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.previewFlat}>
                {badges.map((badge, idx) => (
                  (() => {
                    const { imageUrl, linkUrl } = parseBadgeMarkdown(badge.markdown)
                    return linkUrl ? (
                      <a key={`${badge.type}-${idx}`} href={linkUrl} target="_blank" rel="noopener noreferrer">
                        <img src={imageUrl} alt={badge.label} />
                      </a>
                    ) : (
                      <img key={`${badge.type}-${idx}`} src={imageUrl} alt={badge.label} />
                    )
                  })()
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
                    {(() => {
                      const { imageUrl, linkUrl } = parseBadgeMarkdown(badge.markdown)
                      return linkUrl ? (
                        <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                          <img src={imageUrl} alt={badge.label} />
                        </a>
                      ) : (
                        <img src={imageUrl} alt={badge.label} />
                      )
                    })()}
                  </div>
                  <pre>
                    <code>{badge.markdown}</code>
                  </pre>
                </article>
              ))}
            </div>
          </section>
        )}
        
        <RequestBadge />
      </div>
    </>
  )
}

export default Repository
