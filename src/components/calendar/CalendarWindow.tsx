import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { eventsOnDate } from '../../calendar/calendarEvents'
import { addMonths, buildMonthGrid, isSameDay, weekdayLabels } from '../../calendar/monthGrid'
import { useClock } from '../../hooks/useClock'
import { WindowBottomDragHandle } from '../desktop/WindowBottomDragHandle'
import { useDraggableWindow, type WindowPoint } from '../../hooks/useDraggableWindow'
import './CalendarWindow.css'

type Props = {
  windowId: string
  zIndex: number
  position: WindowPoint
  onPositionChange: (point: WindowPoint) => void
  onFocus: () => void
  onClose: () => void
}

type PickerMode = 'month' | 'year' | null

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

const YEAR_WHEEL_START = 1980
const YEAR_WHEEL_END = 2040

function yearsInWheel(): number[] {
  const years: number[] = []
  for (let y = YEAR_WHEEL_START; y <= YEAR_WHEEL_END; y++) years.push(y)
  return years
}

const WHEEL_YEARS = yearsInWheel()

export function CalendarWindow({
  windowId,
  zIndex,
  position,
  onPositionChange,
  onFocus,
  onClose,
}: Props) {
  const { titleBarProps, dragHandleProps } = useDraggableWindow(position, onPositionChange)
  const { now } = useClock()
  const yearGridRef = useRef<HTMLDivElement>(null)
  const viewYearRef = useRef(now.getFullYear())

  const [view, setView] = useState(() => ({
    year: now.getFullYear(),
    month: now.getMonth(),
  }))
  const [selectedIso, setSelectedIso] = useState<string | null>(null)
  const [picker, setPicker] = useState<PickerMode>(null)

  const monthLabel = useMemo(
    () =>
      new Date(view.year, view.month, 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    [view.year, view.month],
  )

  const weeks = useMemo(() => buildMonthGrid(view.year, view.month), [view.year, view.month])
  const selectedEvents = useMemo(
    () => (selectedIso ? eventsOnDate(selectedIso) : []),
    [selectedIso],
  )

  viewYearRef.current = view.year

  const scrollYearIntoView = useCallback((year: number, behavior: ScrollBehavior = 'smooth') => {
    const el = yearGridRef.current
    if (!el) return
    const btn = el.querySelector<HTMLElement>(`[data-year="${year}"]`)
    btn?.scrollIntoView({ block: 'center', behavior })
  }, [])

  useLayoutEffect(() => {
    if (picker !== 'year') return
    scrollYearIntoView(viewYearRef.current, 'instant')
  }, [picker, scrollYearIntoView])

  const goMonth = (delta: number) => {
    setView((v) => addMonths(v.year, v.month, delta))
  }

  const selectMonth = (monthIndex: number) => {
    setView((v) => ({ ...v, month: monthIndex }))
    setPicker(null)
  }

  const selectYear = (year: number) => {
    setView((v) => ({ ...v, year }))
    setPicker(null)
  }

  const togglePicker = (mode: 'month' | 'year') => {
    setPicker((p) => (p === mode ? null : mode))
  }

  return (
    <div
      className="calendar-app-window"
      style={{ left: position.x, top: position.y, zIndex }}
      role="dialog"
      aria-label="Calendar"
      data-window-id={windowId}
      onPointerDown={onFocus}
    >
      <header
        className="calendar-app-window__titlebar"
        {...titleBarProps}
        style={{ touchAction: 'none', cursor: 'grab' }}
      >
        <button type="button" className="calendar-app-window__traffic" onClick={onClose} aria-label="Close">
          <span className="calendar-app-window__dot calendar-app-window__dot--close" />
          <span className="calendar-app-window__dot calendar-app-window__dot--min" />
          <span className="calendar-app-window__dot calendar-app-window__dot--max" />
        </button>
        <span className="calendar-app-window__title">Calendar</span>
      </header>

      <div className="calendar-app-window__body">
        <div className="calendar-app-window__nav">
          <button
            type="button"
            className="calendar-app-window__nav-btn"
            onClick={() => goMonth(-1)}
            disabled={picker !== null}
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            type="button"
            className={`calendar-app-window__month${picker !== null ? ' calendar-app-window__month--picker-open' : ''}`}
            onClick={() => {
              if (picker !== null) setPicker(null)
            }}
            aria-label={picker !== null ? 'Back to calendar' : monthLabel}
          >
            {monthLabel}
          </button>
          <button
            type="button"
            className="calendar-app-window__nav-btn"
            onClick={() => goMonth(1)}
            disabled={picker !== null}
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        <div className="calendar-app-window__mode" role="tablist" aria-label="Calendar view">
          <button
            type="button"
            role="tab"
            aria-selected={picker === 'month'}
            className={`calendar-app-window__mode-btn${picker === 'month' ? ' calendar-app-window__mode-btn--active' : ''}`}
            onClick={() => togglePicker('month')}
          >
            Month
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={picker === 'year'}
            className={`calendar-app-window__mode-btn${picker === 'year' ? ' calendar-app-window__mode-btn--active' : ''}`}
            onClick={() => togglePicker('year')}
          >
            Year
          </button>
        </div>

        <div className="calendar-app-window__main">
          {picker === 'month' && (
            <div className="calendar-app-window__month-picker" role="listbox" aria-label="Choose month">
              {MONTH_SHORT.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  role="option"
                  aria-selected={view.month === index}
                  className={`calendar-app-window__month-cell${view.month === index ? ' calendar-app-window__month-cell--selected' : ''}`}
                  onClick={() => selectMonth(index)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {picker === 'year' && (
            <div
              className="calendar-app-window__year-grid"
              ref={yearGridRef}
              role="listbox"
              aria-label="Choose year"
            >
              {WHEEL_YEARS.map((y) => (
                <button
                  key={y}
                  type="button"
                  role="option"
                  data-year={y}
                  aria-selected={view.year === y}
                  className={`calendar-app-window__year-cell${view.year === y ? ' calendar-app-window__year-cell--selected' : ''}`}
                  onClick={() => selectYear(y)}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          {picker === null && (
            <div className="calendar-app-window__days">
              <div className="calendar-app-window__weekdays" aria-hidden>
                {weekdayLabels().map((label, i) => (
                  <span key={`${label}-${i}`} className="calendar-app-window__weekday">{label}</span>
                ))}
              </div>

              <div className="calendar-app-window__grid" role="grid" aria-label={monthLabel}>
                {weeks.flat().map((cell) => {
                  const isToday = isSameDay(cell.date, now)
                  const isSelected = cell.iso === selectedIso
                  return (
                    <button
                      key={cell.iso}
                      type="button"
                      role="gridcell"
                      className={[
                        'calendar-app-window__day',
                        !cell.inMonth ? 'calendar-app-window__day--outside' : '',
                        isToday ? 'calendar-app-window__day--today' : '',
                        isSelected ? 'calendar-app-window__day--selected' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => setSelectedIso(cell.iso)}
                      aria-pressed={isSelected ? true : undefined}
                      aria-label={cell.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    >
                      <span className="calendar-app-window__day-num">{cell.date.getDate()}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="calendar-app-window__footer" aria-hidden={picker !== null}>
          {picker === null &&
            (selectedEvents.length === 0 ? (
              <p className="calendar-app-window__empty">No events</p>
            ) : (
              <ul className="calendar-app-window__events">
                {selectedEvents.map((ev) => (
                  <li key={`${ev.date}-${ev.title}`} className="calendar-app-window__event">
                    <span className="calendar-app-window__event-title">{ev.title}</span>
                  </li>
                ))}
              </ul>
            ))}
        </div>
      </div>
      <WindowBottomDragHandle dragHandleProps={dragHandleProps} />
    </div>
  )
}
