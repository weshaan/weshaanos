import { formatWidgetTime } from '../../clock/clockFormat'
import type { ClockFaceId } from '../../clock/clockFaces'
import { getClockFaceTraits } from '../../clock/clockFaces'
import { useClockWidget } from '../../context/ClockWidgetContext'
import { useClock } from '../../hooks/useClock'
import { useSecondHandRotation } from '../../hooks/useSecondHandRotation'
import './ClockWidgetFace.css'

type Props = {
  /** Larger preview in the Clock app */
  size?: 'widget' | 'preview'
  /** Override face (picker highlight) */
  faceId?: ClockFaceId
  /** Face picker thumbnails — no rotating second hand */
  staticHands?: boolean
}

export function ClockWidgetFace({ size = 'widget', faceId: faceIdOverride, staticHands = false }: Props) {
  const { faceId: savedFaceId, timeFormat, showSeconds: showSecondsPref } = useClockWidget()
  const faceId = faceIdOverride ?? savedFaceId
  const traits = getClockFaceTraits(faceId)
  const { now, seconds } = useClock()
  const widgetTime = formatWidgetTime(now, timeFormat)
  const secondHandRotation = useSecondHandRotation(seconds)
  const showSecondsHand = showSecondsPref && !traits.noSeconds && !staticHands

  return (
    <div
      className={[
        'clock-widget-face',
        `clock-widget-face--${faceId}`,
        size === 'widget' && timeFormat === '24' ? 'clock-widget-face--format-24' : '',
        size === 'preview' ? 'clock-widget-face--preview' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {traits.overlay && (
        <div className={`clock-widget-face__overlay clock-widget-face__overlay--${traits.overlay}`} aria-hidden />
      )}
      {traits.ticks && <div className="clock-widget-face__ticks" aria-hidden />}
      {showSecondsHand && (
        <div
          className="clock-widget-face__seconds"
          style={{ transform: `rotate(${secondHandRotation}deg)` }}
          aria-hidden
        >
          <span className="clock-widget-face__seconds-dot" />
        </div>
      )}
      <time className="clock-widget-face__time" dateTime={now.toISOString()}>
        {widgetTime}
      </time>
    </div>
  )
}
