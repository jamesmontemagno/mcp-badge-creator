import { Link } from 'react-router-dom'
import styles from './Home.module.css'
import cardStyles from '../styles/components/Card.module.css'

const navigationCards = [
  {
    id: 'mcp',
    title: 'MCP Badges',
    description: 'Generate install badges, README snippets, and CLI commands for MCP servers.',
    to: '/mcp',
    icon: '🛠️',
    className: 'card-mcp',
  },
  {
    id: 'extensions',
    title: 'VS Code Extensions',
    description: 'Create marketplace-ready badges for VS Code and VS Code Insiders extensions.',
    to: '/extensions',
    icon: '🧩',
    className: 'card-extensions',
  },
  {
    id: 'packages',
    title: 'Package Badges',
    description: 'Generate version and download badges for NPM, NuGet, PyPI, Maven, RubyGems, and Crates.io packages.',
    to: '/packages',
    icon: '📦',
    className: 'card-packages',
  },
  {
    id: 'repository',
    title: 'Repository Badges',
    description: 'Create GitHub repository badges for stars, workflows, contributors, and more with customizable colors.',
    to: '/repository',
    icon: '⭐',
    className: 'card-repository',
  },
  {
    id: 'profile',
    title: 'Profile Badges',
    description: 'Generate badges for social media, GitHub stats, professional platforms, and community presence.',
    to: '/profile',
    icon: '👤',
    className: 'card-profile',
  },
]

function Home() {
  return (
    <div className={`${styles.homePage} home-page`}>
      <section className={`${styles.homeHero} home-hero`}>
        <p className={`${styles.homeOverline} home-overline`}>Badge Toolkit</p>
        <h1>Build beautiful badges in seconds</h1>
        <p className={`${styles.homeSubtitle} home-subtitle`}>
          Choose a generator to craft rich badges, shareable markdown, and ready-to-run commands for your projects.
        </p>
      </section>

      <div className={`${styles.homeCardGrid} home-card-grid`} role="navigation" aria-label="Primary destinations">
        {navigationCards.map(card => {
          const variantClass =
            card.className === 'card-mcp'
              ? styles.cardMcp
              : card.className === 'card-extensions'
              ? styles.cardExtensions
              : card.className === 'card-packages'
              ? styles.cardPackages
              : card.className === 'card-repository'
              ? styles.cardRepository
              : card.className === 'card-profile'
              ? styles.cardProfile
              : ''
          return (
            <Link
              key={card.id}
              to={card.to}
              className={`${cardStyles.card} ${cardStyles.cardHover} ${styles.homeCard} home-card ${variantClass} ${card.className}`}
            >
              <span className={`${styles.homeCardIcon} home-card-icon`} aria-hidden="true">
                {card.icon}
              </span>
              <div className={`${styles.homeCardContent} home-card-content`}>
                <h2>{card.title}</h2>
                <p>{card.description}</p>
                <span className={`${styles.cardCta} card-cta`}>Open generator →</span>
              </div>
            </Link>
          )
        })}
      </div>

      <section className={styles.homeBadges} aria-labelledby="project-badges-heading">
        <h2 id="project-badges-heading" className={styles.homeBadgesHeader}>Project Badges</h2>
        <div className={styles.homeBadgesGrid} role="list" aria-label="Repository status badges">
          <a href="https://github.com/jamesmontemagno/mcp-badge-creator/stargazers" target="_blank" rel="noopener noreferrer" role="listitem">
            <img src="https://img.shields.io/github/stars/jamesmontemagno/mcp-badge-creator" alt="GitHub stars" loading="lazy" />
          </a>
          <a href="https://github.com/jamesmontemagno/mcp-badge-creator/actions/workflows/deploy.yml" target="_blank" rel="noopener noreferrer" role="listitem">
            <img src="https://img.shields.io/github/actions/workflow/status/jamesmontemagno/mcp-badge-creator/deploy.yml?label=deploy" alt="Deploy workflow status" loading="lazy" />
          </a>
          <a href="https://github.com/jamesmontemagno/mcp-badge-creator/commits" target="_blank" rel="noopener noreferrer" role="listitem">
            <img src="https://img.shields.io/github/last-commit/jamesmontemagno/mcp-badge-creator" alt="Last commit" loading="lazy" />
          </a>
          <a href="https://github.com/jamesmontemagno/mcp-badge-creator/issues" target="_blank" rel="noopener noreferrer" role="listitem">
            <img src="https://img.shields.io/github/issues/jamesmontemagno/mcp-badge-creator" alt="Open issues" loading="lazy" />
          </a>
          <a href="https://github.com/jamesmontemagno/mcp-badge-creator/tree/main/LICENSE" target="_blank" rel="noopener noreferrer" role="listitem">
            <img src="https://img.shields.io/github/license/jamesmontemagno/mcp-badge-creator" alt="License" loading="lazy" />
          </a>
          <a href="https://github.com/jamesmontemagno/mcp-badge-creator" target="_blank" rel="noopener noreferrer" role="listitem">
            <img src="https://img.shields.io/badge/built_with-Vite_+_React-646CFF?logo=vite&logoColor=white" alt="Built with Vite and React" loading="lazy" />
          </a>
        </div>
      </section>

      <footer className={`${styles.homeFooter} home-footer`}>
        <p>
          Created with <a href="https://code.visualstudio.com/" target="_blank" rel="noopener noreferrer">VS Code</a> and <a href="https://github.com/features/copilot" target="_blank" rel="noopener noreferrer">GitHub Copilot</a> • Badges powered by <a href="https://shields.io/" target="_blank" rel="noopener noreferrer">Shields.io</a> • <a href="https://github.com/jamesmontemagno/mcp-badge-creator" target="_blank" rel="noopener noreferrer">View on GitHub</a>
        </p>
      </footer>
    </div>
  )
}

export default Home
