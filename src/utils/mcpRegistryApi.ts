/**
 * MCP Registry API Client
 * Searches the official MCP Registry at registry.modelcontextprotocol.io
 */

export interface MCPServerPackage {
  type: 'npm' | 'pypi' | 'docker' | 'homebrew' | 'binary'
  location: string
  installCommand?: string
}

export interface MCPServerRuntime {
  command?: string
  args?: string[]
  env?: Record<string, string>
  type?: 'http' | 'stdio'
  url?: string
  headers?: Record<string, string>
}

export interface MCPServerMetadata {
  id: string
  name: string
  description?: string
  version?: string
  author?: string
  homepage?: string
  repository?: string
  packages?: MCPServerPackage[]
  runtime?: MCPServerRuntime
  tags?: string[]
  license?: string
}

export interface MCPSearchResult {
  id: string
  name: string
  description: string
  runtime?: MCPServerRuntime
  version?: string
  tags?: string[]
}

const API_ENDPOINT = 'https://registry.modelcontextprotocol.io/v0/servers'

/**
 * Search MCP servers in the official registry
 * @param searchText The search query (server name or keyword)
 * @param limit Maximum number of results to return
 * @returns Array of matching servers
 */
export async function searchMCPServers(
  searchText: string,
  limit: number = 10
): Promise<MCPSearchResult[]> {
  if (!searchText || searchText.trim().length === 0) {
    return []
  }

  try {
    const url = new URL(API_ENDPOINT)
    url.searchParams.set('search', searchText.trim())
    url.searchParams.set('version', 'latest')

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
    })

    if (!response.ok) {
      throw new Error(`MCP Registry API error: ${response.status}`)
    }

    const data = await response.json()

    // Parse the response and extract relevant server data
    const servers: MCPSearchResult[] = []
    const results = Array.isArray(data) ? data : data.servers || []

    for (const server of results.slice(0, limit)) {
      // Extract server information
      const id = server.id || server.name || 'unknown'
      const name = server.name || server.displayName || id
      const description = server.description || server.shortDescription || ''
      const version = server.version || server.latestVersion || ''
      const tags = server.tags || server.categories || []

      // Extract runtime configuration
      let runtime: MCPServerRuntime | undefined

      // Check for runtime configuration in various possible locations
      if (server.runtime) {
        runtime = server.runtime
      } else if (server.config) {
        runtime = server.config
      } else if (server.command || server.url) {
        runtime = {
          command: server.command,
          args: server.args,
          env: server.env,
          type: server.type,
          url: server.url,
          headers: server.headers
        }
      }

      servers.push({
        id,
        name,
        description,
        runtime,
        version,
        tags: Array.isArray(tags) ? tags : []
      })
    }

    return servers
  } catch (error) {
    console.error('Error searching MCP registry:', error)
    // Check if it's a network-related error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(
        'Unable to connect to the MCP registry. This may be due to network issues or CORS restrictions.'
      )
    }
    throw error
  }
}

/**
 * Get full details for a specific MCP server
 * @param serverId The unique identifier of the server
 * @returns Complete server metadata
 */
export async function getMCPServerDetails(
  serverId: string
): Promise<MCPServerMetadata | null> {
  try {
    const url = `${API_ENDPOINT}/${encodeURIComponent(serverId)}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`MCP Registry API error: ${response.status}`)
    }

    const data = await response.json()
    return data as MCPServerMetadata
  } catch (error) {
    console.error('Error fetching MCP server details:', error)
    return null
  }
}

/**
 * Parse MCP server runtime config into form-compatible format
 * @param runtime The runtime configuration from registry
 * @returns Parsed configuration details
 */
export function parseRuntimeConfig(runtime?: MCPServerRuntime): {
  configType: 'http' | 'npx' | 'uvx' | 'dnx' | 'docker' | 'local'
  serverUrl?: string
  npxPackage?: string
  uvxPackage?: string
  uvxFrom?: string
  dnxPackage?: string
  dockerImage?: string
  localCommand?: string
  localArgs?: string
  env?: Record<string, string>
  headers?: Record<string, string>
} | null {
  if (!runtime) {
    return null
  }

  // HTTP server
  if (runtime.type === 'http' || runtime.url) {
    return {
      configType: 'http',
      serverUrl: runtime.url || '',
      headers: runtime.headers
    }
  }

  // STDIO servers with command
  if (runtime.command) {
    const cmd = runtime.command.toLowerCase()
    const args = runtime.args || []

    // NPX
    if (cmd === 'npx') {
      return {
        configType: 'npx',
        npxPackage: args[args.indexOf('-y') + 1] || args[1] || args[0] || '',
        env: runtime.env
      }
    }

    // UVX
    if (cmd === 'uvx') {
      const fromIndex = args.indexOf('--from')
      if (fromIndex !== -1) {
        return {
          configType: 'uvx',
          uvxFrom: args[fromIndex + 1] || '',
          uvxPackage: args[fromIndex + 2] || '',
          env: runtime.env
        }
      }
      return {
        configType: 'uvx',
        uvxPackage: args[0] || '',
        env: runtime.env
      }
    }

    // DNX
    if (cmd === 'dnx') {
      return {
        configType: 'dnx',
        dnxPackage: args[0] || '',
        env: runtime.env
      }
    }

    // Docker
    if (cmd === 'docker') {
      const imageIndex = args.findIndex((arg, idx) => 
        idx > 0 && !arg.startsWith('-') && args[idx - 1] !== '-i' && args[idx - 1] !== '--rm'
      )
      return {
        configType: 'docker',
        dockerImage: imageIndex >= 0 ? args[imageIndex] : '',
        env: runtime.env
      }
    }

    // Local binary
    return {
      configType: 'local',
      localCommand: runtime.command,
      localArgs: args.join(', '),
      env: runtime.env
    }
  }

  return null
}
