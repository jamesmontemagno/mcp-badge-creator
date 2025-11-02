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

    for (const item of results.slice(0, limit)) {
      // Handle the actual API response structure: { server: {...}, _meta: {...} }
      const serverData = item.server || item
      
      // Extract server information
      const id = serverData.name || serverData.id || 'unknown'
      const name = serverData.name || serverData.displayName || id
      const description = serverData.description || serverData.shortDescription || ''
      const version = serverData.version || serverData.latestVersion || ''
      const tags = serverData.tags || serverData.categories || []

      // Extract runtime configuration from packages or remotes
      let runtime: MCPServerRuntime | undefined

      // Check for packages array (primary source for runtime config)
      if (serverData.packages && Array.isArray(serverData.packages) && serverData.packages.length > 0) {
        const pkg = serverData.packages[0]
        
        // Parse package-based configuration
        if (pkg.registryType === 'npm') {
          runtime = {
            command: 'npx',
            args: ['-y', pkg.identifier],
            type: 'stdio'
          }
        } else if (pkg.registryType === 'pypi') {
          runtime = {
            command: 'uvx',
            args: [pkg.identifier],
            type: 'stdio'
          }
        } else if (pkg.registryType === 'oci') {
          // OCI means Docker container
          // Parse runtime arguments if available
          const dockerArgs = ['run', '-i', '--rm']
          const env: Record<string, string> = {}
          
          if (pkg.runtimeArguments && Array.isArray(pkg.runtimeArguments)) {
            for (const arg of pkg.runtimeArguments) {
              if (arg.type === 'named' && arg.name === '-e') {
                // Extract environment variable
                const envValue = arg.value || ''
                const match = envValue.match(/^([^=]+)=(.*)$/)
                if (match) {
                  const [, key, value] = match
                  // Check if this is a secret/password variable
                  if (arg.variables && Object.keys(arg.variables).length > 0) {
                    const varName = Object.keys(arg.variables)[0]
                    const varConfig = arg.variables[varName]
                    if (varConfig.isSecret) {
                      env[key] = `\${${varName}}`
                    } else {
                      env[key] = value
                    }
                  } else {
                    env[key] = value
                  }
                }
              }
            }
          }
          
          runtime = {
            command: 'docker',
            args: [...dockerArgs, pkg.identifier],
            env: Object.keys(env).length > 0 ? env : undefined,
            type: 'stdio'
          }
        }
      } 
      // Check for remotes array (HTTP servers)
      else if (serverData.remotes && Array.isArray(serverData.remotes) && serverData.remotes.length > 0) {
        const remote = serverData.remotes[0]
        
        // Parse remote configuration
        if (remote.type === 'streamable-http' || remote.type === 'http' || remote.type === 'sse') {
          runtime = {
            type: 'http',
            url: remote.url,
            headers: remote.headers ? Object.fromEntries(
              remote.headers.map((h: { name: string; value?: string }) => [h.name, h.value || ''])
            ) : undefined
          }
        }
      } 
      // Fallback to legacy formats
      else if (serverData.runtime) {
        runtime = serverData.runtime
      } else if (serverData.config) {
        runtime = serverData.config
      } else if (serverData.command || serverData.url) {
        runtime = {
          command: serverData.command,
          args: serverData.args,
          env: serverData.env,
          type: serverData.type,
          url: serverData.url,
          headers: serverData.headers
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
      // Find the image argument (last positional arg after flags)
      const imageIndex = args.findIndex((arg, idx) => 
        idx > 0 && !arg.startsWith('-') && args[idx - 1] !== '-i' && args[idx - 1] !== '--rm' && args[idx - 1] !== '-e'
      )
      
      // If not found by position, look for the last non-flag argument
      const dockerImage = imageIndex >= 0 
        ? args[imageIndex]
        : args.filter(arg => !arg.startsWith('-')).pop() || ''
      
      return {
        configType: 'docker',
        dockerImage,
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
