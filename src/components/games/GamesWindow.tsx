import { useCallback, useEffect, useRef, useState } from 'react'
import { calendarChapters, defaultChapterIndex, type GameId } from '../../games/chapterData'
import { WindowBottomDragHandle } from '../desktop/WindowBottomDragHandle'
import { useDraggableWindow, type WindowPoint } from '../../hooks/useDraggableWindow'
import { WordleGame } from './wordle/WordleGame'
import './GamesWindow.css'
import './wordle/WordleGame.css'

type Props = {
  windowId: string
  zIndex: number
  position: WindowPoint
  onPositionChange: (point: WindowPoint) => void
  onFocus: () => void
  onClose: () => void
}

const SCROLL_MS_NAV = 520
const SCROLL_MS_OPEN = 1150
const STRIP_EDGE_GUTTER = 16
const GAME_SHELF_LEAVE_MS = 240
const GAME_VIEW_FADE_MS = 320

type EaseFn = (t: number) => number

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
}

/** Fast start, gentle stop — used for the Games open sweep. */
function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

function chapterScrollGoal(
  strip: HTMLElement,
  el: HTMLElement,
  index: number,
  lastIndex: number,
): number {
  const center = el.offsetLeft + el.offsetWidth / 2
  const ideal = center - strip.clientWidth / 2
  const max = Math.max(0, strip.scrollWidth - strip.clientWidth)
  let goal = Math.min(Math.max(0, ideal), max)

  if (index === lastIndex) {
    const rightWithGutter = el.offsetLeft + el.offsetWidth + STRIP_EDGE_GUTTER
    const maxForGutter = Math.max(0, rightWithGutter - strip.clientWidth)
    goal = Math.min(goal, maxForGutter)
  }

  return goal
}

