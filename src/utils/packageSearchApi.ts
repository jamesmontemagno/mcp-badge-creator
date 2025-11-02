/**
 * Package Registry Search API Client
 * Searches across multiple package registries (NPM, PyPI, NuGet, RubyGems, Crates.io)
 */

export interface PackageSearchResult {
  name: string
  description: string
  version: string
  downloads?: number
  registry: 'npm' | 'pypi' | 'nuget' | 'rubygems' | 'crates' | 'maven'
  url: string
}

export interface GroupedSearchResults {
  npm: PackageSearchResult[]
  pypi: PackageSearchResult[]
  nuget: PackageSearchResult[]
  rubygems: PackageSearchResult[]
  crates: PackageSearchResult[]
  maven: PackageSearchResult[]
}

// API Response Types
interface NPMPackageObject {
  package: {
    name: string
    description?: string
    version: string
    downloads?: number
  }
}

interface NPMSearchResponse {
  objects: NPMPackageObject[]
}

interface NuGetPackage {
  id: string
  description?: string
  version: string
  totalDownloads?: number
}

interface NuGetSearchResponse {
  data: NuGetPackage[]
}

interface RubyGem {
  name: string
  info?: string
  version: string
  downloads?: number
}

interface Crate {
  name: string
  description?: string
  max_version: string
  downloads?: number
}

interface CratesSearchResponse {
  crates: Crate[]
}

interface MavenDoc {
  g: string
  a: string
  latestVersion?: string
  v?: string
}

interface MavenSearchResponse {
  response: {
    docs: MavenDoc[]
  }
}

// Cache for search results
interface CacheEntry {
  results: GroupedSearchResults
  timestamp: number
}

const searchCache = new Map<string, CacheEntry>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCacheKey(query: string): string {
  return query.toLowerCase().trim()
}

function getCachedResults(query: string): GroupedSearchResults | null {
  const key = getCacheKey(query)
  const cached = searchCache.get(key)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.results
  }
  
  if (cached) {
    searchCache.delete(key)
  }
  
  return null
}

function setCachedResults(query: string, results: GroupedSearchResults): void {
  const key = getCacheKey(query)
  searchCache.set(key, {
    results,
    timestamp: Date.now()
  })
}

/**
 * Search NPM registry
 */
async function searchNPM(query: string, limit: number = 10): Promise<PackageSearchResult[]> {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=${limit}`,
      { mode: 'cors' }
    )
    
    if (!response.ok) {
      throw new Error(`NPM API error: ${response.status}`)
    }
    
    const data: NPMSearchResponse = await response.json()
    
    return data.objects.map((obj: NPMPackageObject) => ({
      name: obj.package.name,
      description: obj.package.description || '',
      version: obj.package.version,
      downloads: obj.package.downloads,
      registry: 'npm' as const,
      url: `https://www.npmjs.com/package/${obj.package.name}`
    }))
  } catch (error) {
    console.warn('NPM search error:', error)
    return []
  }
}

/**
 * Search PyPI registry
 * Note: PyPI doesn't have a public JSON search API, returning empty for now
 */
async function searchPyPI(): Promise<PackageSearchResult[]> {
  // PyPI doesn't have a proper JSON search API
  // Would need to parse HTML or use alternative approach
  console.warn('PyPI search not implemented - requires HTML parsing or alternative API')
  return []
}

/**
 * Search NuGet registry
 */
async function searchNuGet(query: string, limit: number = 10): Promise<PackageSearchResult[]> {
  try {
    const response = await fetch(
      `https://azuresearch-usnc.nuget.org/query?q=${encodeURIComponent(query)}&take=${limit}`,
      { mode: 'cors' }
    )
    
    if (!response.ok) {
      throw new Error(`NuGet API error: ${response.status}`)
    }
    
    const data: NuGetSearchResponse = await response.json()
    
    return data.data.map((pkg: NuGetPackage) => ({
      name: pkg.id,
      description: pkg.description || '',
      version: pkg.version,
      downloads: pkg.totalDownloads,
      registry: 'nuget' as const,
      url: `https://www.nuget.org/packages/${pkg.id}`
    }))
  } catch (error) {
    console.warn('NuGet search error:', error)
    return []
  }
}

/**
 * Search RubyGems registry
 */
