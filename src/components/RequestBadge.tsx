import styles from './RequestBadge.module.css'

function RequestBadge() {
  return (
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
  )
}

export default RequestBadge
