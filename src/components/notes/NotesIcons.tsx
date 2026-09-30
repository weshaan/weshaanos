type IconProps = { size?: number; className?: string }

export function NotesComposeIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} aria-hidden>
      <path
        d="M5.5 14.5 14 6l1.5 1.5-8.5 8.5H5.5V14.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path d="M12 5.5 14.5 8" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <rect x="4" y="3" width="12" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

export function NotesTextStyleIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} aria-hidden>
      <text x="3" y="14" fontSize="11" fontWeight="600" fill="currentColor" fontFamily="inherit">Aa</text>
    </svg>
  )
}

export function NotesChecklistIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} aria-hidden>
      <circle cx="5" cy="6" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9 6h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="5" cy="11" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9 11h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="5" cy="16" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9 16h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function NotesTableIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} aria-hidden>
      <rect x="4" y="4" width="12" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 9h12M4 14h12M10 4v12" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  )
}

export function NotesAttachIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} aria-hidden>
      <path
        d="M7.5 11.5 12.5 6.5a2.5 2.5 0 0 1 3.5 3.5L9 17a4 4 0 0 1-5.5-5.5l6-6a5.5 5.5 0 0 1 7.8 7.8l-6.2 6.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function NotesMarkupIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} aria-hidden>
      <path
        d="M4 14c2-4 4-6 6-8 2 2 4 4 6 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function NotesShareIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} aria-hidden>
      <path d="M10 4v9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="m7 7 3-3 3 3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <rect x="5" y="11" width="10" height="6" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

export function NotesMoreIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} aria-hidden>
      <circle cx="5" cy="10" r="1.2" fill="currentColor" />
      <circle cx="10" cy="10" r="1.2" fill="currentColor" />
      <circle cx="15" cy="10" r="1.2" fill="currentColor" />
    </svg>
  )
}

export function NotesSearchIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} aria-hidden>
      <circle cx="9" cy="9" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M12.5 12.5 16 16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function NotesSidebarMoreIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} aria-hidden>
      <circle cx="5" cy="10" r="1.15" fill="currentColor" />
      <circle cx="10" cy="10" r="1.15" fill="currentColor" />
      <circle cx="15" cy="10" r="1.15" fill="currentColor" />
    </svg>
  )
}
