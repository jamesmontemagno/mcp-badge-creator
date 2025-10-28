import { Link } from 'react-router-dom'
import '../App.css'

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
]

function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <p className="home-overline">Model Context Protocol Toolkit</p>
        <h1>Build beautiful badges in seconds</h1>
        <p className="home-subtitle">
          Choose a generator to craft rich badges, shareable markdown, and ready-to-run commands for your projects.
        </p>
      </section>

      <div className="home-card-grid" role="navigation" aria-label="Primary destinations">
        {navigationCards.map(card => (
          <Link
            key={card.id}
            to={card.to}
            className={`home-card ${card.className}`}
          >
            <span className="home-card-icon" aria-hidden="true">
              {card.icon}
            </span>
            <div className="home-card-content">
              <h2>{card.title}</h2>
              <p>{card.description}</p>
              <span className="card-cta">Open generator →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home
