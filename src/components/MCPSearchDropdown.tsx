import { useState, useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import styles from './SearchDropdown.module.css'
import { searchMCPServers } from '../utils/mcpRegistryApi'
import type { MCPSearchResult } from '../utils/mcpRegistryApi'

interface MCPSearchDropdownProps {
  searchQuery: string
  onSelectServer: (server: MCPSearchResult) => void
  isVisible: boolean
  onClose: () => void
}

function MCPSearchDropdown({ searchQuery, onSelectServer, isVisible, onClose }: MCPSearchDropdownProps) {
  const [results, setResults] = useState<MCPSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Perform search when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)
      setHighlightedIndex(-1)

      try {
        const searchResults = await searchMCPServers(searchQuery, 10)
        setResults(searchResults)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to search MCP registry. Please try again.'
        setError(errorMessage)
        console.error('Search error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(performSearch, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, onClose])

  const handleSelectServer = (server: MCPSearchResult) => {
    onSelectServer(server)
    onClose()
    setResults([])
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isVisible || results.length === 0) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setHighlightedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        event.preventDefault()
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0))
        break
      case 'Enter':
        event.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelectServer(results[highlightedIndex])
        }
        break
      case 'Escape':
        event.preventDefault()
        onClose()
        break
    }
  }

  if (!isVisible) {
    return null
  }

  const showResults = !isLoading && !error && results.length > 0

  return (
    <div className={styles.searchDropdown} ref={dropdownRef} onKeyDown={handleKeyDown}>
      <div className={styles.searchResults}>
        {isLoading && (
          <div className={styles.searchLoading}>
            <div className={styles.spinner}></div>
            <span>Searching MCP registry...</span>
          </div>
        )}

        {error && <div className={styles.searchError}>{error}</div>}

        {!isLoading && !error && results.length === 0 && searchQuery.trim().length >= 2 && (
          <div className={styles.searchEmpty}>
            <div className={styles.searchEmptyIcon}>🔍</div>
            <div>No MCP servers found for "{searchQuery}"</div>
          </div>
        )}

        {showResults && (
          <ul className={styles.searchResultsList} role="listbox" aria-label="MCP server search results">
            {results.map((result, index) => (
              <li
                key={result.id}
                className={styles.searchResultItem}
                onClick={() => handleSelectServer(result)}
                onMouseEnter={() => setHighlightedIndex(index)}
                data-highlighted={highlightedIndex === index}
                role="option"
                aria-selected={highlightedIndex === index}
              >
                <div className={styles.resultHeader}>
                  <div className={styles.resultTitle}>
                    <span>{result.name}</span>
                    {result.version && (
                      <span className={styles.extensionId}>v{result.version}</span>
                    )}
                  </div>
                  {result.tags && result.tags.length > 0 && (
                    <div className={styles.resultStats}>
                      <div className={styles.installCount}>
                        <span>🏷️</span>
                        <span>{result.tags[0]}</span>
                      </div>
                    </div>
                  )}
                </div>
                {result.description && (
                  <p className={styles.resultDescription}>{result.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default MCPSearchDropdown
