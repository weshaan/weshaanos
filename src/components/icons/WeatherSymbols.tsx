export function PartlyCloudyIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="9" cy="9" r="4" fill="#fcd34d" />
      <path
        d="M6 17h11a4 4 0 00.4-8 5.5 5.5 0 00-10.6 1.8A3.5 3.5 0 006 17z"
        fill="rgba(255,255,255,0.9)"
      />
    </svg>
  )
}

export function CloudIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M6 18h12a4 4 0 00.3-8 5.5 5.5 0 00-10.5 2.2A3.5 3.5 0 006 18z"
        fill="rgba(255,255,255,0.88)"
      />
    </svg>
  )
}

export function MoonIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M14 4a7 7 0 108 8 6 6 0 01-8-8z"
        fill="rgba(255,255,255,0.85)"
      />
    </svg>
  )
}

export function SunIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="4.5" fill="#fcd34d" />
    </svg>
  )
}

export function RainIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M6 14h12a4 4 0 00.3-7.5 5 5 0 00-9.6 1.5A3.5 3.5 0 006 14z"
        fill="rgba(255,255,255,0.88)"
      />
      <path
        d="M8 17.5v2M12 16.5v2.5M16 17.5v2"
        stroke="rgba(147,197,253,0.95)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SnowIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M6 14h12a4 4 0 00.3-7.5 5 5 0 00-9.6 1.5A3.5 3.5 0 006 14z"
        fill="rgba(255,255,255,0.88)"
      />
      <circle cx="9" cy="18" r="0.9" fill="#fff" />
      <circle cx="12" cy="19" r="0.9" fill="#fff" />
      <circle cx="15" cy="18" r="0.9" fill="#fff" />
    </svg>
  )
}

export function ThunderIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M6 13h12a4 4 0 00.3-7.5 5 5 0 00-9.6 1.5A3.5 3.5 0 006 13z"
        fill="rgba(255,255,255,0.75)"
      />
      <path d="M13 14h-2.5l1.5 4.5h2L12 21l4-7h-3z" fill="#fcd34d" />
    </svg>
  )
}
