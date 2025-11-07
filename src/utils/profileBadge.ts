/**
 * Profile Badge Generation Utilities
 * Generates social media, GitHub stats, and professional platform badges
 */

export type BadgeType =
  // Essential
  | 'github-followers'
  | 'youtube-subscribers'
  | 'youtube-views'
  | 'discord'
  // Social
  | 'twitter'
  | 'bluesky'
  | 'mastodon'
  | 'twitch'
  | 'reddit-karma-link'
  | 'reddit-karma-comment'
  | 'reddit-karma-combined'
  // Professional
  | 'stackoverflow'
  | 'opencollective'
  | 'liberapay'
  | 'subreddit'
  // Community
  | 'discourse'
  | 'gitter'
  // Advanced
  | 'github-sponsors'
  | 'github-gist';

export interface BadgeConfig {
  type: BadgeType;
  enabled: boolean;
  customColor: string; // hex with #
  label?: string; // custom label override
  
  // Input fields (platform-specific)
  username?: string;
  userId?: string;
  channelId?: string;
  serverId?: string;
  domain?: string;
  gistId?: string;
  subreddit?: string;
  serverUrl?: string;
  gitterUser?: string;
  gitterRepo?: string;
  videoId?: string;
}

/**
 * Get semantic default color for badge type (without #)
 */
export function getSemanticDefaultColor(type: BadgeType): string {
  const colors: Record<BadgeType, string> = {
    // Essential - Blue theme (popular platforms)
    'github-followers': '0969da',
    'youtube-subscribers': 'FF0000',
    'youtube-views': 'FF0000',
    'discord': '5865F2',
    
    // Social - Green/Teal theme
    'twitter': '1DA1F2',
    'bluesky': '0085ff',
    'mastodon': '6364FF',
    'twitch': '9146FF',
    'reddit-karma-link': 'FF4500',
    'reddit-karma-comment': 'FF4500',
    'reddit-karma-combined': 'FF4500',
    
    // Professional - Purple theme
    'stackoverflow': 'F48024',
    'opencollective': '7FADF2',
    'liberapay': 'F6C915',
    'subreddit': 'FF4500',
    
    // Community - Orange theme
    'discourse': '000000',
    'gitter': 'ED1965',
    
    // Advanced - Gray theme
    'github-sponsors': 'EA4AAA',
    'github-gist': '6e7681',
  };
  
  return colors[type];
}

/**
 * Generate Shields.io badge markdown for profile badges
 */
