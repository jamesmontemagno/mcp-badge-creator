import { useState, useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import styles from './PackageSearchDropdown.module.css'
import { 
  searchAllRegistries, 
  formatDownloadCount, 
  getRegistryDisplayName,
  type GroupedSearchResults,
  type PackageSearchResult 
} from '../utils/packageSearchApi'

interface PackageSearchDropdownProps {
  searchQuery: string
  onSelectPackage: (packageName: string, registry: string) => void
  isVisible: boolean
  onClose: () => void
}

function PackageSearchDropdown({ 
  searchQuery, 
  onSelectPackage, 
  isVisible, 
  onClose 
}: PackageSearchDropdownProps) {
  const [results, setResults] = useState<GroupedSearchResults>({
    npm: [],
    pypi: [],
    nuget: [],
    rubygems: [],
    crates: [],
    maven: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Perform search when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setResults({
          npm: [],
          pypi: [],
          nuget: [],
          rubygems: [],
          crates: [],
          maven: []
        })
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const searchResults = await searchAllRegistries(searchQuery, 10)
        setResults(searchResults)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Search failed. Please try again.'
        setError(errorMessage)
        console.error('Package search error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search by 300ms
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

  const handleSelectPackage = (pkg: PackageSearchResult) => {
    // For Maven, we need to pass the groupId:artifactId format
    const packageIdentifier = pkg.registry === 'maven' ? pkg.name : pkg.name
    onSelectPackage(packageIdentifier, pkg.registry)
    onClose()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Keyboard navigation can be enhanced if needed
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    }
  }

  if (!isVisible) {
    return null
  }

  // Count total results across all registries
  const totalResults = Object.values(results).reduce((sum, registry) => sum + registry.length, 0)
  const hasResults = totalResults > 0

  return (
    <div className={styles.searchDropdown} ref={dropdownRef} onKeyDown={handleKeyDown}>
      <div className={styles.searchResults}>
        {isLoading && (
          <div className={styles.searchLoading}>
            <div className={styles.spinner}></div>
            <span>Searching across registries...</span>
          </div>
        )}

        {error && <div className={styles.searchError}>{error}</div>}

        {!isLoading && !error && !hasResults && searchQuery.trim().length >= 2 && (
          <div className={styles.searchEmpty}>
            <div className={styles.searchEmptyIcon}>🔍</div>
            <div>No packages found for "{searchQuery}"</div>
            <div className={styles.searchHint}>Try a different search term or use manual entry</div>
          </div>
        )}

        {!isLoading && !error && hasResults && (
          <div className={styles.groupedResults}>
            {Object.entries(results).map(([registry, packages]) => {
              if (packages.length === 0) return null
              
              return (
                <div key={registry} className={styles.registryGroup}>
                  <div className={styles.registryHeader}>
                    <span className={styles.registryName}>
                      {getRegistryDisplayName(registry)}
                    </span>
                    <span className={styles.registryCount}>
                      {packages.length} {packages.length === 1 ? 'result' : 'results'}
                    </span>
                  </div>
                  <ul className={styles.packageList} role="listbox">
                    {packages.map((pkg: PackageSearchResult, index: number) => (
                      <li
                        key={`${pkg.registry}-${pkg.name}-${index}`}
                        className={styles.packageItem}
                        onClick={() => handleSelectPackage(pkg)}
                        role="option"
                      >
                        <div className={styles.packageHeader}>
                          <div className={styles.packageInfo}>
                            <span className={styles.packageName}>{pkg.name}</span>
                            <span className={styles.packageVersion}>v{pkg.version}</span>
                          </div>
                          {pkg.downloads && (
                            <div className={styles.packageStats}>
                              <span>📥</span>
                              <span>{formatDownloadCount(pkg.downloads)}</span>
                            </div>
                          )}
                        </div>
                        {pkg.description && (
                          <p className={styles.packageDescription}>{pkg.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default PackageSearchDropdown
