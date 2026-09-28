import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  calendarChapters,
  defaultChapterIndex,
  type CalendarChapter,
  type ChapterMoment,
} from '../../calendar/chapterData'
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

function firstMoment(chapter: CalendarChapter): ChapterMoment {
  return chapter.moments[0]
}

export function CalendarWindow({
  windowId,
  zIndex,
  position,
  onPositionChange,
  onFocus,
  onClose,
}: Props) {
  const { titleBarProps } = useDraggableWindow(position, onPositionChange)
  const stripRef = useRef<HTMLDivElement>(null)
  const chapterRefs = useRef<(HTMLElement | null)[]>([])

  const [chapterIndex, setChapterIndex] = useState(defaultChapterIndex)
  const [selected, setSelected] = useState<{ chapterId: string; momentId: string }>(() => {
    const ch = calendarChapters[defaultChapterIndex()]
    const m = firstMoment(ch)
    return { chapterId: ch.id, momentId: m.id }
  })

  const activeChapter = calendarChapters[chapterIndex]
  const activeMoment = useMemo(() => {
    const ch = calendarChapters.find((c) => c.id === selected.chapterId) ?? activeChapter
    return ch.moments.find((m) => m.id === selected.momentId) ?? firstMoment(ch)
  }, [selected, activeChapter])

  const scrollToChapter = useCallback((index: number, momentId?: string) => {
    const clamped = Math.max(0, Math.min(calendarChapters.length - 1, index))
    setChapterIndex(clamped)
    const el = chapterRefs.current[clamped]
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    const ch = calendarChapters[clamped]
    const m = momentId
      ? ch.moments.find((x) => x.id === momentId) ?? firstMoment(ch)
      : firstMoment(ch)
    setSelected({ chapterId: ch.id, momentId: m.id })
  }, [])

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return

    const onScroll = () => {
      const center = strip.scrollLeft + strip.clientWidth / 2
      let best = 0
      let bestDist = Infinity
      chapterRefs.current.forEach((el, i) => {
        if (!el) return
        const mid = el.offsetLeft + el.offsetWidth / 2
        const dist = Math.abs(center - mid)
        if (dist < bestDist) {
          bestDist = dist
          best = i
        }
      })
      if (best !== chapterIndex) {
        setChapterIndex(best)
        const ch = calendarChapters[best]
        const m = firstMoment(ch)
        setSelected({ chapterId: ch.id, momentId: m.id })
      }
    }

    strip.addEventListener('scroll', onScroll, { passive: true })
    return () => strip.removeEventListener('scroll', onScroll)
  }, [chapterIndex])

  useEffect(() => {
    const t = window.setTimeout(() => scrollToChapter(defaultChapterIndex()), 0)
    return () => window.clearTimeout(t)
  }, [scrollToChapter])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        scrollToChapter(chapterIndex - 1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        scrollToChapter(chapterIndex + 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [chapterIndex, scrollToChapter])

  const selectMoment = (chapter: CalendarChapter, moment: ChapterMoment) => {
    const idx = calendarChapters.findIndex((c) => c.id === chapter.id)
    if (idx >= 0) scrollToChapter(idx, moment.id)
    else setSelected({ chapterId: chapter.id, momentId: moment.id })
  }

  return (
    <div
      className="calendar-window"
      style={{ left: position.x, top: position.y, zIndex }}
      role="dialog"
      aria-label="Calendar chapters"
      data-window-id={windowId}
      onPointerDown={onFocus}
    >
      <header
        className="calendar-window__titlebar"
        {...titleBarProps}
        style={{ touchAction: 'none', cursor: 'grab' }}
      >
        <button type="button" className="calendar-window__traffic" onClick={onClose} aria-label="Close">
          <span className="calendar-window__dot calendar-window__dot--close" />
          <span className="calendar-window__dot calendar-window__dot--min" />
          <span className="calendar-window__dot calendar-window__dot--max" />
        </button>
        <span className="calendar-window__title">Chapters</span>
      </header>

      <p className="calendar-window__hint">Scroll the strip · pick a day</p>

      <div className="calendar-window__strip-wrap">
        <div className="calendar-window__strip" ref={stripRef}>
          {calendarChapters.map((chapter, i) => (
            <article
              key={chapter.id}
              ref={(el) => {
                chapterRefs.current[i] = el
              }}
              className={`calendar-chapter${i === chapterIndex ? ' calendar-chapter--active' : ''}`}
              aria-current={i === chapterIndex ? 'true' : undefined}
            >
              <div
                className="calendar-chapter__cover"
                style={{
                  background: `linear-gradient(145deg, ${chapter.cover.from} 0%, ${chapter.cover.via} 45%, ${chapter.cover.to} 100%)`,
                }}
              >
                <span className="calendar-chapter__period">{chapter.period}</span>
                <h2 className="calendar-chapter__name">{chapter.title}</h2>
                <p className="calendar-chapter__subtitle">{chapter.subtitle}</p>
              </div>
              <div className="calendar-chapter__moments">
                {chapter.moments.map((moment) => {
                  const isSelected =
                    selected.chapterId === chapter.id && selected.momentId === moment.id
                  return (
                    <button
                      key={moment.id}
                      type="button"
                      className={`calendar-moment-btn${isSelected ? ' calendar-moment-btn--selected' : ''}`}
                      onClick={() => selectMoment(chapter, moment)}
                    >
                      {moment.label}
                    </button>
                  )
                })}
              </div>
            </article>
          ))}
        </div>

        <nav className="calendar-window__nav" aria-label="Chapter navigation">
          <button
            type="button"
            className="calendar-window__nav-btn"
            disabled={chapterIndex <= 0}
            onClick={() => scrollToChapter(chapterIndex - 1)}
            aria-label="Previous chapter"
          >
            ‹
          </button>
          <div className="calendar-window__nav-dots">
            {calendarChapters.map((ch, i) => (
              <button
                key={ch.id}
                type="button"
                className={`calendar-window__nav-dot${i === chapterIndex ? ' calendar-window__nav-dot--active' : ''}`}
                onClick={() => scrollToChapter(i)}
                aria-label={`${ch.period}: ${ch.title}`}
                aria-current={i === chapterIndex ? 'true' : undefined}
              />
            ))}
          </div>
          <button
            type="button"
            className="calendar-window__nav-btn"
            disabled={chapterIndex >= calendarChapters.length - 1}
            onClick={() => scrollToChapter(chapterIndex + 1)}
            aria-label="Next chapter"
          >
            ›
          </button>
        </nav>
      </div>

      <section className="calendar-window__detail" aria-live="polite">
        <span className="calendar-window__detail-date">{activeMoment.dateLine}</span>
        <h3 className="calendar-window__detail-title">{activeMoment.title}</h3>
        <p className="calendar-window__detail-body">{activeMoment.body}</p>
        {activeMoment.tags && activeMoment.tags.length > 0 && (
          <div className="calendar-window__tags">
            {activeMoment.tags.map((tag) => (
              <span key={tag} className="calendar-window__tag">{tag}</span>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
