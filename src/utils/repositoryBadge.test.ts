/**
 * Unit tests for Repository Badge utilities
 */

import { describe, it, expect } from 'vitest';
import {
  parseRepositoryInput,
  validateWorkflowFilename,
  getSemanticDefaultColor,
  generateRepositoryBadges,
  type BadgeConfig,
  type RepositoryInfo,
} from './repositoryBadge';

describe('parseRepositoryInput', () => {
  it('should parse direct format (owner/repo)', () => {
    const result = parseRepositoryInput('facebook/react');
    expect(result).toEqual({ owner: 'facebook', repo: 'react' });
  });

  it('should parse full GitHub URL with https', () => {
    const result = parseRepositoryInput('https://github.com/microsoft/vscode');
    expect(result).toEqual({ owner: 'microsoft', repo: 'vscode' });
  });

  it('should parse full GitHub URL with http', () => {
    const result = parseRepositoryInput('http://github.com/torvalds/linux');
    expect(result).toEqual({ owner: 'torvalds', repo: 'linux' });
  });

  it('should parse GitHub URL without protocol', () => {
    const result = parseRepositoryInput('github.com/nodejs/node');
    expect(result).toEqual({ owner: 'nodejs', repo: 'node' });
  });

  it('should handle trailing slash', () => {
    const result = parseRepositoryInput('https://github.com/vuejs/vue/');
    expect(result).toEqual({ owner: 'vuejs', repo: 'vue' });
  });

  it('should handle .git extension', () => {
    const result = parseRepositoryInput('https://github.com/rails/rails.git');
    expect(result).toEqual({ owner: 'rails', repo: 'rails' });
  });

  it('should handle owner/repo with hyphens and underscores', () => {
    const result = parseRepositoryInput('my-org/my_repo-name');
    expect(result).toEqual({ owner: 'my-org', repo: 'my_repo-name' });
  });

  it('should handle owner/repo with dots', () => {
    const result = parseRepositoryInput('owner.name/repo.name');
    expect(result).toEqual({ owner: 'owner.name', repo: 'repo.name' });
  });

  it('should return null for empty input', () => {
    expect(parseRepositoryInput('')).toBeNull();
    expect(parseRepositoryInput('   ')).toBeNull();
  });

  it('should return null for invalid input (too many parts)', () => {
    expect(parseRepositoryInput('owner/repo/extra')).toBeNull();
  });

  it('should return null for invalid input (only one part)', () => {
    expect(parseRepositoryInput('just-repo')).toBeNull();
  });

  it('should return null for invalid characters', () => {
    expect(parseRepositoryInput('owner@invalid/repo')).toBeNull();
    expect(parseRepositoryInput('owner/repo#invalid')).toBeNull();
  });

  it('should return null for non-string input', () => {
    expect(parseRepositoryInput(null as unknown as string)).toBeNull();
    expect(parseRepositoryInput(undefined as unknown as string)).toBeNull();
  });
});

describe('validateWorkflowFilename', () => {
  it('should validate .yml extension', () => {
    expect(validateWorkflowFilename('ci.yml')).toBe(true);
    expect(validateWorkflowFilename('test.yml')).toBe(true);
  });

  it('should validate .yaml extension', () => {
    expect(validateWorkflowFilename('build.yaml')).toBe(true);
    expect(validateWorkflowFilename('deploy.yaml')).toBe(true);
  });

  it('should handle filenames with paths', () => {
    expect(validateWorkflowFilename('.github/workflows/ci.yml')).toBe(true);
  });

  it('should reject files without .yml or .yaml extension', () => {
    expect(validateWorkflowFilename('workflow.txt')).toBe(false);
    expect(validateWorkflowFilename('ci.json')).toBe(false);
    expect(validateWorkflowFilename('test')).toBe(false);
  });

  it('should reject empty input', () => {
    expect(validateWorkflowFilename('')).toBe(false);
    expect(validateWorkflowFilename('   ')).toBe(false);
  });

  it('should reject non-string input', () => {
    expect(validateWorkflowFilename(null as unknown as string)).toBe(false);
    expect(validateWorkflowFilename(undefined as unknown as string)).toBe(false);
  });
});

describe('getSemanticDefaultColor', () => {
  it('should return green for workflow badges', () => {
    expect(getSemanticDefaultColor('workflow')).toBe('2ea44f');
  });

  it('should return blue for stars and forks', () => {
    expect(getSemanticDefaultColor('stars')).toBe('0969da');
    expect(getSemanticDefaultColor('forks')).toBe('0969da');
  });

  it('should return yellow for license', () => {
    expect(getSemanticDefaultColor('license')).toBe('dfb317');
  });

  it('should return orange for issues', () => {
    expect(getSemanticDefaultColor('issues')).toBe('ff6f00');
  });

  it('should return purple for contributors and release', () => {
    expect(getSemanticDefaultColor('contributors')).toBe('8957e5');
    expect(getSemanticDefaultColor('release')).toBe('8957e5');
  });

  it('should return gray for metadata badges', () => {
    expect(getSemanticDefaultColor('language')).toBe('6e7681');
    expect(getSemanticDefaultColor('codeSize')).toBe('6e7681');
    expect(getSemanticDefaultColor('lastCommit')).toBe('6e7681');
    expect(getSemanticDefaultColor('repoSize')).toBe('6e7681');
  });
});

