/**
 * MCP Badge Generator Utilities
 * 
 * This module contains pure functions for generating MCP badge URLs,
 * CLI commands, and configuration objects. These functions are extracted
 * for testability and reusability.
 */

export type ConfigType = 'http' | 'docker' | 'local' | 'npx' | 'uvx' | 'dnx';

export interface MCPConfig {
  name?: string;
  type?: string;
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  headers?: Record<string, string>;
}

export interface MCPInput {
  type: 'promptString';
  id: string;
  description: string;
  password?: boolean;
}

export interface FullMCPConfig {
  inputs?: MCPInput[];
  servers: {
    [key: string]: Omit<MCPConfig, 'name'>;
  };
}

export interface ConfigWithInputs extends MCPConfig {
  inputs?: MCPInput[];
}

/**
 * Encodes a config object for use in URL parameters
 */
export function encodeConfig(config: MCPConfig | ConfigWithInputs): string {
  return encodeURIComponent(JSON.stringify(config));
}

/**
 * Generates a VS Code badge markdown
 */
export function generateVSCodeBadge(
  serverName: string,
  config: MCPConfig | ConfigWithInputs,
  badgeText: string = 'Install in'
): string {
  const encodedConfig = encodeConfig(config);
  const vscodeUrl = `https://vscode.dev/redirect/mcp/install?name=${encodeURIComponent(serverName)}&config=${encodedConfig}`;
  const customBadgeText = badgeText.replace(/\s/g, '_');
  return `[![Install in VS Code](https://img.shields.io/badge/${customBadgeText}-VS_Code-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](${vscodeUrl})`;
}

/**
 * Generates a VS Code Insiders badge markdown
 */
export function generateVSCodeInsidersBadge(
  serverName: string,
  config: MCPConfig | ConfigWithInputs,
  badgeText: string = 'Install in'
): string {
  const encodedConfig = encodeConfig(config);
  const vscodeInsidersUrl = `https://insiders.vscode.dev/redirect/mcp/install?name=${encodeURIComponent(serverName)}&config=${encodedConfig}&quality=insiders`;
  const customBadgeText = badgeText.replace(/\s/g, '_');
  return `[![Install in VS Code Insiders](https://img.shields.io/badge/${customBadgeText}-VS_Code_Insiders-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](${vscodeInsidersUrl})`;
}

/**
 * Generates a Visual Studio badge markdown
 * Note: Visual Studio's mcp-install URL doesn't include the server name parameter
 */
export function generateVisualStudioBadge(
  _serverName: string, // Prefixed with _ to indicate intentionally unused
  config: MCPConfig | ConfigWithInputs,
  badgeText: string = 'Install in'
): string {
  const encodedConfig = encodeConfig(config);
  const vsUrl = `https://vs-open.link/mcp-install?${encodedConfig}`;
  const customBadgeText = badgeText.replace(/\s/g, '_');
  return `[![Install in Visual Studio](https://img.shields.io/badge/${customBadgeText}-Visual_Studio-C16FDE?style=flat-square&logo=visualstudio&logoColor=white)](${vsUrl})`;
}

/**
 * Generates a Cursor badge markdown
 */
export function generateCursorBadge(
  serverName: string,
  config: ConfigWithInputs,
  badgeText: string = 'Install in'
): string {
  const base64Config = btoa(JSON.stringify(config));
  const cursorUrl = `https://cursor.com/en/install-mcp?name=${encodeURIComponent(serverName)}&config=${base64Config}`;
  const customBadgeText = badgeText.replace(/\s/g, '_');
  return `[![Install in Cursor](https://img.shields.io/badge/${customBadgeText}-Cursor-000000?style=flat-square&logoColor=white)](${cursorUrl})`;
}

/**
 * Generates a VS Code CLI command
 */
export function generateVSCodeCLICommand(
  serverName: string,
  config: ConfigWithInputs,
  isInsiders: boolean = false
): string {
  const cliConfig = {
    name: serverName,
    ...config
  };
  
  const jsonString = JSON.stringify(cliConfig);
  const escapedJson = jsonString.replace(/"/g, '\\"');
  const command = isInsiders ? 'code-insiders' : 'code';
  return `${command} --add-mcp '${escapedJson}'`;
}

/**
 * Merges a config with inputs array if inputs exist
 */
export function mergeConfigWithInputs(
  config: MCPConfig,
  inputs?: MCPInput[]
): ConfigWithInputs {
  if (inputs && inputs.length > 0) {
    return {
      ...config,
      inputs
    };
  }
  return config;
}

/**
 * Creates a full MCP configuration with servers and inputs
 */
export function createFullMCPConfig(
  serverName: string,
  config: MCPConfig,
  inputs?: MCPInput[]
): FullMCPConfig {
  const fullConfig: FullMCPConfig = {
    servers: {
      [serverName]: config
    }
  };
  
  if (inputs && inputs.length > 0) {
    fullConfig.inputs = inputs;
  }
  
  return fullConfig;
}

/**
 * Generates all badge markdown for enabled platforms
 */
export interface BadgeOptions {
  includeVSCode?: boolean;
  includeVSCodeInsiders?: boolean;
  includeVisualStudio?: boolean;
  includeCursor?: boolean;
  badgeText?: string;
}

export function generateAllBadges(
  serverName: string,
  config: ConfigWithInputs,
  options: BadgeOptions = {}
): string {
  const {
    includeVSCode = true,
    includeVSCodeInsiders = true,
    includeVisualStudio = true,
    includeCursor = false,
    badgeText = 'Install in'
  } = options;
  
  const badges: string[] = [];
  
  if (includeVSCode) {
    badges.push(generateVSCodeBadge(serverName, config, badgeText));
  }
  
  if (includeVSCodeInsiders) {
    badges.push(generateVSCodeInsidersBadge(serverName, config, badgeText));
  }
  
  if (includeVisualStudio) {
    badges.push(generateVisualStudioBadge(serverName, config, badgeText));
  }
  
  if (includeCursor) {
    badges.push(generateCursorBadge(serverName, config, badgeText));
  }
  
  return badges.join('\n');
}
