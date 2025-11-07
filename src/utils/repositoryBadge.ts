/**
 * Repository Badge Generation Utilities
 * Generates GitHub repository badges with customizable colors
 */

export interface BadgeConfig {
  type: 'stars' | 'forks' | 'issues' | 'license' | 'workflow' | 'contributors' | 'release' | 'language' | 'codeSize' | 'lastCommit' | 'repoSize';
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
  };
  
  return colors[type];
}

/**
 * Generate Shields.io badge markdown for repository badges
 */
export function generateRepositoryBadges(
  repoInfo: RepositoryInfo,
  configs: BadgeConfig[]
): { type: string; markdown: string; label: string }[] {
  const { owner, repo } = repoInfo;
  const badges: { type: string; markdown: string; label: string }[] = [];
  
  for (const config of configs) {
    if (!config.enabled) {
      continue;
    }
    
    // Strip # from color
    const color = config.customColor.replace('#', '');
    
    let badgeUrl = '';
    let altText = '';
    let label = config.label || '';
    
    switch (config.type) {
      case 'stars':
        badgeUrl = `https://img.shields.io/github/stars/${owner}/${repo}?style=flat-square&color=${color}&logo=github`;
        altText = 'GitHub Stars';
        label = label || 'Stars';
        break;
        
      case 'forks':
        badgeUrl = `https://img.shields.io/github/forks/${owner}/${repo}?style=flat-square&color=${color}&logo=github`;
        altText = 'GitHub Forks';
        label = label || 'Forks';
        break;
        
      case 'issues':
        badgeUrl = `https://img.shields.io/github/issues/${owner}/${repo}?style=flat-square&color=${color}&logo=github`;
        altText = 'GitHub Issues';
        label = label || 'Issues';
        break;
        
      case 'license':
        badgeUrl = `https://img.shields.io/github/license/${owner}/${repo}?style=flat-square&color=${color}`;
        altText = 'License';
        label = label || 'License';
        break;
        
      case 'workflow':
        if (!config.workflowFile || !validateWorkflowFilename(config.workflowFile)) {
          continue; // Skip invalid workflow badges
        }
        badgeUrl = `https://img.shields.io/github/actions/workflow/status/${owner}/${repo}/${config.workflowFile}?style=flat-square&color=${color}&logo=github`;
        altText = `Workflow Status - ${config.workflowFile}`;
        label = label || config.workflowFile.replace(/\.(yml|yaml)$/, '');
        break;
        
      case 'contributors':
        badgeUrl = `https://img.shields.io/github/contributors/${owner}/${repo}?style=flat-square&color=${color}&logo=github`;
        altText = 'Contributors';
        label = label || 'Contributors';
        break;
        
      case 'release':
        badgeUrl = `https://img.shields.io/github/v/release/${owner}/${repo}?style=flat-square&color=${color}&logo=github`;
        altText = 'Latest Release';
        label = label || 'Release';
        break;
        
      case 'language':
        badgeUrl = `https://img.shields.io/github/languages/top/${owner}/${repo}?style=flat-square&color=${color}`;
        altText = 'Top Language';
        label = label || 'Language';
        break;
        
      case 'codeSize':
        badgeUrl = `https://img.shields.io/github/languages/code-size/${owner}/${repo}?style=flat-square&color=${color}`;
        altText = 'Code Size';
        label = label || 'Code Size';
        break;
        
      case 'lastCommit':
        badgeUrl = `https://img.shields.io/github/last-commit/${owner}/${repo}?style=flat-square&color=${color}&logo=github`;
        altText = 'Last Commit';
        label = label || 'Last Commit';
        break;
        
      case 'repoSize':
        badgeUrl = `https://img.shields.io/github/repo-size/${owner}/${repo}?style=flat-square&color=${color}`;
        altText = 'Repository Size';
        label = label || 'Repo Size';
        break;
    }
    
    if (badgeUrl) {
      const markdown = `![${altText}](${badgeUrl})`;
      badges.push({ type: config.type, markdown, label });
    }
  }
  
  return badges;
}
