export type TabFavicon = 'brave' | 'home' | 'folder' | 'github' | 'mail' | 'globe'

export type BraveTab = {
  id: string
  title: string
  url: string
  favicon: TabFavicon
}

export type BravePage =
  | { kind: 'newtab' }
  | { kind: 'projects' }
  | { kind: 'about' }
  | { kind: 'mailto'; href: string }
  | { kind: 'external'; href: string; title: string }
  | { kind: 'iframe'; src: string }

const EMBED_HOST_BLOCKLIST = ['github.com', 'www.github.com', 'twitter.com', 'x.com', 'www.linkedin.com']

let tabCounter = 0

export function createTabId(): string {
  tabCounter += 1
  return `tab-${tabCounter}`
}

export function resolveBravePage(url: string): BravePage {
  const trimmed = url.trim()
  if (!trimmed || trimmed === 'brave://newtab' || trimmed === 'about:blank') {
    return { kind: 'newtab' }
  }
  if (trimmed === 'brave://projects' || trimmed === 'portfolio://projects') {
    return { kind: 'projects' }
  }
  if (trimmed === 'brave://about' || trimmed === 'portfolio://about') {
    return { kind: 'about' }
  }
  if (/^mailto:/i.test(trimmed)) {
    return { kind: 'mailto', href: trimmed }
  }
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const host = new URL(trimmed).hostname.toLowerCase()
      if (EMBED_HOST_BLOCKLIST.includes(host)) {
        return { kind: 'external', href: trimmed, title: titleForUrl(trimmed) }
      }
    } catch {
      return { kind: 'newtab' }
    }
    return { kind: 'iframe', src: trimmed }
  }
  return { kind: 'newtab' }
}

export function defaultBraveTabs(): BraveTab[] {
  return [
    {
      id: createTabId(),
      title: 'New Tab',
      url: 'brave://newtab',
      favicon: 'brave',
    },
    {
      id: createTabId(),
      title: 'Projects',
      url: 'brave://projects',
      favicon: 'folder',
    },
    {
      id: createTabId(),
      title: 'GitHub',
      url: 'https://github.com',
      favicon: 'github',
    },
  ]
}

export function titleForUrl(url: string): string {
  if (url === 'brave://newtab') return 'New Tab'
  if (url === 'brave://projects') return 'Projects'
  if (url === 'brave://about') return 'About'
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, '') || url
  } catch {
    return url
  }
}

export function faviconForUrl(url: string): TabFavicon {
  if (url === 'brave://newtab') return 'brave'
  if (url === 'brave://projects') return 'folder'
  if (url === 'brave://about') return 'home'
  if (url.includes('github')) return 'github'
  if (url.includes('mailto:')) return 'mail'
  return 'globe'
}
