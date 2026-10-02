import { canonicalGitHubUrl, isGitHubSiteUrl, isLinkedInSiteUrl } from './browserSiteUrls'
import { GITHUB_PROFILE_URL } from './githubProfile'

export type TabFavicon = 'browser' | 'home' | 'github' | 'linkedin' | 'mail' | 'globe'

export const LINKEDIN_PROFILE_URL = 'https://www.linkedin.com/in/eshaan-walia'

export const BROWSER_HOME_URL = 'browser://newtab'

/** Maps legacy `brave://` internal URLs to `browser://`. */
export function normalizeBrowserSchemeUrl(url: string): string {
  return url.trim().replace(/^brave:/i, 'browser:')
}

export type BrowserTab = {
  id: string
  title: string
  url: string
  favicon: TabFavicon
  /** Pinned start page — not closable; shows the new-tab UI at {@link BROWSER_HOME_URL}. */
  isHome?: boolean
}

export type BrowserPage =
  | { kind: 'newtab' }
  | { kind: 'about' }
  | { kind: 'search'; query: string }
  | { kind: 'mailto'; href: string }
  | { kind: 'iframe'; src: string }
  | { kind: 'linkedin'; url: string }
  | { kind: 'github'; url: string }
  | { kind: 'comingsoon' }

export const AMITTAL_SITE_URL = 'https://amittal.dev'

const ALLOWED_IFRAME_HOST = 'amittal.dev'

export function isAllowedIframeUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, '')
    return host === ALLOWED_IFRAME_HOST
  } catch {
    return false
  }
}

export function buildBrowserSearchUrl(query: string): string {
  const t = query.trim()
  if (!t) return BROWSER_HOME_URL
  return `browser://search?q=${encodeURIComponent(t)}`
}

export function parseBrowserSearchQuery(url: string): string | null {
  const normalized = normalizeBrowserSchemeUrl(url)
  if (!/^browser:\/\/search/i.test(normalized)) return null
  try {
    const u = new URL(normalized.replace(/^browser:/i, 'https:'))
    return u.searchParams.get('q') ?? ''
  } catch {
    return null
  }
}

let tabCounter = 0

