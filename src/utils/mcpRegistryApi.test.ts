import { describe, expect, it } from 'vitest'
import { parseRuntimeConfig, type MCPServerRuntime } from './mcpRegistryApi'

describe('parseRuntimeConfig', () => {
  it('preserves additional HTTP root runtime properties', () => {
    const runtime: MCPServerRuntime = {
      type: 'http',
      url: 'https://mcp.slack.com/mcp',
      oauthClientId: '12348411142.11062036567072',
      oauthPublicClient: true
    }

    const parsed = parseRuntimeConfig(runtime)

    expect(parsed).toBeTruthy()
    expect(parsed?.configType).toBe('http')
    expect(parsed?.additionalRootProps).toEqual({
      oauthClientId: '12348411142.11062036567072',
      oauthPublicClient: true
    })
  })

  it('preserves additional stdio root runtime properties', () => {
    const runtime: MCPServerRuntime = {
      command: 'npx',
      args: ['-y', '@scope/server'],
      env: {},
      startupTimeoutMs: 15000
    }

    const parsed = parseRuntimeConfig(runtime)

    expect(parsed).toBeTruthy()
    expect(parsed?.configType).toBe('npx')
    expect(parsed?.additionalRootProps).toEqual({
      startupTimeoutMs: 15000
    })
  })
})