export function GamesWindow({
  windowId,
  zIndex,
  position,
  onPositionChange,
  onFocus,
  onClose,
}: Props) {
  const { titleBarProps, dragHandleProps } = useDraggableWindow(position, onPositionChange)
  const stripRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const chapterRefs = useRef<(HTMLElement | null)[]>([])
  const chapterIndexRef = useRef(defaultChapterIndex())
  const programmaticScrollRef = useRef(false)
  const programmaticScrollTimerRef = useRef(0)
  const scrollAnimFrameRef = useRef(0)
  const [chapterIndex, setChapterIndex] = useState(defaultChapterIndex)
  const [introSweep, setIntroSweep] = useState(true)
  const [activeGame, setActiveGame] = useState<GameId | null>(null)
  const [gameLayout, setGameLayout] = useState(false)
  const [shellResizeSmooth, setShellResizeSmooth] = useState(false)
  const [shelfLeaving, setShelfLeaving] = useState(false)
  const [gameViewVisible, setGameViewVisible] = useState(false)
  const [shelfEnter, setShelfEnter] = useState(false)
  const gameTransitionTimerRef = useRef(0)

  const activeChapter = calendarChapters[chapterIndex]
  const activeDetail = activeChapter.detail
  const canPlay = activeChapter.gameId != null
  const stripThemeStyle = {
    '--chapter-from': activeChapter.cover.from,
    '--chapter-via': activeChapter.cover.via,
    '--chapter-to': activeChapter.cover.to,
  } as React.CSSProperties

  useEffect(() => {
    return () => window.clearTimeout(gameTransitionTimerRef.current)
  }, [])

  const openGame = useCallback((gameId: GameId) => {
    if (shelfLeaving || activeGame) return
    window.clearTimeout(gameTransitionTimerRef.current)
    setShelfEnter(false)
    setGameViewVisible(false)
    setShellResizeSmooth(true)
    setGameLayout(true)
    setShelfLeaving(true)
    gameTransitionTimerRef.current = window.setTimeout(() => {
      setActiveGame(gameId)
      setShelfLeaving(false)
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setGameViewVisible(true))
      })
    }, GAME_SHELF_LEAVE_MS)
  }, [activeGame, shelfLeaving])

  const closeGame = useCallback(() => {
    window.clearTimeout(gameTransitionTimerRef.current)
    setShellResizeSmooth(true)
    setGameViewVisible(false)
    gameTransitionTimerRef.current = window.setTimeout(() => {
      setActiveGame(null)
      setGameLayout(false)
      setShelfEnter(true)
      window.setTimeout(() => {
        setShellResizeSmooth(false)
        setShelfEnter(false)
      }, 440)
    }, GAME_VIEW_FADE_MS)
  }, [])

  const setStripScrollAnimating = useCallback((animating: boolean) => {
    stripRef.current?.classList.toggle('calendar-window__strip--animating', animating)
  }, [])

  const endProgrammaticScroll = useCallback(() => {
    programmaticScrollRef.current = false
    window.clearTimeout(programmaticScrollTimerRef.current)
    window.cancelAnimationFrame(scrollAnimFrameRef.current)
    scrollAnimFrameRef.current = 0
    setStripScrollAnimating(false)
  }, [setStripScrollAnimating])

  const scrollStripTo = useCallback(
    (
      left: number,
      durationMs: number,
      ease: EaseFn = easeInOutCubic,
      onComplete?: () => void,
    ) => {
      const strip = stripRef.current
      if (!strip) {
        endProgrammaticScroll()
        return
      }

      window.cancelAnimationFrame(scrollAnimFrameRef.current)
      programmaticScrollRef.current = true
      window.clearTimeout(programmaticScrollTimerRef.current)
      setStripScrollAnimating(true)

      const start = strip.scrollLeft
      const delta = left - start
      if (durationMs <= 0 || Math.abs(delta) < 1) {
        strip.scrollLeft = left
        endProgrammaticScroll()
        onComplete?.()
        return
      }

      const t0 = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / durationMs)
        const next = start + delta * ease(p)
        strip.scrollLeft = next
        if (p < 1) {
          scrollAnimFrameRef.current = window.requestAnimationFrame(tick)
        } else {
          scrollAnimFrameRef.current = 0
          strip.scrollLeft = left
          endProgrammaticScroll()
          window.requestAnimationFrame(() => {
            strip.scrollLeft = left
            onComplete?.()
          })
        }
      }
      scrollAnimFrameRef.current = window.requestAnimationFrame(tick)
    },
    [endProgrammaticScroll, setStripScrollAnimating],
  )

  const scrollStripToRef = useRef(scrollStripTo)
  scrollStripToRef.current = scrollStripTo
  const endProgrammaticScrollRef = useRef(endProgrammaticScroll)
  endProgrammaticScrollRef.current = endProgrammaticScroll

  const scrollToChapter = useCallback(
    (index: number, durationMs = SCROLL_MS_NAV, ease: EaseFn = easeInOutCubic) => {
      const clamped = Math.max(0, Math.min(calendarChapters.length - 1, index))

      chapterIndexRef.current = clamped
      setChapterIndex(clamped)

      const strip = stripRef.current
      const el = chapterRefs.current[clamped]
      if (strip && el) {
        scrollStripTo(
          chapterScrollGoal(strip, el, clamped, calendarChapters.length - 1),
          durationMs,
          ease,
        )
      } else {
        endProgrammaticScroll()
      }
    },
    [endProgrammaticScroll, scrollStripTo],
  )

  useEffect(() => {
    chapterIndexRef.current = chapterIndex
  }, [chapterIndex])

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return

    const onScroll = () => {
      if (programmaticScrollRef.current) return

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
      if (best === chapterIndexRef.current) return

      chapterIndexRef.current = best
      setChapterIndex(best)
    }

    strip.addEventListener('scroll', onScroll, { passive: true })
    return () => strip.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const firstIndex = 0
    const lastIndex = calendarChapters.length - 1

    let cancelled = false
    let teardownIntro: (() => void) | undefined
    let attempts = 0

    const runOpenIntro = (): boolean => {
      const strip = stripRef.current
      const firstEl = chapterRefs.current[firstIndex]
      const lastEl = chapterRefs.current[lastIndex]
      if (!strip || !firstEl || !lastEl) return false

      const goalFirst = chapterScrollGoal(strip, firstEl, firstIndex, lastIndex)
      const goalLast = chapterScrollGoal(strip, lastEl, lastIndex, lastIndex)

      const finishIntro = () => {
        strip.classList.remove('calendar-window__strip--open-intro')
        strip.scrollLeft = chapterScrollGoal(strip, firstEl, firstIndex, lastIndex)
        chapterIndexRef.current = firstIndex
        setChapterIndex(firstIndex)
        setIntroSweep(false)
      }

      if (goalLast - goalFirst < 1) {
        strip.scrollLeft = goalFirst
        finishIntro()
        return true
      }

      chapterIndexRef.current = firstIndex
      setChapterIndex(firstIndex)
      setIntroSweep(true)

      strip.scrollLeft = goalLast
      strip.classList.add('calendar-window__strip--open-intro', 'calendar-window__strip--animating')

      scrollStripToRef.current(goalFirst, SCROLL_MS_OPEN, easeOutCubic, finishIntro)

      teardownIntro = () => {
        endProgrammaticScrollRef.current()
        strip.classList.remove('calendar-window__strip--open-intro', 'calendar-window__strip--animating')
        strip.scrollLeft = goalFirst
        finishIntro()
      }

      return true
    }

    const tryStart = () => {
      if (cancelled) return
      if (runOpenIntro()) return
      attempts += 1
      if (attempts < 24) {
        window.requestAnimationFrame(tryStart)
      } else {
        setIntroSweep(false)
      }
    }

    window.requestAnimationFrame(tryStart)

    return () => {
      cancelled = true
      teardownIntro?.()
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeGame) return
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
  }, [chapterIndex, scrollToChapter, activeGame])

  return (
    <div
      className={`calendar-window${introSweep ? ' calendar-window--intro-sweep' : ''}${gameLayout ? ' calendar-window--wordle' : ''}${shellResizeSmooth ? ' calendar-window--game-resize' : ''}`}
      style={{ left: position.x, top: position.y, zIndex }}
      role="dialog"
      aria-label="Games"
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
        <span className="calendar-window__title">Games</span>
      </header>

      {activeGame ? (
        <div
          className={`calendar-window__body--wordle${gameViewVisible ? ' calendar-window__body--wordle--visible' : ''}`}
        >
          {activeGame === 'fivefold' ? <WordleGame onBack={closeGame} /> : null}
        </div>
      ) : null}
      {!activeGame ? (
        <div
          className={`calendar-window__shelf${shelfLeaving ? ' calendar-window__shelf--leave' : ''}${shelfEnter ? ' calendar-window__shelf--enter' : ''}`}
        >
      <p className="calendar-window__hint">Cooking new games — launching soon</p>

      <div className="calendar-window__strip-wrap">
        <div className="calendar-window__strip-stage" style={stripThemeStyle}>
          <div className="calendar-window__strip" ref={stripRef}>
          <div className="calendar-window__strip-track" ref={trackRef}>
            <span className="calendar-window__strip-gutter" aria-hidden />
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
                  className={`calendar-chapter__cover${chapter.gameId ? ` calendar-chapter__cover--${chapter.gameId}` : ''}`}
                  style={{
                    background: `linear-gradient(145deg, ${chapter.cover.from} 0%, ${chapter.cover.via} 45%, ${chapter.cover.to} 100%)`,
                  }}
                >
                  {chapter.gameId === 'fivefold' ? (
                    <div className="calendar-chapter__fivefold-art" aria-hidden>
                      <div className="calendar-chapter__fivefold-grid">
                        {Array.from({ length: 3 }, (_, row) => (
                          <div className="calendar-chapter__fivefold-row" key={row}>
                            {Array.from({ length: 5 }, (_, col) => {
                              if (row === 0) {
                                const cells = [
                                  { l: 'W', s: 'correct' },
                                  { l: 'O', s: 'present' },
                                  { l: 'R', s: 'absent' },
                                  { l: 'D', s: 'absent' },
                                  { l: 'S', s: 'correct' },
                                ]
                                const c = cells[col]
                                return (
                                  <span
                                    key={col}
                                    className={`calendar-chapter__fivefold-tile calendar-chapter__fivefold-tile--${c.s}`}
                                  >
                                    {c.l}
                                  </span>
                                )
                              }
                              return (
                                <span key={col} className="calendar-chapter__fivefold-tile calendar-chapter__fivefold-tile--empty" />
                              )
                            })}
                          </div>
                        ))}
                      </div>
                      <span className="calendar-chapter__fivefold-shape calendar-chapter__fivefold-shape--g" />
                      <span className="calendar-chapter__fivefold-shape calendar-chapter__fivefold-shape--y" />
                      <span className="calendar-chapter__fivefold-shape calendar-chapter__fivefold-shape--a" />
                    </div>
                  ) : null}
                  <span className="calendar-chapter__period">{chapter.period}</span>
                  <h2 className="calendar-chapter__name">{chapter.title}</h2>
                  <p className="calendar-chapter__subtitle">{chapter.subtitle}</p>
                </div>
              </article>
            ))}
            <span className="calendar-window__strip-gutter" aria-hidden />
          </div>
        </div>
        </div>

        <nav className="calendar-window__nav" aria-label="Game navigation">
          <button
            type="button"
            className="calendar-window__nav-btn"
            disabled={chapterIndex <= 0}
            onClick={() => scrollToChapter(chapterIndex - 1)}
            aria-label="Previous title"
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
            aria-label="Next title"
          >
            ›
          </button>
        </nav>
      </div>

      <section className="calendar-window__detail" aria-live="polite">
        <div className="calendar-window__detail-copy">
          <span className="calendar-window__detail-date">{activeDetail.dateLine}</span>
          <h3 className="calendar-window__detail-title">{activeDetail.title}</h3>
          <p className="calendar-window__detail-body">{activeDetail.body}</p>
          {activeDetail.tags && activeDetail.tags.length > 0 && (
            <div className="calendar-window__tags">
              {activeDetail.tags.map((tag) => (
                <span key={tag} className="calendar-window__tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <div className="calendar-window__detail-play-slot">
          <button
            type="button"
            className="calendar-window__play-btn"
            aria-label={canPlay ? `Play ${activeChapter.title}` : 'Play (coming soon)'}
            disabled={!canPlay || shelfLeaving}
            onClick={() => {
              if (activeChapter.gameId) openGame(activeChapter.gameId)
            }}
          >
            {canPlay ? 'Play' : 'Soon'}
          </button>
        </div>
      </section>
        </div>
      ) : null}
      <WindowBottomDragHandle dragHandleProps={dragHandleProps} />
    </div>
  )
}
