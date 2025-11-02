/**
 * VS Code Marketplace API Client
 * Uses the unofficial marketplace API to search for extensions
 */

export interface MarketplaceExtension {
  extensionId: string
  displayName: string
  shortDescription: string
  publisher: {
    displayName: string
    publisherName: string
  }
  versions: Array<{
    version: string
  }>
  statistics: Array<{
    statisticName: string
    value: number
  }>
}

export interface SearchResult {
  extensionId: string
  displayName: string
  publisherName: string
  publisherDisplayName: string
  shortDescription: string
  installs: number
}

export type SortBy = 'installs' | 'relevance' | 'name' | 'publishedDate' | 'rating'

const API_ENDPOINT = 'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery'

/**
 * Search extensions in the VS Code Marketplace
 * @param searchText The search query (extension name or keyword)
 * @param pageSize Maximum number of results to return
 * @param sortBy How to sort the results
 * @returns Array of matching extensions
 */
export async function searchExtensions(
  searchText: string,
  pageSize: number = 10,
  sortBy: SortBy = 'installs'
): Promise<SearchResult[]> {
  if (!searchText || searchText.trim().length === 0) {
    return []
  }

  // Map sort options to API values
  // sortBy values: 0 = None, 4 = InstallCount, 5 = PublishedDate, 6 = Name, 12 = WeightedRating
  const sortByMap: Record<SortBy, number> = {
    installs: 4,       // Sort by download count
    relevance: 0,      // Default relevance
    name: 6,           // Alphabetical by name
    publishedDate: 5,  // Most recently published
    rating: 12,        // Highest rated
  }

  const payload = {
    filters: [
      {
        criteria: [
          {
            filterType: 10, // Search text filter
            value: searchText.trim(),
          },
          {
            filterType: 8, // Target platform
            value: 'Microsoft.VisualStudio.Code',
          },
        ],
        pageNumber: 1,
        pageSize,
        sortBy: sortByMap[sortBy],
        sortOrder: 2, // Descending
      },
    ],
    assetTypes: [],
    flags: 914, // Flags to include metadata like install count
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json;api-version=7.2-preview.1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      mode: 'cors',
    })

    if (!response.ok) {
      throw new Error(`Marketplace API error: ${response.status}`)
    }

    const data = await response.json()

    // Parse the response and extract relevant extension data
    const extensions: SearchResult[] = []
    const results = data.results?.[0]?.extensions || []

    for (const ext of results) {
      const publisher = ext.publisher?.publisherName || ''
      const extensionName = ext.extensionName || ''
      const extensionId = `${publisher}.${extensionName}`

      // Get install count from statistics
      const installCount =
        ext.statistics?.find(
          (stat: { statisticName: string; value: number }) =>
            stat.statisticName === 'install'
        )?.value || 0

      extensions.push({
        extensionId,
        displayName: ext.displayName || extensionName,
        publisherName: publisher,
        publisherDisplayName: ext.publisher?.displayName || publisher,
        shortDescription: ext.shortDescription || '',
        installs: installCount,
      })
    }

    return extensions
  } catch (error) {
    console.error('Error searching marketplace:', error)
    // Check if it's a network-related error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(
        'Unable to connect to the marketplace. This may be due to network issues or CORS restrictions.'
      )
    }
    throw error
  }
}

/**
 * Format install count for display
 * @param count Number of installs
 * @returns Formatted string (e.g., "1.2M", "45K")
 */
export function formatInstallCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}
