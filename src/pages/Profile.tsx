import { useState, useEffect } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import styles from './Profile.module.css'
import {
  getSemanticDefaultColor,
  generateProfileBadges,
  type BadgeConfig,
  type BadgeType,
} from '../utils/profileBadge'

function Profile() {
  const [defaultUsername, setDefaultUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copiedBadge, setCopiedBadge] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [showReorderSection, setShowReorderSection] = useState(false)

  // Badge configurations (alphabetized by display label)
  const [badgeConfigs, setBadgeConfigs] = useState<BadgeConfig[]>([
    { type: 'bluesky', enabled: false, customColor: `#${getSemanticDefaultColor('bluesky')}` },
    { type: 'discord', enabled: false, customColor: `#${getSemanticDefaultColor('discord')}` },
    { type: 'discourse', enabled: false, customColor: `#${getSemanticDefaultColor('discourse')}` },
    { type: 'github-gist', enabled: false, customColor: `#${getSemanticDefaultColor('github-gist')}` },
    { type: 'github-followers', enabled: false, customColor: `#${getSemanticDefaultColor('github-followers')}` },
    { type: 'github-sponsors', enabled: false, customColor: `#${getSemanticDefaultColor('github-sponsors')}` },
    { type: 'gitter', enabled: false, customColor: `#${getSemanticDefaultColor('gitter')}` },
    { type: 'liberapay', enabled: false, customColor: `#${getSemanticDefaultColor('liberapay')}` },
    { type: 'mastodon', enabled: false, customColor: `#${getSemanticDefaultColor('mastodon')}` },
    { type: 'opencollective', enabled: false, customColor: `#${getSemanticDefaultColor('opencollective')}` },
    { type: 'reddit-karma-combined', enabled: false, customColor: `#${getSemanticDefaultColor('reddit-karma-combined')}` },
    { type: 'reddit-karma-comment', enabled: false, customColor: `#${getSemanticDefaultColor('reddit-karma-comment')}` },
    { type: 'reddit-karma-link', enabled: false, customColor: `#${getSemanticDefaultColor('reddit-karma-link')}` },
    { type: 'stackoverflow', enabled: false, customColor: `#${getSemanticDefaultColor('stackoverflow')}` },
    { type: 'subreddit', enabled: false, customColor: `#${getSemanticDefaultColor('subreddit')}` },
    { type: 'twitch', enabled: false, customColor: `#${getSemanticDefaultColor('twitch')}` },
    { type: 'twitter', enabled: false, customColor: `#${getSemanticDefaultColor('twitter')}` },
    { type: 'youtube-subscribers', enabled: false, customColor: `#${getSemanticDefaultColor('youtube-subscribers')}` },
    { type: 'youtube-views', enabled: false, customColor: `#${getSemanticDefaultColor('youtube-views')}` },
  ])

  // Local storage persistence keys
  const BADGE_KEY = 'profileBadgeConfigs'
  const USERNAME_KEY = 'profileDefaultUsername'

  // Load persisted configs on mount
  useEffect(() => {
    try {
      const storedBadges = localStorage.getItem(BADGE_KEY)
      if (storedBadges) {
        const parsed: BadgeConfig[] = JSON.parse(storedBadges)
        if (Array.isArray(parsed)) {
          setBadgeConfigs(prev => prev.map(p => {
            const found = parsed.find(b => b.type === p.type)
            return found ? { ...p, ...found } : p
          }))
        }
      }
      const storedUsername = localStorage.getItem(USERNAME_KEY)
      if (storedUsername) {
        setDefaultUsername(storedUsername)
      }
    } catch {
      // ignore corrupt storage
    }
  }, [])

  // Persist badge configs
  const persistBadges = (configs: BadgeConfig[]) => {
    try { localStorage.setItem(BADGE_KEY, JSON.stringify(configs)) } catch { /* ignore */ }
  }
  
  const persistUsername = (username: string) => {
    try { localStorage.setItem(USERNAME_KEY, username) } catch { /* ignore */ }
  }

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

  const handleBadgeToggle = (type: BadgeType) => {
    setBadgeConfigs(configs => {
      const updated = configs.map(config => {
        if (config.type === type) {
          const wasEnabled = config.enabled
          const newConfig = { ...config, enabled: !config.enabled }
          
          // Pre-fill username on first enable if default username is set
          if (!wasEnabled && defaultUsername && usesUsername(type)) {
            if (!newConfig.username) {
              newConfig.username = defaultUsername
            }
          }
          
          return newConfig
        }
        return config
      })
      persistBadges(updated)
      return updated
    })
  }

  const handleColorChange = (type: BadgeType, color: string) => {
    setBadgeConfigs(configs => {
      const updated = configs.map(config =>
        config.type === type ? { ...config, customColor: color } : config
      )
      persistBadges(updated)
      return updated
    })
  }

  const handleColorReset = (type: BadgeType) => {
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

  const handleFieldChange = (type: BadgeType, field: keyof BadgeConfig, value: string) => {
    setBadgeConfigs(configs => {
      const updated = configs.map(config =>
        config.type === type ? { ...config, [field]: value } : config
      )
      persistBadges(updated)
      return updated
    })
  }

  const handleDefaultUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDefaultUsername(value)
    persistUsername(value)
  }

  // Helper to determine if badge type uses username field
  const usesUsername = (type: BadgeType): boolean => {
    return [
      'github-followers', 'github-sponsors', 'twitter', 'bluesky', 'twitch',
      'reddit-karma-link', 'reddit-karma-comment', 'reddit-karma-combined',
      'opencollective', 'liberapay'
    ].includes(type)
  }

  // Select/Clear category badges
  const selectAll = () => {
    setBadgeConfigs(configs => {
      const updated = configs.map(c => {
        const wasEnabled = c.enabled
        const newConfig = { ...c, enabled: true }
        
        // Pre-fill username on first enable if default username is set
        if (!wasEnabled && defaultUsername && usesUsername(c.type)) {
          if (!newConfig.username) {
            newConfig.username = defaultUsername
          }
        }
        
        return newConfig
      })
      persistBadges(updated)
      return updated
    })
  }
  
  const clearAll = () => {
    setBadgeConfigs(configs => {
      const updated = configs.map(c => ({ ...c, enabled: false }))
      persistBadges(updated)
      return updated
    })
  }

  const handleGenerate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCopiedBadge(null)
    setError(null)
  }

  const allBadges = generateProfileBadges(badgeConfigs)
  
  // Reordering: maintain order of enabled badges
  const [badgeOrder, setBadgeOrder] = useState<BadgeType[]>([])
  
  // Sync badge order when enabled badges change
  useEffect(() => {
    const enabledTypes = allBadges.map(b => b.type as BadgeType)
    setBadgeOrder(prev => {
      // Keep existing order for badges still enabled, add new ones at end
      const stillEnabled = prev.filter(t => enabledTypes.includes(t))
      const newlyEnabled = enabledTypes.filter(t => !prev.includes(t))
      return [...stillEnabled, ...newlyEnabled]
    })
  }, [allBadges])
  
  // Reorder badges based on badgeOrder state
  const badges = badgeOrder
    .map(type => allBadges.find(b => b.type === type))
    .filter((b): b is NonNullable<typeof b> => b !== undefined)

  const combinedMarkdown = badges.map(b => b.markdown).join(' ')

  const getBadgeLabel = (type: BadgeType): string => {
    const labels: Record<BadgeType, string> = {
      'github-followers': '👥 GitHub Followers',
      'github-sponsors': '💖 GitHub Sponsors',
      'github-gist': '⭐ Gist Stars',
      'youtube-subscribers': '📺 YouTube Subscribers',
      'youtube-views': '👁️ YouTube Channel Views',
      'discord': '💬 Discord Members',
      'twitter': '🐦 X (Twitter) Followers',
      'bluesky': '🦋 Bluesky Followers',
      'mastodon': '🐘 Mastodon Followers',
      'twitch': '🎮 Twitch Status',
      'reddit-karma-link': '🔗 Reddit Karma (Link)',
      'reddit-karma-comment': '💬 Reddit Karma (Comment)',
      'reddit-karma-combined': '📊 Reddit Karma (Combined)',
      'stackoverflow': '💡 Stack Overflow Reputation',
      'opencollective': '🤝 Open Collective Backers',
      'liberapay': '☕ Liberapay Patrons',
      'subreddit': '👥 Subreddit Subscribers',
      'discourse': '🗨️ Discourse Users',
      'gitter': '💬 Gitter Chat',
    }
    return labels[type]
  }

  const getBadgeDescription = (type: BadgeType): string => {
    const desc: Record<BadgeType, string> = {
      'github-followers': 'Number of users following your GitHub account.',
      'github-sponsors': 'Count of sponsors supporting your work via GitHub Sponsors.',
      'github-gist': 'Stars on a specific GitHub Gist.',
      'youtube-subscribers': 'Total subscriber count for your YouTube channel.',
      'youtube-views': 'Total view count across your YouTube channel.',
      'discord': 'Member count for a Discord server (requires widget enabled).',
      'twitter': 'Follower count on X (formerly Twitter).',
      'bluesky': 'Follower count on Bluesky social network.',
      'mastodon': 'Follower count on Mastodon instance.',
      'twitch': 'Live streaming status on Twitch.',
      'reddit-karma-link': 'Karma points from submitted posts on Reddit.',
      'reddit-karma-comment': 'Karma points from comments on Reddit.',
      'reddit-karma-combined': 'Total karma (link + comment) on Reddit.',
      'stackoverflow': 'Reputation score on Stack Overflow.',
      'opencollective': 'Number of financial backers on Open Collective.',
      'liberapay': 'Number of recurring patrons on Liberapay.',
      'subreddit': 'Subscriber count for a subreddit (for moderators/owners).',
      'discourse': 'Total registered users on a Discourse forum.',
      'gitter': 'Chat room status for a Gitter community.',
    }
    return desc[type]
  }

  const renderBadgeRow = (config: BadgeConfig) => {
    const needsUsername = ['github-followers', 'github-sponsors', 'twitter', 'bluesky', 'twitch', 'reddit-karma-link', 'reddit-karma-comment', 'reddit-karma-combined', 'opencollective', 'liberapay'].includes(config.type)
    const needsChannelId = ['youtube-subscribers', 'youtube-views'].includes(config.type)
    const needsServerId = config.type === 'discord'
    const needsUserId = ['stackoverflow', 'mastodon'].includes(config.type)
    const needsDomain = config.type === 'mastodon'
    const needsGistId = config.type === 'github-gist'
    const needsSubreddit = config.type === 'subreddit'
    const needsServerUrl = config.type === 'discourse'
    const needsGitter = config.type === 'gitter'

    return (
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
        
        {config.enabled && (
          <div className={styles.badgeInputs}>
            {needsUsername && (
              <div className={styles.inlineField}>
                <label htmlFor={`${config.type}-username`}>Username</label>
                <input
                  id={`${config.type}-username`}
                  type="text"
                  placeholder="e.g. yourusername"
                  value={config.username || ''}
                  onChange={e => handleFieldChange(config.type, 'username', e.target.value)}
                />
              </div>
            )}
            
            {needsChannelId && (
              <div className={styles.inlineField}>
                <label htmlFor={`${config.type}-channelId`}>Channel ID</label>
                <input
                  id={`${config.type}-channelId`}
                  type="text"
                  placeholder="e.g. UC8butISFwT-Wl7EV0hUK0BQ"
                  value={config.channelId || ''}
                  onChange={e => handleFieldChange(config.type, 'channelId', e.target.value)}
                />
                <span className="field-hint">Find in YouTube Studio or channel URL, not @handle</span>
              </div>
            )}
            
            {needsServerId && (
              <div className={styles.inlineField}>
                <label htmlFor={`${config.type}-serverId`}>Server ID</label>
                <input
                  id={`${config.type}-serverId`}
                  type="text"
                  placeholder="e.g. 308323056592486420"
                  value={config.serverId || ''}
                  onChange={e => handleFieldChange(config.type, 'serverId', e.target.value)}
                />
                <span className="field-hint">Server widget must be enabled; ID from channel URL</span>
              </div>
            )}
            
            {needsDomain && (
              <>
                <div className={styles.inlineField}>
                  <label htmlFor={`${config.type}-domain`}>Mastodon Server</label>
                  <input
                    id={`${config.type}-domain`}
                    type="text"
                    placeholder="e.g. mastodon.social"
                    value={config.domain || ''}
                    onChange={e => handleFieldChange(config.type, 'domain', e.target.value)}
                  />
                </div>
                <div className={styles.inlineField}>
                  <label htmlFor={`${config.type}-userId`}>User ID</label>
                  <input
                    id={`${config.type}-userId`}
                    type="text"
                    placeholder="e.g. 26471"
                    value={config.userId || ''}
                    onChange={e => handleFieldChange(config.type, 'userId', e.target.value)}
                  />
                  <span className="field-hint">Find via API: https://[server]/api/v1/accounts/lookup?acct=username</span>
                </div>
              </>
            )}
            
            {needsUserId && !needsDomain && (
              <div className={styles.inlineField}>
                <label htmlFor={`${config.type}-userId`}>User ID</label>
                <input
                  id={`${config.type}-userId`}
                  type="text"
                  placeholder="e.g. 12345"
                  value={config.userId || ''}
                  onChange={e => handleFieldChange(config.type, 'userId', e.target.value)}
                />
                <span className="field-hint">From profile URL: stackoverflow.com/users/[ID]/username</span>
              </div>
            )}
            
            {needsGistId && (
              <div className={styles.inlineField}>
                <label htmlFor={`${config.type}-gistId`}>Gist ID</label>
                <input
                  id={`${config.type}-gistId`}
                  type="text"
                  placeholder="e.g. 47a4d00457a92aa426dbd48a18776322"
                  value={config.gistId || ''}
                  onChange={e => handleFieldChange(config.type, 'gistId', e.target.value)}
                />
                <span className="field-hint">From Gist URL: gist.github.com/user/[ID]</span>
              </div>
            )}
            
            {needsSubreddit && (
              <div className={styles.inlineField}>
                <label htmlFor={`${config.type}-subreddit`}>Subreddit Name</label>
                <input
                  id={`${config.type}-subreddit`}
                  type="text"
                  placeholder="e.g. programming"
                  value={config.subreddit || ''}
                  onChange={e => handleFieldChange(config.type, 'subreddit', e.target.value)}
                />
                <span className="field-hint">For moderators/owners only</span>
              </div>
            )}
            
            {needsServerUrl && (
              <div className={styles.inlineField}>
                <label htmlFor={`${config.type}-serverUrl`}>Server URL</label>
                <input
                  id={`${config.type}-serverUrl`}
                  type="text"
                  placeholder="e.g. https://meta.discourse.org"
                  value={config.serverUrl || ''}
                  onChange={e => handleFieldChange(config.type, 'serverUrl', e.target.value)}
                />
              </div>
            )}
            
            {needsGitter && (
              <>
                <div className={styles.inlineField}>
                  <label htmlFor={`${config.type}-gitterUser`}>Gitter User</label>
                  <input
                    id={`${config.type}-gitterUser`}
                    type="text"
                    placeholder="e.g. nwjs"
                    value={config.gitterUser || ''}
                    onChange={e => handleFieldChange(config.type, 'gitterUser', e.target.value)}
                  />
                </div>
                <div className={styles.inlineField}>
                  <label htmlFor={`${config.type}-gitterRepo`}>Gitter Repo</label>
                  <input
                    id={`${config.type}-gitterRepo`}
                    type="text"
                    placeholder="e.g. nw.js"
                    value={config.gitterRepo || ''}
                    onChange={e => handleFieldChange(config.type, 'gitterRepo', e.target.value)}
                  />
                </div>
              </>
            )}
            
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
          </div>
        )}
      </div>
    )
  }

  // Helper to extract image and link URLs from markdown
  const parseBadgeMarkdown = (markdown: string): { imageUrl: string; linkUrl?: string } => {
    const linkMatch = markdown.match(/^\[!\[[^\]]*\]\(([^)]+)\)\]\(([^)]+)\)$/)
    if (linkMatch) {
      return { imageUrl: linkMatch[1], linkUrl: linkMatch[2] }
    }
    const imgMatch = markdown.match(/!\[[^\]]*\]\(([^)]+)\)/)
    if (imgMatch) {
      return { imageUrl: imgMatch[1] }
    }
    return { imageUrl: '' }
  }
  
  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    
    const newOrder = [...badgeOrder]
    const draggedType = newOrder[draggedIndex]
    newOrder.splice(draggedIndex, 1)
    newOrder.splice(index, 0, draggedType)
    
    setBadgeOrder(newOrder)
    setDraggedIndex(index)
  }
  
  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <>
      <header className={styles.profileHeader}>
        <p className={styles.eyebrow}>Personal Profile</p>
        <h1>Create badges for your social presence</h1>
        <p className={styles.subtitle}>
          Generate customizable badges for social media, GitHub stats, professional platforms, and community presence.
        </p>
      </header>

      <div className={styles.profilePage}>
        <form className={styles.profileForm} onSubmit={handleGenerate}>
          <div className={styles.defaultUsernameField}>
            <label htmlFor="defaultUsername">Default username (optional)</label>
            <input
              id="defaultUsername"
              type="text"
              placeholder="e.g. yourusername"
              value={defaultUsername}
              onChange={handleDefaultUsernameChange}
              autoComplete="off"
            />
            <span className="field-hint">
              Auto-fills username fields for newly enabled badges - override per badge as needed
            </span>
          </div>

          {/* All Badges */}
          <fieldset className={styles.badgeFieldset}>
            <legend>Available Badges</legend>
            <div className={styles.fieldsetActions}>
              <button type="button" onClick={selectAll}>Select All</button>
              <button type="button" onClick={clearAll}>Clear All</button>
            </div>
            <div className={styles.badgeGrid}>
              {badgeConfigs.map(renderBadgeRow)}
            </div>
          </fieldset>

          <button type="submit" className="primary">
            Generate badges
          </button>
        </form>

        {error && <div className="form-alert error">{error}</div>}

        {badges.length > 0 && !error && (
          <section className={styles.profileOutput} aria-live="polite">
            {/* Preview */}
            <div className={styles.previewHeader}>
              <h2>Preview</h2>
              {badges.length > 1 && (
                <button
                  type="button"
                  className={styles.reorderToggle}
                  onClick={() => setShowReorderSection(!showReorderSection)}
                >
                  {showReorderSection ? '✕ Close Reorder' : '↕️ Reorder Badges'}
                </button>
              )}
            </div>
            
            {/* Reorder Section */}
            {showReorderSection && badges.length > 1 && (
              <div className={styles.reorderSection}>
                <p className={styles.reorderHint}>Drag and drop badges to reorder them</p>
                <div className={styles.reorderList}>
                  {badges.map((badge, index) => (
                    <div
                      key={badge.type}
                      className={`${styles.reorderItem} ${draggedIndex === index ? styles.dragging : ''}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <span className={styles.dragHandle}>⋮⋮</span>
                      <span className={styles.reorderLabel}>{badge.label}</span>
                      <span className={styles.reorderPosition}>#{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.previewFlat}>
              {badges.map((badge, idx) => {
                const { imageUrl, linkUrl } = parseBadgeMarkdown(badge.markdown)
                return linkUrl ? (
                  <a key={`${badge.type}-${idx}`} href={linkUrl} target="_blank" rel="noopener noreferrer">
                    <img src={imageUrl} alt={badge.label} />
                  </a>
                ) : (
                  <img key={`${badge.type}-${idx}`} src={imageUrl} alt={badge.label} />
                )
              })}
            </div>

            {/* Combined Markdown */}
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

            {/* Individual Badge Markdown Cards */}
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

export default Profile
