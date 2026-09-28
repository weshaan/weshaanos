import refreshCwSvg from '../../assets/weather/refresh-cw.svg?raw'

type Props = {
  size?: number
  className?: string
}

/** Lucide `refresh-cw` — see src/assets/weather/refresh-cw.svg */
export function RefreshIcon({ size = 16, className }: Props) {
  const svg = refreshCwSvg.replace(/<svg\b/, `<svg width="${size}" height="${size}"`)

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', lineHeight: 0, color: 'currentColor' }}
      dangerouslySetInnerHTML={{ __html: svg }}
      aria-hidden
    />
  )
}