export function generateProfileBadges(
  configs: BadgeConfig[]
): { type: string; markdown: string; label: string }[] {
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
    let linkHref = '';
    
    switch (config.type) {
      case 'github-followers':
        if (!config.username) continue;
        badgeUrl = `https://img.shields.io/github/followers/${encodeURIComponent(config.username)}?style=social&logo=github`;
        altText = 'GitHub Followers';
        label = label || 'GitHub Followers';
        linkHref = `https://github.com/${encodeURIComponent(config.username)}`;
        break;
        
      case 'github-sponsors':
        if (!config.username) continue;
        badgeUrl = `https://img.shields.io/github/sponsors/${encodeURIComponent(config.username)}?style=flat-square&color=${color}&logo=github`;
        altText = 'GitHub Sponsors';
        label = label || 'GitHub Sponsors';
        linkHref = `https://github.com/sponsors/${encodeURIComponent(config.username)}`;
        break;
        
      case 'github-gist':
        if (!config.gistId) continue;
        badgeUrl = `https://img.shields.io/github/gist/stars/${encodeURIComponent(config.gistId)}?style=social&logo=github`;
        altText = 'Gist Stars';
        label = label || 'Gist Stars';
        linkHref = `https://gist.github.com/${encodeURIComponent(config.gistId)}`;
        break;
        
      case 'youtube-subscribers':
        if (!config.channelId) continue;
        badgeUrl = `https://img.shields.io/youtube/channel/subscribers/${encodeURIComponent(config.channelId)}?style=social&logo=youtube&logoColor=red`;
        altText = 'YouTube Subscribers';
        label = label || 'YouTube Subscribers';
        linkHref = `https://youtube.com/channel/${encodeURIComponent(config.channelId)}`;
        break;
        
      case 'youtube-views':
        if (!config.channelId) continue;
        badgeUrl = `https://img.shields.io/youtube/channel/views/${encodeURIComponent(config.channelId)}?style=social&logo=youtube&logoColor=red`;
        altText = 'YouTube Channel Views';
        label = label || 'YouTube Views';
        linkHref = `https://youtube.com/channel/${encodeURIComponent(config.channelId)}`;
        break;
        
      case 'twitter':
        if (!config.username) continue;
        badgeUrl = `https://img.shields.io/twitter/follow/${encodeURIComponent(config.username)}?style=social&logo=x`;
        altText = 'Twitter/X Followers';
        label = label || 'X Followers';
        linkHref = `https://x.com/${encodeURIComponent(config.username)}`;
        break;
        
      case 'twitch':
        if (!config.username) continue;
        badgeUrl = `https://img.shields.io/twitch/status/${encodeURIComponent(config.username)}?style=social&logo=twitch`;
        altText = 'Twitch Status';
        label = label || 'Twitch Status';
        linkHref = `https://twitch.tv/${encodeURIComponent(config.username)}`;
        break;
        
      case 'reddit-karma-link':
        if (!config.username) continue;
        badgeUrl = `https://img.shields.io/reddit/user-karma/link/${encodeURIComponent(config.username)}?style=social&logo=reddit`;
        altText = 'Reddit Karma (Link)';
        label = label || 'Link Karma';
        linkHref = `https://reddit.com/user/${encodeURIComponent(config.username)}`;
        break;
        
      case 'reddit-karma-comment':
        if (!config.username) continue;
        badgeUrl = `https://img.shields.io/reddit/user-karma/comment/${encodeURIComponent(config.username)}?style=social&logo=reddit`;
        altText = 'Reddit Karma (Comment)';
        label = label || 'Comment Karma';
        linkHref = `https://reddit.com/user/${encodeURIComponent(config.username)}`;
        break;
        
      case 'reddit-karma-combined':
        if (!config.username) continue;
        badgeUrl = `https://img.shields.io/reddit/user-karma/combined/${encodeURIComponent(config.username)}?style=social&logo=reddit`;
        altText = 'Reddit Karma (Combined)';
        label = label || 'Total Karma';
        linkHref = `https://reddit.com/user/${encodeURIComponent(config.username)}`;
        break;
        
      case 'bluesky':
        if (!config.username) continue;
        badgeUrl = `https://img.shields.io/bluesky/followers/${encodeURIComponent(config.username)}?style=social&logo=bluesky`;
        altText = 'Bluesky Followers';
        label = label || 'Bluesky Followers';
        linkHref = `https://bsky.app/profile/${encodeURIComponent(config.username)}`;
        break;
        
      case 'mastodon':
        if (!config.userId || !config.domain) continue;
        badgeUrl = `https://img.shields.io/mastodon/follow/${encodeURIComponent(config.userId)}?domain=${encodeURIComponent(config.domain)}&style=social&logo=mastodon`;
        altText = 'Mastodon Followers';
        label = label || 'Mastodon Followers';
        linkHref = `https://${encodeURIComponent(config.domain)}/@${encodeURIComponent(config.username || config.userId)}`;
        break;
        
      case 'discord':
        if (!config.serverId) continue;
        badgeUrl = `https://img.shields.io/discord/${encodeURIComponent(config.serverId)}?style=flat-square&color=${color}&logo=discord&logoColor=white`;
        altText = 'Discord Members';
        label = label || 'Discord';
        linkHref = `https://discord.gg/${encodeURIComponent(config.serverId)}`;
        break;
        
      case 'stackoverflow':
        if (!config.userId) continue;
        badgeUrl = `https://img.shields.io/stackexchange/stackoverflow/r/${encodeURIComponent(config.userId)}?style=flat-square&color=${color}&logo=stackoverflow`;
        altText = 'Stack Overflow Reputation';
        label = label || 'Stack Overflow';
        linkHref = `https://stackoverflow.com/users/${encodeURIComponent(config.userId)}`;
        break;
        
      case 'opencollective':
        if (!config.username) continue;
        badgeUrl = `https://img.shields.io/opencollective/backers/${encodeURIComponent(config.username)}?style=flat-square&color=${color}&logo=opencollective`;
        altText = 'Open Collective Backers';
        label = label || 'Open Collective';
        linkHref = `https://opencollective.com/${encodeURIComponent(config.username)}`;
        break;
        
      case 'liberapay':
        if (!config.username) continue;
        badgeUrl = `https://img.shields.io/liberapay/patrons/${encodeURIComponent(config.username)}?style=flat-square&color=${color}&logo=liberapay`;
        altText = 'Liberapay Patrons';
        label = label || 'Liberapay';
        linkHref = `https://liberapay.com/${encodeURIComponent(config.username)}`;
        break;
        
      case 'subreddit':
        if (!config.subreddit) continue;
        badgeUrl = `https://img.shields.io/reddit/subreddit-subscribers/${encodeURIComponent(config.subreddit)}?style=social&logo=reddit`;
        altText = 'Subreddit Subscribers';
        label = label || `r/${config.subreddit}`;
        linkHref = `https://reddit.com/r/${encodeURIComponent(config.subreddit)}`;
        break;
        
      case 'discourse':
        if (!config.serverUrl) continue;
        badgeUrl = `https://img.shields.io/discourse/users?server=${encodeURIComponent(config.serverUrl)}&style=flat-square&color=${color}&logo=discourse`;
        altText = 'Discourse Users';
        label = label || 'Discourse';
        linkHref = config.serverUrl;
        break;
        
      case 'gitter':
        if (!config.gitterUser || !config.gitterRepo) continue;
        badgeUrl = `https://img.shields.io/gitter/room/${encodeURIComponent(config.gitterUser)}/${encodeURIComponent(config.gitterRepo)}?style=flat-square&color=${color}&logo=gitter`;
        altText = 'Gitter Chat';
        label = label || 'Gitter';
        linkHref = `https://gitter.im/${encodeURIComponent(config.gitterUser)}/${encodeURIComponent(config.gitterRepo)}`;
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
