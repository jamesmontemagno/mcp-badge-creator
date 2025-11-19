import { describe, it, expect } from 'vitest'
import {
  getSemanticDefaultColor,
  generateProfileBadges,
  type BadgeConfig,
} from './profileBadge'

describe('profileBadge', () => {
  describe('getSemanticDefaultColor', () => {
    it('returns correct default colors for each badge type', () => {
      expect(getSemanticDefaultColor('github-followers')).toBe('0969da')
      expect(getSemanticDefaultColor('youtube-subscribers')).toBe('FF0000')
      expect(getSemanticDefaultColor('discord')).toBe('5865F2')
      expect(getSemanticDefaultColor('twitter')).toBe('1DA1F2')
      expect(getSemanticDefaultColor('bluesky')).toBe('0085ff')
      expect(getSemanticDefaultColor('mastodon')).toBe('6364FF')
      expect(getSemanticDefaultColor('twitch')).toBe('9146FF')
      expect(getSemanticDefaultColor('reddit-karma-link')).toBe('FF4500')
      expect(getSemanticDefaultColor('stackoverflow')).toBe('F48024')
      expect(getSemanticDefaultColor('opencollective')).toBe('7FADF2')
      expect(getSemanticDefaultColor('liberapay')).toBe('F6C915')
      expect(getSemanticDefaultColor('discourse')).toBe('000000')
      expect(getSemanticDefaultColor('gitter')).toBe('ED1965')
      expect(getSemanticDefaultColor('github-sponsors')).toBe('EA4AAA')
      expect(getSemanticDefaultColor('github-gist')).toBe('6e7681')
    })

    it('returns colors without # prefix', () => {
      const color = getSemanticDefaultColor('github-followers')
      expect(color).not.toContain('#')
      expect(color.length).toBe(6)
    })
  })

  describe('generateProfileBadges', () => {
    it('returns empty array for disabled badges', () => {
      const configs: BadgeConfig[] = [
        {
          type: 'github-followers',
          enabled: false,
          customColor: '#0969da',
          username: 'testuser',
        },
      ]
      const badges = generateProfileBadges(configs)
      expect(badges).toHaveLength(0)
    })

    it('generates GitHub followers badge with social style', () => {
      const configs: BadgeConfig[] = [
        {
          type: 'github-followers',
          enabled: true,
          customColor: '#0969da',
          username: 'octocat',
        },
      ]
      const badges = generateProfileBadges(configs)
      expect(badges).toHaveLength(1)
      expect(badges[0].type).toBe('github-followers')
      expect(badges[0].markdown).toContain('https://img.shields.io/github/followers/octocat')
      expect(badges[0].markdown).toContain('style=social')
      expect(badges[0].markdown).toContain('logo=github')
      expect(badges[0].markdown).toContain('https://github.com/octocat')
    })

    it('generates GitHub sponsors badge with custom color', () => {
      const configs: BadgeConfig[] = [
        {
          type: 'github-sponsors',
          enabled: true,
          customColor: '#ff69b4',
          username: 'testuser',
        },
      ]
      const badges = generateProfileBadges(configs)
      expect(badges).toHaveLength(1)
      expect(badges[0].markdown).toContain('color=ff69b4')
      expect(badges[0].markdown).toContain('style=social')
    })

    it('generates YouTube subscribers badge with channel ID', () => {
      const configs: BadgeConfig[] = [
        {
          type: 'youtube-subscribers',
          enabled: true,
          customColor: '#FF0000',
          channelId: 'UC8butISFwT-Wl7EV0hUK0BQ',
        },
      ]
      const badges = generateProfileBadges(configs)
      expect(badges).toHaveLength(1)
      expect(badges[0].markdown).toContain('youtube/channel/subscribers/UC8butISFwT-Wl7EV0hUK0BQ')
      expect(badges[0].markdown).toContain('style=social')
      expect(badges[0].markdown).toContain('logo=youtube')
    })

    it('generates Discord badge with server ID', () => {
      const configs: BadgeConfig[] = [
        {
          type: 'discord',
          enabled: true,
          customColor: '#5865F2',
          serverId: '308323056592486420',
        },
      ]
      const badges = generateProfileBadges(configs)
      expect(badges).toHaveLength(1)
      expect(badges[0].markdown).toContain('discord/308323056592486420')
      expect(badges[0].markdown).toContain('color=5865F2')
    })

    it('generates Reddit karma badges with correct variants', () => {
      const configs: BadgeConfig[] = [
        {
          type: 'reddit-karma-link',
          enabled: true,
          customColor: '#FF4500',
          username: 'testuser',
        },
        {
          type: 'reddit-karma-comment',
          enabled: true,
          customColor: '#FF4500',
          username: 'testuser',
        },
        {
          type: 'reddit-karma-combined',
          enabled: true,
          customColor: '#FF4500',
          username: 'testuser',
        },
      ]
      const badges = generateProfileBadges(configs)
      expect(badges).toHaveLength(3)
      expect(badges[0].markdown).toContain('user-karma/link/testuser')
      expect(badges[1].markdown).toContain('user-karma/comment/testuser')
      expect(badges[2].markdown).toContain('user-karma/combined/testuser')
    })

    it('generates Mastodon badge with domain and user ID', () => {
      const configs: BadgeConfig[] = [
        {
          type: 'mastodon',
          enabled: true,
          customColor: '#6364FF',
          userId: '26471',
          domain: 'mastodon.social',
        },
      ]
      const badges = generateProfileBadges(configs)
      expect(badges).toHaveLength(1)
      expect(badges[0].markdown).toContain('mastodon/follow/26471')
      expect(badges[0].markdown).toContain('domain=mastodon.social')
    })

    it('generates Twitter/X badge with username', () => {
      const configs: BadgeConfig[] = [
        {
          type: 'twitter',
          enabled: true,
          customColor: '#1DA1F2',
          username: 'testuser',
        },
      ]
      const badges = generateProfileBadges(configs)
      expect(badges).toHaveLength(1)
      expect(badges[0].markdown).toContain('twitter/follow/testuser')
      expect(badges[0].markdown).toContain('style=social')
      expect(badges[0].markdown).toContain('logo=x')
      expect(badges[0].markdown).toContain('https://x.com/testuser')
    })

    it('generates Stack Overflow badge with user ID', () => {
      const configs: BadgeConfig[] = [
        {
          type: 'stackoverflow',
          enabled: true,
          customColor: '#F48024',
          userId: '12345',
        },
      ]
      const badges = generateProfileBadges(configs)
      expect(badges).toHaveLength(1)
      expect(badges[0].markdown).toContain('stackexchange/stackoverflow/r/12345')
      expect(badges[0].markdown).toContain('logo=stackoverflow')
    })

    it('generates Gitter badge with user and repo', () => {
      const configs: BadgeConfig[] = [
        {
          type: 'gitter',
          enabled: true,
          customColor: '#ED1965',
          gitterUser: 'nwjs',
          gitterRepo: 'nw.js',
        },
      ]
      const badges = generateProfileBadges(configs)
      expect(badges).toHaveLength(1)
      expect(badges[0].markdown).toContain('gitter/room/nwjs/nw.js')
    })

    it('generates Discourse badge with server URL', () => {
      const configs: BadgeConfig[] = [
        {
          type: 'discourse',
          enabled: true,
          customColor: '#000000',
          serverUrl: 'https://meta.discourse.org',
        },
      ]
      const badges = generateProfileBadges(configs)
      expect(badges).toHaveLength(1)
      expect(badges[0].markdown).toContain('discourse/users')
      expect(badges[0].markdown).toContain('server=https%3A%2F%2Fmeta.discourse.org')
    })

    it('generates GitHub Gist badge with gist ID', () => {
      const configs: BadgeConfig[] = [
        {
          type: 'github-gist',
          enabled: true,
          customColor: '#6e7681',
          gistId: '47a4d00457a92aa426dbd48a18776322',
        },
      ]
      const badges = generateProfileBadges(configs)
      expect(badges).toHaveLength(1)
      expect(badges[0].markdown).toContain('github/gist/stars/47a4d00457a92aa426dbd48a18776322')
    })

    it('generates subreddit badge with subreddit name', () => {
      const configs: BadgeConfig[] = [
        {
          type: 'subreddit',
          enabled: true,
          customColor: '#FF4500',
          subreddit: 'programming',
        },
      ]
      const badges = generateProfileBadges(configs)
      expect(badges).toHaveLength(1)
      expect(badges[0].markdown).toContain('reddit/subreddit-subscribers/programming')
      expect(badges[0].label).toBe('r/programming')
    })

    it('skips badges with missing required fields', () => {
      const configs: BadgeConfig[] = [
        {
          type: 'github-followers',
          enabled: true,
          customColor: '#0969da',
          // missing username
        },
        {
          type: 'youtube-subscribers',
          enabled: true,
          customColor: '#FF0000',
          // missing channelId
        },
        {
          type: 'mastodon',
          enabled: true,
          customColor: '#6364FF',
          userId: '12345',
          // missing domain
        },
      ]
      const badges = generateProfileBadges(configs)
      expect(badges).toHaveLength(0)
    })

    it('URL-encodes special characters in usernames', () => {
      const configs: BadgeConfig[] = [
        {
          type: 'github-followers',
          enabled: true,
          customColor: '#0969da',
          username: 'user+test',
        },
      ]
      const badges = generateProfileBadges(configs)
      expect(badges[0].markdown).toContain('user%2Btest')
    })

    it('strips # from custom colors', () => {
      const configs: BadgeConfig[] = [
        {
          type: 'discord',
          enabled: true,
          customColor: '#abc123',
          serverId: '123456',
        },
      ]
      const badges = generateProfileBadges(configs)
      expect(badges[0].markdown).toContain('color=abc123')
      expect(badges[0].markdown).not.toContain('color=#abc123')
    })

    it('generates multiple badges correctly', () => {
      const configs: BadgeConfig[] = [
        {
          type: 'github-followers',
          enabled: true,
          customColor: '#0969da',
          username: 'user1',
        },
        {
          type: 'twitch',
          enabled: true,
          customColor: '#9146FF',
          username: 'streamer1',
        },
        {
          type: 'bluesky',
          enabled: true,
          customColor: '#0085ff',
          username: 'user.bsky.social',
        },
      ]
      const badges = generateProfileBadges(configs)
      expect(badges).toHaveLength(3)
      expect(badges[0].type).toBe('github-followers')
      expect(badges[1].type).toBe('twitch')
      expect(badges[2].type).toBe('bluesky')
    })

    it('uses custom labels when provided', () => {
      const configs: BadgeConfig[] = [
        {
          type: 'github-followers',
          enabled: true,
          customColor: '#0969da',
          username: 'testuser',
          label: 'My Followers',
        },
      ]
      const badges = generateProfileBadges(configs)
      expect(badges[0].label).toBe('My Followers')
    })

    it('generates linked badges with correct href', () => {
      const configs: BadgeConfig[] = [
        {
          type: 'github-followers',
          enabled: true,
          customColor: '#0969da',
          username: 'octocat',
        },
      ]
      const badges = generateProfileBadges(configs)
      expect(badges[0].markdown).toMatch(/\[!\[.*\]\(.*\)\]\(https:\/\/github\.com\/octocat\)/)
    })
  })
})
