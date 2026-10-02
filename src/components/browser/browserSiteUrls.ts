import { normalizeBrowserSchemeUrl } from './browserAppModel'
import { GITHUB_PROFILE_URL } from './githubProfile'

export const GITHUB_PROFILE_USERNAME = 'weshaan'

/** Any github.com URL maps to the in-browser profile page. */
export function canonicalGitHubUrl(url: string): string {
  return isGitHubSiteUrl(url) ? GITHUB_PROFILE_URL : url
}

export function parseHttpUrl(url: string): URL | null {
  const trimmed = normalizeBrowserSchemeUrl(url)
  if (!/^https?:\/\//i.test(trimmed)) return null
  try {
    return new URL(trimmed)
  } catch {
    return null
  }
}

export function isLinkedInSiteUrl(url: string): boolean {
  const parsed = parseHttpUrl(url)
  if (!parsed) return false
  const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
  return host === 'linkedin.com'
}

export function isGitHubSiteUrl(url: string): boolean {
  const parsed = parseHttpUrl(url)
  if (!parsed) return false
  const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
  return host === 'github.com'
}

export function linkedInPath(url: string): string {
  const parsed = parseHttpUrl(url)
  if (!parsed) return '/'
  let path = parsed.pathname
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
  return path || '/'
}

