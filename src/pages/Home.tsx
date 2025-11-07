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

      <footer className={`${styles.homeFooter} home-footer`}>
        <p>
          Created with <a href="https://code.visualstudio.com/" target="_blank" rel="noopener noreferrer">VS Code</a> and <a href="https://github.com/features/copilot" target="_blank" rel="noopener noreferrer">GitHub Copilot</a> • <a href="https://github.com/jamesmontemagno/mcp-badge-creator" target="_blank" rel="noopener noreferrer">View on GitHub</a>
        </p>
      </footer>
    </div>
  )
}

export default Home
