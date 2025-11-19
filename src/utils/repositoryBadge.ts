/**
 * Repository Badge Generation Utilities
 * Generates GitHub repository badges with customizable colors
 */

import type { BadgeTheme } from '../types/badgeTheme';

export interface BadgeConfig {
  type: 'stars' | 'forks' | 'issues' | 'license' | 'workflow' | 'contributors' | 'release' | 'language' | 'codeSize' | 'lastCommit' | 'repoSize' | 'coverage' | 'openssf';
  enabled: boolean;
  customColor: string; // hex with #
  label?: string; // custom label override
  workflowFile?: string; // for workflow badges
}

export interface RepositoryInfo {
  owner: string;
  repo: string;
}

/**
 * Parse repository input from various formats
 * Supports:
 * - https://github.com/owner/repo
 * - http://github.com/owner/repo
 * - github.com/owner/repo
 * - owner/repo
 */
export function parseRepositoryInput(input: string): RepositoryInfo | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  
  // Remove protocol and domain if present
  let path = trimmed
    .replace(/^https?:\/\//, '')
    .replace(/^github\.com\//, '');
  
  // Remove trailing slash and .git extension
  path = path.replace(/\/$/, '').replace(/\.git$/, '');
  
  // Split by slash
  const parts = path.split('/');
  
  // Must have exactly 2 parts: owner and repo
  if (parts.length !== 2) {
    return null;
  }
  
  const [owner, repo] = parts;
  
  // Validate owner and repo names (GitHub allows alphanumeric, hyphens, underscores, dots)
  const githubNameRegex = /^[a-zA-Z0-9._-]+$/;
  
  if (!owner || !repo || !githubNameRegex.test(owner) || !githubNameRegex.test(repo)) {
    return null;
  }
  
  return { owner, repo };
}

/**
 * Validate workflow filename
 * Must end with .yml or .yaml
 */
export function validateWorkflowFilename(filename: string): boolean {
  if (!filename || typeof filename !== 'string') {
    return false;
  }
  
  const trimmed = filename.trim();
  return trimmed.endsWith('.yml') || trimmed.endsWith('.yaml');
}

/**
 * Get semantic default color for badge type (without #)
 */
export function getSemanticDefaultColor(type: BadgeConfig['type']): string {
  const colors: Record<BadgeConfig['type'], string> = {
    workflow: '2ea44f',      // Green - CI/CD success
    stars: '0969da',         // Blue - popularity
    forks: '0969da',         // Blue - engagement
    license: 'dfb317',       // Yellow - legal info
    issues: 'ff6f00',        // Orange - attention needed
    contributors: '8957e5',  // Purple - community
    release: '8957e5',       // Purple - version info
    language: '6e7681',      // Gray - metadata
    codeSize: '6e7681',      // Gray - metadata
    lastCommit: '6e7681',    // Gray - metadata
    repoSize: '6e7681',      // Gray - metadata
    coverage: '2ea44f',      // Green - quality
    openssf: '0969da',       // Blue - security posture
  };
  
  return colors[type];
}

/**
 * Generate Shields.io badge markdown for repository badges
 */
export function generateRepositoryBadges(
  repoInfo: RepositoryInfo,
  configs: BadgeConfig[],
  branch: string = 'main',
  theme?: BadgeTheme
): { type: string; markdown: string; label: string }[] {
  const { owner, repo } = repoInfo;
  const badges: { type: string; markdown: string; label: string }[] = [];
  const style = theme?.style || 'flat-square';
  
  for (const config of configs) {
    if (!config.enabled) {
      continue;
    }
    
    // Strip # from color
    const color = config.customColor.replace('#', '');
    
    let badgeUrl = '';
    let altText = '';
    let label = config.label || '';
    let linkHref = '';
    
    switch (config.type) {
      case 'stars':
        // Bare stars badge (no style/color/logo)
        badgeUrl = `https://img.shields.io/github/stars/${owner}/${repo}?style=${style}`;
        altText = 'GitHub stars';
        label = label || 'Stars';
        linkHref = `https://github.com/${owner}/${repo}/stargazers`;
        break;
        
      case 'forks':
        badgeUrl = `https://img.shields.io/github/forks/${owner}/${repo}?style=${style}&color=${color}&logo=github`;
        altText = 'GitHub Forks';
        label = label || 'Forks';
        linkHref = `https://github.com/${owner}/${repo}/forks`;
        break;
        
      case 'issues':
        badgeUrl = `https://img.shields.io/github/issues/${owner}/${repo}?style=${style}&color=${color}&logo=github`;
        altText = 'GitHub Issues';
        label = label || 'Issues';
        linkHref = `https://github.com/${owner}/${repo}/issues`;
        break;
        
      case 'license':
        badgeUrl = `https://img.shields.io/github/license/${owner}/${repo}?style=${style}&color=${color}`;
        altText = 'License';
        label = label || 'License';
        linkHref = `https://github.com/${owner}/${repo}/tree/${branch}/LICENSE`;
        break;
        
      case 'workflow':
        if (!config.workflowFile || !validateWorkflowFilename(config.workflowFile)) {
          continue; // Skip invalid workflow badges
        }
        badgeUrl = `https://img.shields.io/github/actions/workflow/status/${owner}/${repo}/${config.workflowFile}?style=${style}&color=${color}&logo=github`;
        altText = `Workflow Status - ${config.workflowFile}`;
        label = label || config.workflowFile.replace(/\.(yml|yaml)$/, '');
        linkHref = `https://github.com/${owner}/${repo}/actions/workflows/${config.workflowFile}`;
        break;
        
      case 'contributors':
        badgeUrl = `https://img.shields.io/github/contributors/${owner}/${repo}?style=${style}&color=${color}&logo=github`;
        altText = 'Contributors';
        label = label || 'Contributors';
        linkHref = `https://github.com/${owner}/${repo}/graphs/contributors`;
        break;
        
      case 'release':
        badgeUrl = `https://img.shields.io/github/v/release/${owner}/${repo}?style=${style}&color=${color}&logo=github`;
        altText = 'Latest Release';
        label = label || 'Release';
        linkHref = `https://github.com/${owner}/${repo}/releases/latest`;
        break;
        
      case 'language':
        badgeUrl = `https://img.shields.io/github/languages/top/${owner}/${repo}?style=${style}&color=${color}`;
        altText = 'Top Language';
        label = label || 'Language';
        linkHref = `https://github.com/${owner}/${repo}/languages`;
        break;
        
      case 'codeSize':
        badgeUrl = `https://img.shields.io/github/languages/code-size/${owner}/${repo}?style=${style}&color=${color}`;
        altText = 'Code Size';
        label = label || 'Code Size';
        linkHref = `https://github.com/${owner}/${repo}`;
        break;
        
      case 'lastCommit':
        badgeUrl = `https://img.shields.io/github/last-commit/${owner}/${repo}?style=${style}&color=${color}&logo=github`;
        altText = 'Last Commit';
        label = label || 'Last Commit';
        linkHref = `https://github.com/${owner}/${repo}/commits/${branch}`;
        break;
        
      case 'repoSize':
        badgeUrl = `https://img.shields.io/github/repo-size/${owner}/${repo}?style=${style}&color=${color}`;
        altText = 'Repository Size';
        label = label || 'Repo Size';
        linkHref = `https://github.com/${owner}/${repo}`;
        break;
      case 'coverage':
        // Codecov coverage badge
        badgeUrl = `https://img.shields.io/codecov/c/github/${owner}/${repo}?style=${style}&color=${color}&logo=codecov`;
        altText = 'Coverage';
        label = label || 'Coverage';
        linkHref = `https://codecov.io/gh/${owner}/${repo}`;
        break;
      case 'openssf':
        badgeUrl = `https://img.shields.io/ossf-scorecard/github.com/${owner}/${repo}?style=${style}&color=${color}&label=OpenSSF%20Scorecard&logo=openssf`;
        altText = 'OpenSSF Scorecard';
        label = label || 'OpenSSF';
        linkHref = `https://securityscorecards.dev/viewer/?uri=github.com/${owner}/${repo}`;
        break;
    }
    
    if (badgeUrl) {
      const markdown = linkHref
        ? `[![${altText}](${badgeUrl})](${linkHref})`
        : `![${altText}](${badgeUrl})`;
      badges.push({ type: config.type, markdown, label });
    }
  }
  
  return badges;
}