/** New-tab search: URLs, browser/mailto schemes, or web search. */
export function searchQueryToUrl(input: string): string {
  const t = normalizeBrowserSchemeUrl(input)
  if (!t) return 'browser://newtab'
  if (/^browser:\/\//i.test(t) || /^mailto:/i.test(t)) return t
  if (/^https?:\/\//i.test(t)) return canonicalGitHubUrl(t)
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/i.test(t) && !t.includes(' ')) {
    return canonicalGitHubUrl(`https://${t}`)
  }
  return buildBrowserSearchUrl(t)
}

export const BROWSER_NEW_TAB_LINKS: {
  label: string
  url: string
  hint: string
  favicon: TabFavicon
}[] = [
  {
    label: 'LinkedIn',
    url: LINKEDIN_PROFILE_URL,
    hint: 'Profile',
    favicon: 'linkedin',
  },
  {
    label: 'About',
    url: 'browser://about',
    hint: 'This site',
    favicon: 'home',
  },
  {
    label: 'GitHub',
    url: GITHUB_PROFILE_URL,
    hint: 'Code',
    favicon: 'github',
  },
  {
    label: 'Email',
    url: 'mailto:weshaan108@gmail.com',
    hint: 'Contact',
    favicon: 'mail',
  },
]

export function createTabId(): string {
  tabCounter += 1
  return `tab-${tabCounter}`
}

export function createHomeTab(): BrowserTab {
  return {
    id: createTabId(),
    title: 'Home',
    url: BROWSER_HOME_URL,
    favicon: 'home',
    isHome: true,
  }
}

export function tabTitleFor(url: string, isHome?: boolean): string {
  if (isHome && url === BROWSER_HOME_URL) return 'Home'
  return titleForUrl(url)
}

export function tabFaviconFor(url: string, isHome?: boolean): TabFavicon {
  if (isHome && url === BROWSER_HOME_URL) return 'home'
  return faviconForUrl(url)
}

/** Canonical form for deduping “same page” across tabs. */
export function normalizeTabUrl(url: string): string {
  const t = normalizeBrowserSchemeUrl(url)
  if (!t || t === BROWSER_HOME_URL || t === 'about:blank') return BROWSER_HOME_URL
  if (t === 'browser://about' || t === 'portfolio://about') return 'browser://about'
  const searchQ = parseBrowserSearchQuery(t)
  if (searchQ !== null) return buildBrowserSearchUrl(searchQ)
  if (/^mailto:/i.test(t)) return t.toLowerCase()
  if (/^browser:/i.test(t)) return t.toLowerCase()
  if (isGitHubSiteUrl(t)) return GITHUB_PROFILE_URL

  try {
    const parsed = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`)
    let host = parsed.hostname.toLowerCase()
    if (host.startsWith('www.')) host = host.slice(4)
    let path = parsed.pathname
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
    const pathPart = path === '/' ? '' : path
    return `${parsed.protocol}//${host}${pathPart}${parsed.search}${parsed.hash}`
  } catch {
    return t.toLowerCase()
  }
}

export function tabUrlsMatch(a: string, b: string): boolean {
  return normalizeTabUrl(a) === normalizeTabUrl(b)
}

export function resolveBrowserPage(url: string): BrowserPage {
  const trimmed = normalizeBrowserSchemeUrl(url)
  if (!trimmed || trimmed === 'browser://newtab' || trimmed === 'about:blank') {
    return { kind: 'newtab' }
  }
  if (trimmed === 'browser://about' || trimmed === 'portfolio://about') {
    return { kind: 'about' }
  }
  const searchQuery = parseBrowserSearchQuery(trimmed)
  if (searchQuery !== null) {
    return { kind: 'search', query: searchQuery }
  }
  if (/^mailto:/i.test(trimmed)) {
    return { kind: 'mailto', href: trimmed }
  }
  if (/^https?:\/\//i.test(trimmed)) {
    if (isAllowedIframeUrl(trimmed)) {
      return { kind: 'iframe', src: trimmed }
    }
    if (isLinkedInSiteUrl(trimmed)) {
      return { kind: 'linkedin', url: trimmed }
    }
    if (isGitHubSiteUrl(trimmed)) {
      return { kind: 'github', url: GITHUB_PROFILE_URL }
    }
    return { kind: 'comingsoon' }
  }
  return { kind: 'newtab' }
}

export function defaultBrowserTabs(): BrowserTab[] {
  return [
    createHomeTab(),
    {
      id: createTabId(),
      title: 'weshaan',
      url: GITHUB_PROFILE_URL,
      favicon: 'github',
    },
    {
      id: createTabId(),
      title: 'LinkedIn',
      url: LINKEDIN_PROFILE_URL,
      favicon: 'linkedin',
    },
  ]
}

export function titleForUrl(url: string): string {
  if (url === 'browser://newtab') return 'New Tab'
  if (url === 'browser://about') return 'About'
  const searchQ = parseBrowserSearchQuery(url)
  if (searchQ !== null) {
    const short = searchQ.length > 22 ? `${searchQ.slice(0, 22)}…` : searchQ
    return short ? `Search: ${short}` : 'Search'
  }
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'linkedin.com' && u.pathname.includes('/in/')) {
      const slug = u.pathname.split('/').filter(Boolean).pop()
      return slug ? `${slug} | LinkedIn` : 'LinkedIn'
    }
    if (host === 'github.com') {
      return 'weshaan'
    }
    return host || url
  } catch {
    return url
  }
}

export function faviconForUrl(url: string): TabFavicon {
  if (url === 'browser://newtab') return 'browser'
  if (url === 'browser://about') return 'home'
  if (url.includes('github')) return 'github'
  if (url.includes('linkedin')) return 'linkedin'
  if (url.includes('mailto:')) return 'mail'
  return 'globe'
}