describe('generateRepositoryBadges', () => {
  const repoInfo: RepositoryInfo = { owner: 'testowner', repo: 'testrepo' };

  it('should generate stars badge', () => {
    const configs: BadgeConfig[] = [
      { type: 'stars', enabled: true, customColor: '#0969da' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    
    expect(badges).toHaveLength(1);
    expect(badges[0].type).toBe('stars');
    expect(badges[0].markdown).toContain('github/stars/testowner/testrepo');
    expect(badges[0].markdown).toContain('stargazers'); // linked to stargazers page
    expect(badges[0].markdown).not.toContain('style=flat-square');
    expect(badges[0].markdown).not.toContain('color=');
    expect(badges[0].markdown).not.toContain('logo=');
    expect(badges[0].label).toBe('Stars');
  });

  it('should generate forks badge', () => {
    const configs: BadgeConfig[] = [
      { type: 'forks', enabled: true, customColor: '#0969da' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    
    expect(badges[0].markdown).toContain('github/forks/testowner/testrepo');
    expect(badges[0].markdown).toContain('](https://github.com/testowner/testrepo/forks)');
    expect(badges[0].label).toBe('Forks');
  });

  it('should generate issues badge', () => {
    const configs: BadgeConfig[] = [
      { type: 'issues', enabled: true, customColor: '#ff6f00' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    
    expect(badges[0].markdown).toContain('github/issues/testowner/testrepo');
    expect(badges[0].markdown).toContain('color=ff6f00');
    expect(badges[0].markdown).toContain('](https://github.com/testowner/testrepo/issues)');
    expect(badges[0].label).toBe('Issues');
  });

  it('should generate license badge', () => {
    const configs: BadgeConfig[] = [
      { type: 'license', enabled: true, customColor: '#dfb317' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    
    expect(badges[0].markdown).toContain('github/license/testowner/testrepo');
    expect(badges[0].markdown).toContain('](https://github.com/testowner/testrepo/tree/main/LICENSE)');
    expect(badges[0].label).toBe('License');
  });

  it('should generate workflow badge with valid filename', () => {
    const configs: BadgeConfig[] = [
      { type: 'workflow', enabled: true, customColor: '#2ea44f', workflowFile: 'ci.yml' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    
    expect(badges).toHaveLength(1);
    expect(badges[0].markdown).toContain('actions/workflow/status/testowner/testrepo/ci.yml');
    expect(badges[0].markdown).toContain('](https://github.com/testowner/testrepo/actions/workflows/ci.yml)');
    expect(badges[0].label).toBe('ci');
  });

  it('should skip workflow badge with invalid filename', () => {
    const configs: BadgeConfig[] = [
      { type: 'workflow', enabled: true, customColor: '#2ea44f', workflowFile: 'invalid.txt' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    
    expect(badges).toHaveLength(0);
  });

  it('should skip workflow badge without filename', () => {
    const configs: BadgeConfig[] = [
      { type: 'workflow', enabled: true, customColor: '#2ea44f' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    
    expect(badges).toHaveLength(0);
  });

  it('should generate contributors badge', () => {
    const configs: BadgeConfig[] = [
      { type: 'contributors', enabled: true, customColor: '#8957e5' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    
    expect(badges[0].markdown).toContain('github/contributors/testowner/testrepo');
    expect(badges[0].markdown).toContain('](https://github.com/testowner/testrepo/graphs/contributors)');
    expect(badges[0].label).toBe('Contributors');
  });

  it('should generate release badge', () => {
    const configs: BadgeConfig[] = [
      { type: 'release', enabled: true, customColor: '#8957e5' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    
    expect(badges[0].markdown).toContain('github/v/release/testowner/testrepo');
    expect(badges[0].markdown).toContain('](https://github.com/testowner/testrepo/releases/latest)');
    expect(badges[0].label).toBe('Release');
  });

  it('should generate language badge', () => {
    const configs: BadgeConfig[] = [
      { type: 'language', enabled: true, customColor: '#6e7681' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    
    expect(badges[0].markdown).toContain('github/languages/top/testowner/testrepo');
    expect(badges[0].markdown).toContain('](https://github.com/testowner/testrepo/languages)');
    expect(badges[0].label).toBe('Language');
  });

  it('should generate code size badge', () => {
    const configs: BadgeConfig[] = [
      { type: 'codeSize', enabled: true, customColor: '#6e7681' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    
    expect(badges[0].markdown).toContain('github/languages/code-size/testowner/testrepo');
    expect(badges[0].markdown).toContain('](https://github.com/testowner/testrepo)');
    expect(badges[0].label).toBe('Code Size');
  });

  it('should generate last commit badge (default branch main)', () => {
    const configs: BadgeConfig[] = [
      { type: 'lastCommit', enabled: true, customColor: '#6e7681' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs); // default branch main
    
    expect(badges[0].markdown).toContain('github/last-commit/testowner/testrepo');
    expect(badges[0].markdown).toContain('](https://github.com/testowner/testrepo/commits/main)');
    expect(badges[0].label).toBe('Last Commit');
  });

  it('should generate repo size badge', () => {
    const configs: BadgeConfig[] = [
      { type: 'repoSize', enabled: true, customColor: '#6e7681' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    
    expect(badges[0].markdown).toContain('github/repo-size/testowner/testrepo');
    expect(badges[0].markdown).toContain('](https://github.com/testowner/testrepo)');
    expect(badges[0].label).toBe('Repo Size');
  });

  it('should generate coverage badge', () => {
    const configs: BadgeConfig[] = [
      { type: 'coverage', enabled: true, customColor: '#2ea44f' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    expect(badges[0].markdown).toContain('codecov/c/github/testowner/testrepo');
    expect(badges[0].markdown).toContain('logo=codecov');
    expect(badges[0].markdown).toContain('](https://codecov.io/gh/testowner/testrepo)');
    expect(badges[0].label).toBe('Coverage');
  });

  it('should generate openssf scorecard badge', () => {
    const configs: BadgeConfig[] = [
      { type: 'openssf', enabled: true, customColor: '#0969da' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    expect(badges[0].markdown).toContain('ossf-scorecard/github.com/testowner/testrepo');
    expect(badges[0].markdown).toContain('label=OpenSSF%20Scorecard');
    expect(badges[0].markdown).toContain('](https://securityscorecards.dev/viewer/?uri=github.com/testowner/testrepo)');
    expect(badges[0].label).toBe('OpenSSF');
  });

  it('should respect custom branch for license and last commit links', () => {
    const configs: BadgeConfig[] = [
      { type: 'license', enabled: true, customColor: '#dfb317' },
      { type: 'lastCommit', enabled: true, customColor: '#6e7681' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs, 'develop');
    const license = badges.find(b => b.type === 'license');
    const lastCommit = badges.find(b => b.type === 'lastCommit');
    expect(license?.markdown).toContain('](https://github.com/testowner/testrepo/tree/develop/LICENSE)');
    expect(lastCommit?.markdown).toContain('](https://github.com/testowner/testrepo/commits/develop)');
  });

  it('should use custom label when provided', () => {
    const configs: BadgeConfig[] = [
      { type: 'stars', enabled: true, customColor: '#0969da', label: 'Custom Stars Label' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    
    expect(badges[0].label).toBe('Custom Stars Label');
  });

  it('should skip disabled badges', () => {
    const configs: BadgeConfig[] = [
      { type: 'stars', enabled: false, customColor: '#0969da' },
      { type: 'forks', enabled: true, customColor: '#0969da' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    
    expect(badges).toHaveLength(1);
    expect(badges[0].type).toBe('forks');
  });

  it('should generate multiple badges', () => {
    const configs: BadgeConfig[] = [
      { type: 'stars', enabled: true, customColor: '#0969da' },
      { type: 'license', enabled: true, customColor: '#dfb317' },
      { type: 'workflow', enabled: true, customColor: '#2ea44f', workflowFile: 'test.yml' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    
    expect(badges).toHaveLength(3);
    expect(badges.map(b => b.type)).toEqual(['stars', 'license', 'workflow']);
  });

  it('should strip # from color codes for colorized badges (forks example)', () => {
    const configs: BadgeConfig[] = [
      { type: 'forks', enabled: true, customColor: '#FF0000' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    
    expect(badges[0].markdown).toContain('color=FF0000');
    expect(badges[0].markdown).not.toContain('color=#');
  });

  it('should include flat-square style for non-star badges (forks example)', () => {
    const configs: BadgeConfig[] = [
      { type: 'forks', enabled: true, customColor: '#0969da' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    
    expect(badges[0].markdown).toContain('style=flat-square');
  });

  it('should include appropriate logos (forks has logo, stars fixed style without logo)', () => {
    const configs: BadgeConfig[] = [
      { type: 'stars', enabled: true, customColor: '#0969da' },
      { type: 'forks', enabled: true, customColor: '#0969da' },
      { type: 'license', enabled: true, customColor: '#dfb317' },
    ];
    const badges = generateRepositoryBadges(repoInfo, configs);
    
    const starsBadge = badges.find(b => b.type === 'stars');
    const forksBadge = badges.find(b => b.type === 'forks');
    const licenseBadge = badges.find(b => b.type === 'license');
    expect(starsBadge?.markdown).not.toContain('logo=');
    expect(forksBadge?.markdown).toContain('logo=github');
    expect(licenseBadge?.markdown).not.toContain('logo=');
  });
});
