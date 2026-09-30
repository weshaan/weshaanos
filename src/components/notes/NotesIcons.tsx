type IconProps = { size?: number; className?: string }

/** Matches Finder toolbar: 18×18 art, rendered at 21px. */
const SW = 1.2

/** Finder “Bin” geometry, scaled to match other 18×18 toolbar icons. */
export function NotesClearIcon({ size = 21, className }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" width={size} height={size} className={className} aria-hidden>
      <g transform="translate(9 8.2) scale(1.32) translate(-8 -8)">
        <path
          d="M5.5 5.5h5l-.5 7.5H6L5.5 5.5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.05"
          strokeLinejoin="round"
        />
        <path d="M4 5.5h8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        <path
          d="M6.5 5.5V4.5h3v1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.05"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

export function NotesCopyIcon({ size = 21, className }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" width={size} height={size} className={className} aria-hidden>
      <rect
        x="3.25"
        y="5.75"
        width="8.5"
        height="9.5"
        rx="1.25"
        fill="none"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path
        d="M6.25 2.75h8.5A1.25 1.25 0 0 1 16 4v8.5A1.25 1.25 0 0 1 14.75 13.75H12"
        fill="none"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function NotesDownloadIcon({ size = 21, className }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" width={size} height={size} className={className} aria-hidden>
      <path
        d="M9 3.35v6.9"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <path
        d="m6.15 7.55 2.85 2.85 2.85-2.85"
        fill="none"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.25 12.35h7.5a1.15 1.15 0 0 1 1.15 1.15v.6H4.1v-.6a1.15 1.15 0 0 1 1.15-1.15z"
        fill="none"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Same geometry as Finder toolbar search. */
export function NotesSearchIcon({ size = 21, className }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" width={size} height={size} className={className} aria-hidden>
      <circle cx="8" cy="8" r="4.2" fill="none" stroke="currentColor" strokeWidth={SW} />
      <path d="M11.2 11.2 14 14" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
    </svg>
  )
}

export function NotesSidebarMoreIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" width={size} height={size} className={className} aria-hidden>
      <circle cx="4.5" cy="9" r="1.1" fill="currentColor" />
      <circle cx="9" cy="9" r="1.1" fill="currentColor" />
      <circle cx="13.5" cy="9" r="1.1" fill="currentColor" />
    </svg>
  )
}

export function NotesChevronUpIcon({ size = 21, className }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" width={size} height={size} className={className} aria-hidden>
      <path
        d="m5.25 10.5 3.75-3.75 3.75 3.75"
        fill="none"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function NotesChevronDownIcon({ size = 21, className }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" width={size} height={size} className={className} aria-hidden>
      <path
        d="m5.25 7.5 3.75 3.75 3.75-3.75"
        fill="none"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function NotesSearchClearIcon({ size = 10, className }: IconProps) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} className={className} aria-hidden>
      <path
        d="M3.25 3.25 8.75 8.75M8.75 3.25 3.25 8.75"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  )
}
