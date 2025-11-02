import { useState, useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import styles from './SearchDropdown.module.css'
import { searchExtensions, formatInstallCount } from '../utils/marketplaceApi'
import type { SearchResult, SortBy } from '../utils/marketplaceApi'

interface SearchDropdownProps {
  searchQuery: string
  sortBy: SortBy
  onSelectExtension: (extensionId: string) => void
  isVisible: boolean
  onClose: () => void
}

function SearchDropdown({ searchQuery, sortBy, onSelectExtension, isVisible, onClose }: SearchDropdownProps) {
  const [results, setResults] = useState<SearchResult[]>([])
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
        const searchResults = await searchExtensions(searchQuery, 10, sortBy)
        setResults(searchResults)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to search extensions. Please try again.'
        setError(errorMessage)
        console.error('Search error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(performSearch, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, sortBy])

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

  const handleSelectExtension = (extensionId: string) => {
    onSelectExtension(extensionId)
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
          handleSelectExtension(results[highlightedIndex].extensionId)
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
            <span>Searching marketplace...</span>
          </div>
        )}

        {error && <div className={styles.searchError}>{error}</div>}

        {!isLoading && !error && results.length === 0 && searchQuery.trim().length >= 2 && (
          <div className={styles.searchEmpty}>
            <div className={styles.searchEmptyIcon}>🔍</div>
            <div>No extensions found for "{searchQuery}"</div>
          </div>
        )}

        {showResults && (
          <ul className={styles.searchResultsList} role="listbox" aria-label="Extension search results">
            {results.map((result, index) => (
              <li
                key={result.extensionId}
                className={styles.searchResultItem}
                onClick={() => handleSelectExtension(result.extensionId)}
                onMouseEnter={() => setHighlightedIndex(index)}
                data-highlighted={highlightedIndex === index}
                role="option"
                aria-selected={highlightedIndex === index}
              >
                <div className={styles.resultHeader}>
                  <div className={styles.resultTitle}>
                    <span>{result.displayName}</span>
                    <span className={styles.extensionId}>{result.extensionId}</span>
                  </div>
                  <div className={styles.resultStats}>
                    <div className={styles.installCount}>
                      <span>📥</span>
                      <span>{formatInstallCount(result.installs)}</span>
                    </div>
                  </div>
                </div>
                {result.shortDescription && (
                  <p className={styles.resultDescription}>{result.shortDescription}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default SearchDropdown
