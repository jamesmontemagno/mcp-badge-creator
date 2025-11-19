/**
 * MCP Badge Generator Utilities
 * 
 * This module contains pure functions for generating MCP badge URLs,
 * CLI commands, and configuration objects. These functions are extracted
 * for testability and reusability.
 */

import type { BadgeTheme } from '../types/badgeTheme';

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
 * Generates the badge URL with theming support
 */
function generateBadgeUrl(
  badgeText: string,
  platform: string,
  color: string,
  style: string = 'flat-square',
  logo?: string,
  logoColor?: string
): string {
  const customBadgeText = badgeText.replace(/\s/g, '_');
  const platformText = platform.replace(/\s/g, '_');
  
  let badgeUrl = `https://img.shields.io/badge/${customBadgeText}-${platformText}-${color}?style=${style}`;
  
  if (logo) {
    badgeUrl += `&logo=${logo}`;
  }
  
  if (logoColor) {
    badgeUrl += `&logoColor=${logoColor}`;
  }
  
  return badgeUrl;
}

/**
 * Generates a VS Code badge markdown
 */
export function generateVSCodeBadge(
  serverName: string,
  config: MCPConfig | ConfigWithInputs,
  badgeText: string = 'Install in',
  theme?: BadgeTheme
): string {
  const encodedConfig = encodeConfig(config);
  const vscodeUrl = `https://vscode.dev/redirect/mcp/install?name=${encodeURIComponent(serverName)}&config=${encodedConfig}`;
  
  const color = theme?.customColors?.vscode || '0098FF';
  const style = theme?.style || 'flat-square';
  const logo = theme?.showLogo !== false ? 'visualstudiocode' : undefined;
  const logoColor = theme?.logoColor || 'white';
  
  const badgeUrl = generateBadgeUrl(badgeText, 'VS_Code', color, style, logo, logoColor);
  
  return `[![Install in VS Code](${badgeUrl})](${vscodeUrl})`;
}

/**
 * Generates a VS Code Insiders badge markdown
 */
export function generateVSCodeInsidersBadge(
  serverName: string,
  config: MCPConfig | ConfigWithInputs,
  badgeText: string = 'Install in',
  theme?: BadgeTheme
): string {
  const encodedConfig = encodeConfig(config);
  const vscodeInsidersUrl = `https://insiders.vscode.dev/redirect/mcp/install?name=${encodeURIComponent(serverName)}&config=${encodedConfig}&quality=insiders`;
  
  const color = theme?.customColors?.vscodeInsiders || '24bfa5';
  const style = theme?.style || 'flat-square';
  const logo = theme?.showLogo !== false ? 'visualstudiocode' : undefined;
  const logoColor = theme?.logoColor || 'white';
  
  const badgeUrl = generateBadgeUrl(badgeText, 'VS_Code_Insiders', color, style, logo, logoColor);
  
  return `[![Install in VS Code Insiders](${badgeUrl})](${vscodeInsidersUrl})`;
}

/**
 * Generates a Visual Studio badge markdown
 * Note: Visual Studio's mcp-install URL doesn't include the server name parameter
 */
export function generateVisualStudioBadge(
  _serverName: string, // Prefixed with _ to indicate intentionally unused
  config: MCPConfig | ConfigWithInputs,
  badgeText: string = 'Install in',
  theme?: BadgeTheme
): string {
  const encodedConfig = encodeConfig(config);
  const vsUrl = `https://vs-open.link/mcp-install?${encodedConfig}`;
  
  const color = theme?.customColors?.visualStudio || 'C16FDE';
  const style = theme?.style || 'flat-square';
  const logo = theme?.showLogo !== false ? 'visualstudio' : undefined;
  const logoColor = theme?.logoColor || 'white';
  
  const badgeUrl = generateBadgeUrl(badgeText, 'Visual_Studio', color, style, logo, logoColor);
  
  return `[![Install in Visual Studio](${badgeUrl})](${vsUrl})`;
}

/**
 * Generates a Cursor badge markdown
 */
export function generateCursorBadge(
  serverName: string,
  config: ConfigWithInputs,
  badgeText: string = 'Install in',
  theme?: BadgeTheme
): string {
  const base64Config = btoa(JSON.stringify(config));
  const cursorUrl = `https://cursor.com/en/install-mcp?name=${encodeURIComponent(serverName)}&config=${base64Config}`;
  
  const color = theme?.customColors?.cursor || '000000';
  const style = theme?.style || 'flat-square';
  const logo = theme?.showLogo !== false ? undefined : undefined; // Cursor doesn't have a standard logo in shields.io
  const logoColor = theme?.logoColor || 'white';
  
  const badgeUrl = generateBadgeUrl(badgeText, 'Cursor', color, style, logo, logoColor);
  
  return `[![Install in Cursor](${badgeUrl})](${cursorUrl})`;
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
  theme?: BadgeTheme;
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
    badgeText = 'Install in',
    theme
  } = options;
  
  const badges: string[] = [];
  
  if (includeVSCode) {
    badges.push(generateVSCodeBadge(serverName, config, badgeText, theme));
  }
  
  if (includeVSCodeInsiders) {
    badges.push(generateVSCodeInsidersBadge(serverName, config, badgeText, theme));
  }
  
  if (includeVisualStudio) {
    badges.push(generateVisualStudioBadge(serverName, config, badgeText, theme));
  }
  
  if (includeCursor) {
    badges.push(generateCursorBadge(serverName, config, badgeText, theme));
  }
  
  return badges.join('\n');
}
