import { type ReactNode } from 'react'
import type { TabFavicon } from './browserAppModel'

type IconProps = {
  size?: number
  className?: string
}

const GITHUB_MARK =
  'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'

const LINKEDIN_MARK =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.126 0 2.063 2.063 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'

function Svg({
  size = 16,
  className,
  children,
  viewBox = '0 0 24 24',
  fill = 'none',
}: IconProps & { children: ReactNode; viewBox?: string; fill?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={viewBox}
      fill={fill}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  )
}

/** New-tab / default browser tab mark. */
export function BrowserLogoMark({ size = 24, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M4.5 7.5h15M4.5 7.5A2.25 2.25 0 0 0 6.75 5.25h10.5A2.25 2.25 0 0 1 19.5 7.5v9a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 16.5v-9Z"
      />
      <path stroke="currentColor" strokeLinecap="round" strokeWidth={1.75} d="M8.25 10.5h7.5" />
    </Svg>
  )
}

export function ShieldBadge({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#fb542b"
        d="M12 1.5 4.5 4.2v6.1c0 4.6 3.2 8.9 7.5 9.7 4.3-.8 7.5-5.1 7.5-9.7V4.2L12 1.5z"
      />
      <path
        fill="#fff"
        d="M12 5.8 7.8 7.4v3.2c0 2.6 1.8 5 4.2 5.5 2.4-.5 4.2-2.9 4.2-5.5V7.4L12 5.8z"
      />
    </svg>
  )
}

export function ShieldIcon({ size = 14, className }: IconProps) {
  return (
    <Svg size={size} className={className} fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516 11.209 11.209 0 01-7.877-3.08z"
      />
    </Svg>
  )
}

/* Heroicons 24 outline — toolbar & chrome */
export function ChevronLeftIcon({ size = 16 }: IconProps) {
  return (
    <Svg size={size}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M15.75 19.5 8.25 12l7.5-7.5"
      />
    </Svg>
  )
}

export function ChevronRightIcon({ size = 16 }: IconProps) {
  return (
    <Svg size={size}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="m8.25 4.5 7.5 7.5-7.5 7.5"
      />
    </Svg>
  )
}

export function SearchIcon({ size = 18, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </Svg>
  )
}

export function ReloadIcon({ size = 16 }: IconProps) {
  return (
    <Svg size={size}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </Svg>
  )
}

export function PlusIcon({ size = 16 }: IconProps) {
  return (
    <Svg size={size}>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.5v15m7.5-7.5h-15" />
    </Svg>
  )
}

export function CloseIcon({ size = 12 }: IconProps) {
  return (
    <Svg size={size}>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18 18 6M6 6l12 12" />
    </Svg>
  )
}

export function LockIcon({ size = 14, className }: IconProps) {
  return (
    <Svg size={size} className={className} fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
      />
    </Svg>
  )
}

export function FolderIcon({ size = 16 }: IconProps) {
  return (
    <Svg size={size} fill="currentColor">
      <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-9.75a1.5 1.5 0 0 1-1.06-.44l-1.72-1.72A1.5 1.5 0 0 0 11.25 7.5H4.875a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h15.5Z" />
    </Svg>
  )
}

export function GithubIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d={GITHUB_MARK} />
    </svg>
  )
}

export function LinkedinIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d={LINKEDIN_MARK} />
    </svg>
  )
}

export function MailIcon({ size = 16 }: IconProps) {
  return (
    <Svg size={size} fill="currentColor">
      <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
      <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
    </Svg>
  )
}

export function HomeIcon({ size = 16 }: IconProps) {
  return (
    <Svg size={size} fill="currentColor">
      <path
        d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z"
      />
      <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
    </Svg>
  )
}

export function GlobeIcon({ size = 16 }: IconProps) {
  return (
    <Svg size={size}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
      />
    </Svg>
  )
}

const FAVICON_SIZE = 15

export function TabFaviconIcon({ kind }: { kind: TabFavicon }) {
  const icon = (() => {
    switch (kind) {
      case 'browser':
        return <BrowserLogoMark size={FAVICON_SIZE} />
      case 'github':
        return <GithubIcon size={FAVICON_SIZE} />
      case 'linkedin':
        return <LinkedinIcon size={FAVICON_SIZE} />
      case 'mail':
        return <MailIcon size={FAVICON_SIZE} />
      case 'home':
        return <HomeIcon size={FAVICON_SIZE} />
      case 'globe':
        return <GlobeIcon size={FAVICON_SIZE} />
      default:
        return <GlobeIcon size={FAVICON_SIZE} />
    }
  })()

  return <span className={`browser-favicon browser-favicon--${kind}`} aria-hidden>{icon}</span>
}
