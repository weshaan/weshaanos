export type TabFavicon = 'brave' | 'home' | 'github' | 'linkedin' | 'mail' | 'globe'

export const LINKEDIN_PROFILE_URL = 'https://www.linkedin.com/in/weshaan'

export const BRAVE_HOME_URL = 'brave://newtab'

export type BraveTab = {
  id: string
  title: string
  url: string
  favicon: TabFavicon
  /** Pinned start page — not closable; shows the new-tab UI at {@link BRAVE_HOME_URL}. */
  isHome?: boolean
}

export type BravePage =
  | { kind: 'newtab' }
  | { kind: 'about' }
  | { kind: 'search'; query: string }
  | { kind: 'mailto'; href: string }
  | { kind: 'iframe'; src: string }
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

export function buildBraveSearchUrl(query: string): string {
  const t = query.trim()
  if (!t) return BRAVE_HOME_URL
  return `brave://search?q=${encodeURIComponent(t)}`
}

export function parseBraveSearchQuery(url: string): string | null {
  if (!/^brave:\/\/search/i.test(url.trim())) return null
  try {
    const u = new URL(url.replace(/^brave:/i, 'https:'))
    return u.searchParams.get('q') ?? ''
  } catch {
    return null
  }
}

let tabCounter = 0

/** New-tab search: URLs, brave/mailto schemes, or web search. */
export function searchQueryToUrl(input: string): string {
  const t = input.trim()
  if (!t) return 'brave://newtab'
  if (/^brave:\/\//i.test(t) || /^mailto:/i.test(t)) return t
  if (/^https?:\/\//i.test(t)) return t
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/i.test(t) && !t.includes(' ')) return `https://${t}`
  return buildBraveSearchUrl(t)
}

export const BRAVE_NEW_TAB_LINKS: {
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
    url: 'brave://about',
    hint: 'This site',
    favicon: 'home',
  },
  {
    label: 'GitHub',
    url: 'https://github.com',
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

export function createHomeTab(): BraveTab {
  return {
    id: createTabId(),
    title: 'Home',
    url: BRAVE_HOME_URL,
    favicon: 'home',
    isHome: true,
  }
}

export function tabTitleFor(url: string, isHome?: boolean): string {
  if (isHome && url === BRAVE_HOME_URL) return 'Home'
  return titleForUrl(url)
}

export function tabFaviconFor(url: string, isHome?: boolean): TabFavicon {
  if (isHome && url === BRAVE_HOME_URL) return 'home'
  return faviconForUrl(url)
}

/** Canonical form for deduping “same page” across tabs. */
export function normalizeTabUrl(url: string): string {
  const t = url.trim()
  if (!t || t === BRAVE_HOME_URL || t === 'about:blank') return BRAVE_HOME_URL
  if (t === 'brave://about' || t === 'portfolio://about') return 'brave://about'
  const searchQ = parseBraveSearchQuery(t)
  if (searchQ !== null) return buildBraveSearchUrl(searchQ)
  if (/^mailto:/i.test(t)) return t.toLowerCase()
  if (/^brave:/i.test(t)) return t.toLowerCase()

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

export function resolveBravePage(url: string): BravePage {
  const trimmed = url.trim()
  if (!trimmed || trimmed === 'brave://newtab' || trimmed === 'about:blank') {
    return { kind: 'newtab' }
  }
  if (trimmed === 'brave://about' || trimmed === 'portfolio://about') {
    return { kind: 'about' }
  }
  const searchQuery = parseBraveSearchQuery(trimmed)
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
    return { kind: 'comingsoon' }
  }
  return { kind: 'newtab' }
}

export function defaultBraveTabs(): BraveTab[] {
  return [
    createHomeTab(),
    {
      id: createTabId(),
      title: 'LinkedIn',
      url: LINKEDIN_PROFILE_URL,
      favicon: 'linkedin',
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
  if (url === 'brave://about') return 'About'
  const searchQ = parseBraveSearchQuery(url)
  if (searchQ !== null) {
    const short = searchQ.length > 22 ? `${searchQ.slice(0, 22)}…` : searchQ
    return short ? `Search: ${short}` : 'Search'
  }
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, '') || url
  } catch {
    return url
  }
}

export function faviconForUrl(url: string): TabFavicon {
  if (url === 'brave://newtab') return 'brave'
  if (url === 'brave://about') return 'home'
  if (url.includes('github')) return 'github'
  if (url.includes('linkedin')) return 'linkedin'
  if (url.includes('mailto:')) return 'mail'
  return 'globe'
}
