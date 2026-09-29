import { useCallback, useEffect, useRef, useState } from 'react'
import { dockApps } from './dock/dockApps'
import { DockIcon } from './DockIcon'
import './Dock.css'

const ICON = 46
const MAX_SCALE = 1.72
/** Wider Gaussian falloff — ~5 icons (center + 2 each side) form a smooth hill. */
const MAG_SIGMA = 58

type Props = {
  onAppClick: (id: string) => void
}

export function Dock({ onAppClick }: Props) {
  const railRef = useRef<HTMLDivElement>(null)
  const mouseXRef = useRef<number | null>(null)
  const [scales, setScales] = useState(() => dockApps.map(() => 1))
  const [tooltip, setTooltip] = useState<string | null>(null)
  const [hovered, setHovered] = useState(false)

  const updateScales = useCallback((clientX: number | null) => {
    const rail = railRef.current
    if (!rail || clientX === null) {
      setScales(dockApps.map(() => 1))
      return
    }

    const buttons = rail.querySelectorAll<HTMLElement>('.dock__btn')
    setScales(
      Array.from(buttons).map((btn) => {
        const rect = btn.getBoundingClientRect()
        const center = rect.left + rect.width / 2
        const d = Math.abs(clientX - center)
        const eased = Math.exp(-0.5 * (d / MAG_SIGMA) ** 2)
        return 1 + (MAX_SCALE - 1) * eased
      }),
    )
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (mouseXRef.current !== null) updateScales(mouseXRef.current)
    })
    return () => cancelAnimationFrame(id)
  }, [hovered, updateScales])

  const handleLeave = () => {
    mouseXRef.current = null
    setHovered(false)
    setScales(dockApps.map(() => 1))
    setTooltip(null)
  }

  return (
    <div
      className="dock-scene"
      onMouseEnter={() => setHovered(true)}
      onMouseMove={(e) => {
        mouseXRef.current = e.clientX
        updateScales(e.clientX)
      }}
      onMouseLeave={handleLeave}
    >
      <div ref={railRef} className={hovered ? 'dock dock--hovered' : 'dock'}>
        <ul className="dock__list">
          {dockApps.map((app, i) => {
            const scale = scales[i] ?? 1
            const slotWidth = ICON * scale
            const lift = (scale - 1) * 22

            return (
              <li key={app.id} className={app.separatorBefore ? 'dock__item dock__item--sep' : 'dock__item'}>
                {app.separatorBefore && <span className="dock__divider" aria-hidden />}
                <button
                  type="button"
                  className="dock__btn"
                  style={{ width: slotWidth, height: ICON }}
                  onMouseEnter={() => setTooltip(app.id)}
                  onMouseLeave={() => setTooltip(null)}
                  onFocus={() => setTooltip(app.id)}
                  onBlur={() => setTooltip(null)}
                  onClick={() => onAppClick(app.id)}
                >
                  <span
                    className="dock__btn-core"
                    style={{
                      transform: `translate3d(0, ${-lift}px, 0) scale(${scale})`,
                    }}
                  >
                    {tooltip === app.id && <span className="dock__label">{app.label}</span>}
                    <DockIcon src={app.icon} label={app.label} />
                    {app.badge != null && <span className="dock__badge">{app.badge}</span>}
                    {app.running && <span className="dock__indicator" aria-hidden />}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
