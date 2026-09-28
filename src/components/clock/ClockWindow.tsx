import { CLOCK_FACES } from '../../clock/clockFaces'
import { useClockWidget } from '../../context/ClockWidgetContext'
import { useDraggableWindow, type WindowPoint } from '../../hooks/useDraggableWindow'
import { ClockWidgetFace } from './ClockWidgetFace'
import './ClockWindow.css'

type Props = {
  windowId: string
  zIndex: number
  position: WindowPoint
  onPositionChange: (point: WindowPoint) => void
  onFocus: () => void
  onClose: () => void
}

export function ClockWindow({
  windowId,
  zIndex,
  position,
  onPositionChange,
  onFocus,
  onClose,
}: Props) {
  const { titleBarProps } = useDraggableWindow(position, onPositionChange)
  const { faceId, setFaceId, timeFormat, setTimeFormat, showSeconds, setShowSeconds } = useClockWidget()
  const active = CLOCK_FACES.find((f) => f.id === faceId) ?? CLOCK_FACES[0]

  return (
    <div
      className="clock-app-window"
      style={{ left: position.x, top: position.y, zIndex }}
      role="dialog"
      aria-label="Clock"
      data-window-id={windowId}
      onPointerDown={onFocus}
    >
      <header
        className="clock-app-window__titlebar"
        {...titleBarProps}
        style={{ touchAction: 'none', cursor: 'grab' }}
      >
        <button type="button" className="clock-app-window__traffic" onClick={onClose} aria-label="Close">
          <span className="clock-app-window__dot clock-app-window__dot--close" />
          <span className="clock-app-window__dot clock-app-window__dot--min" />
          <span className="clock-app-window__dot clock-app-window__dot--max" />
        </button>
        <span className="clock-app-window__title">Clock</span>
      </header>

      <div className="clock-app-window__body">
        <div className="clock-app-window__sidebar">
          <section className="clock-app-window__preview" aria-label="Widget preview">
            <ClockWidgetFace size="preview" />
            <p className="clock-app-window__preview-caption">Desktop widget preview</p>
          </section>

          <section className="clock-app-window__format" aria-labelledby="clock-format-heading">
            <h2 id="clock-format-heading" className="clock-app-window__section-title">Time format</h2>
            <div className="clock-app-window__format-toggle" role="group" aria-label="Time format">
              <button
                type="button"
                className={`clock-app-window__format-btn${timeFormat === '12' ? ' clock-app-window__format-btn--active' : ''}`}
                onClick={() => setTimeFormat('12')}
                aria-pressed={timeFormat === '12'}
              >
                12-hour
              </button>
              <button
                type="button"
                className={`clock-app-window__format-btn${timeFormat === '24' ? ' clock-app-window__format-btn--active' : ''}`}
                onClick={() => setTimeFormat('24')}
                aria-pressed={timeFormat === '24'}
              >
                24-hour
              </button>
            </div>
          </section>

          <section className="clock-app-window__option" aria-labelledby="clock-seconds-heading">
            <div className="clock-app-window__option-row">
              <div>
                <h2 id="clock-seconds-heading" className="clock-app-window__section-title">Show seconds</h2>
                <p className="clock-app-window__option-hint">Add a seconds hand on the widget</p>
              </div>
              <button
                type="button"
                className={`clock-app-window__toggle${showSeconds ? ' clock-app-window__toggle--on' : ''}`}
                role="switch"
                aria-checked={showSeconds}
                aria-labelledby="clock-seconds-heading"
                onClick={() => setShowSeconds(!showSeconds)}
              >
                <span className="clock-app-window__toggle-knob" />
              </button>
            </div>
          </section>
        </div>

        <section className="clock-app-window__faces" aria-labelledby="clock-faces-heading">
          <h2 id="clock-faces-heading" className="clock-app-window__section-title">Clock face</h2>
          <p className="clock-app-window__section-hint">{active.description}</p>
          <ul className="clock-app-window__face-grid">
            {CLOCK_FACES.map((face) => {
              const selected = face.id === faceId
              return (
                <li key={face.id}>
                  <button
                    type="button"
                    className={`clock-app-window__face-btn${selected ? ' clock-app-window__face-btn--selected' : ''}`}
                    onClick={() => setFaceId(face.id)}
                    aria-pressed={selected}
                  >
                    <span className="clock-app-window__face-thumb">
                      <ClockWidgetFace size="widget" faceId={face.id} staticHands />
                    </span>
                    <span className="clock-app-window__face-label">{face.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}