async function searchRubyGems(query: string, limit: number = 10): Promise<PackageSearchResult[]> {
  try {
    const response = await fetch(
      `https://rubygems.org/api/v1/search.json?query=${encodeURIComponent(query)}`,
      { mode: 'cors' }
    )
    
    if (!response.ok) {
      throw new Error(`RubyGems API error: ${response.status}`)
    }
    
    const data: RubyGem[] = await response.json()
    
    return data.slice(0, limit).map((gem: RubyGem) => ({
      name: gem.name,
      description: gem.info || '',
      version: gem.version,
      downloads: gem.downloads,
      registry: 'rubygems' as const,
      url: `https://rubygems.org/gems/${gem.name}`
    }))
  } catch (error) {
    console.warn('RubyGems search error:', error)
    return []
  }
}

/**
 * Search Crates.io registry
 */
async function searchCrates(query: string, limit: number = 10): Promise<PackageSearchResult[]> {
  try {
    const response = await fetch(
      `https://crates.io/api/v1/crates?q=${encodeURIComponent(query)}&per_page=${limit}`,
      {
        mode: 'cors',
        headers: {
          'User-Agent': 'mcp-badge-creator'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`Crates.io API error: ${response.status}`)
    }
    
    const data: CratesSearchResponse = await response.json()
    
    return data.crates.map((crate: Crate) => ({
      name: crate.name,
      description: crate.description || '',
      version: crate.max_version,
      downloads: crate.downloads,
      registry: 'crates' as const,
      url: `https://crates.io/crates/${crate.name}`
    }))
  } catch (error) {
    console.warn('Crates.io search error:', error)
    return []
  }
}

/**
 * Search Maven Central (limited functionality)
 * Maven Central search is complex and may not work due to CORS
 */
async function searchMaven(query: string, limit: number = 10): Promise<PackageSearchResult[]> {
  try {
    const response = await fetch(
      `https://search.maven.org/solrsearch/select?q=${encodeURIComponent(query)}&rows=${limit}&wt=json`,
      { mode: 'cors' }
    )
    
    if (!response.ok) {
      throw new Error(`Maven API error: ${response.status}`)
    }
    
    const data: MavenSearchResponse = await response.json()
    
    return data.response.docs.map((doc: MavenDoc) => ({
      name: `${doc.g}:${doc.a}`,
      description: doc.a || '',
      version: doc.latestVersion || doc.v || '0.0.0',
      registry: 'maven' as const,
      url: `https://central.sonatype.com/artifact/${doc.g}/${doc.a}`
    }))
  } catch (error) {
    console.warn('Maven search error:', error)
    return []
  }
}

/**
 * Search all package registries simultaneously
 * @param query Search query
 * @param limitPerRegistry Maximum results per registry
 * @param selectedRegistries Set of registries to search
 * @returns Grouped results by registry
 */
export async function searchAllRegistries(
  query: string,
  limitPerRegistry: number = 10,
  selectedRegistries?: Set<string>
): Promise<GroupedSearchResults> {
  if (!query || query.trim().length === 0) {
    return {
      npm: [],
      pypi: [],
      nuget: [],
      rubygems: [],
      crates: [],
      maven: []
    }
  }
  
  // Check cache first
  const cacheKey = selectedRegistries 
    ? `${query}:${Array.from(selectedRegistries).sort().join(',')}`
    : query
  const cached = getCachedResults(cacheKey)
  if (cached) {
    return cached
  }
  
  // Search all registries in parallel, only if selected
  const shouldSearch = (registry: string) => !selectedRegistries || selectedRegistries.has(registry)
  
  const [npm, pypi, nuget, rubygems, crates, maven] = await Promise.all([
    shouldSearch('npm') ? searchNPM(query, limitPerRegistry) : Promise.resolve([]),
    shouldSearch('pypi') ? searchPyPI() : Promise.resolve([]),
    shouldSearch('nuget') ? searchNuGet(query, limitPerRegistry) : Promise.resolve([]),
    shouldSearch('rubygems') ? searchRubyGems(query, limitPerRegistry) : Promise.resolve([]),
    shouldSearch('crates') ? searchCrates(query, limitPerRegistry) : Promise.resolve([]),
    shouldSearch('maven') ? searchMaven(query, limitPerRegistry) : Promise.resolve([])
  ])
  
  const results = {
    npm,
    pypi,
    nuget,
    rubygems,
    crates,
    maven
  }
  
  // Cache the results
  setCachedResults(cacheKey, results)
  
  return results
}

/**
 * Format download count for display
 */
export function formatDownloadCount(count: number | undefined): string {
  if (!count) return 'N/A'
  
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

/**
 * Get registry display name
 */
export function getRegistryDisplayName(registry: string): string {
  const names: Record<string, string> = {
    npm: 'NPM',
    pypi: 'PyPI',
    nuget: 'NuGet',
    rubygems: 'RubyGems',
    crates: 'Crates.io',
    maven: 'Maven Central'
  }
  return names[registry] || registry
}
