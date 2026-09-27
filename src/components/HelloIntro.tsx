import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import './HelloIntro.css'

const HELLO_SVG = '/hello/hello-en.svg'
const HELLO_TIME_SCALE = 8.1

type Props = {
  onComplete: () => void
}

type Phase = 'idle' | 'booting' | 'playing' | 'holding' | 'exiting'

const MIN_BOOT_MS = 1400
/** Hold the bar just shy of full before the final fill (macOS-style stall). */
const BOOT_NEAR_COMPLETE_PAUSE_MS = 800
const BOOT_HOLD_AT_COMPLETE_MS = 340
/** Pause on the finished hello before sliding away to the lock screen (keep in sync with 3s hold CSS). */
const HOLD_BEFORE_LOCK_MS = 3000
const EXIT_MS = 1050

export function HelloIntro({ onComplete }: Props) {
  const stageRef = useRef<HTMLDivElement>(null)
  const bootFillRef = useRef<HTMLDivElement>(null)
  const ctxRef = useRef<gsap.Context | null>(null)
  const finishedRef = useRef(false)
  const bootRunRef = useRef(false)
  const [phase, setPhase] = useState<Phase>('idle')

  const finishIntro = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    setPhase('holding')
    window.setTimeout(() => {
      setPhase('exiting')
      window.setTimeout(onComplete, EXIT_MS)
    }, HOLD_BEFORE_LOCK_MS)
  }, [onComplete])

  const playHelloMarkup = useCallback(
    async (markup: string) => {
      const stage = stageRef.current
      if (!stage) return

      ctxRef.current?.revert()
      ctxRef.current = gsap.context(() => {}, stage)
      stage.innerHTML = markup

      const svg = stage.querySelector('#hello-text')
      const ellipses = stage.querySelectorAll('ellipse')
      if (!svg || ellipses.length === 0) {
        finishIntro()
        return
      }

      await new Promise<void>((resolve) => {
        gsap.set(ellipses, { autoAlpha: 0 })
        gsap.set(svg, { scale: 0.5, transformOrigin: '50% 50%' })

        const tl = gsap.timeline({ onComplete: resolve })
        tl.to(ellipses, {
          autoAlpha: 1,
          duration: 1,
          stagger: 0.05,
          ease: 'power4.out',
        }).from(svg, { scale: 0, duration: 50, transformOrigin: '50% 50%' }, '<')

        tl.timeScale(HELLO_TIME_SCALE)
      })

      finishIntro()
    },
    [finishIntro],
  )

  const runBootAndHello = useCallback(async () => {
    const fill = bootFillRef.current
    if (!fill) return

    const bootStarted = performance.now()

    try {
      gsap.set(fill, { scaleX: 0, transformOrigin: 'left center' })

      const fetchPromise = fetch(HELLO_SVG)
      const progressTween = gsap.to(fill, {
        scaleX: 0.82,
        duration: MIN_BOOT_MS / 1000,
        ease: 'power1.inOut',
      })

      const res = await fetchPromise
      await progressTween

      const remaining = MIN_BOOT_MS - (performance.now() - bootStarted)
      if (remaining > 0) {
        await new Promise<void>((resolve) => window.setTimeout(resolve, remaining))
      }

      if (!res.ok) throw new Error('missing hello svg')
      const markup = await res.text()

      await new Promise<void>((resolve) => window.setTimeout(resolve, BOOT_NEAR_COMPLETE_PAUSE_MS))
      await gsap.to(fill, { scaleX: 1, duration: 0.48, ease: 'power2.inOut' })
      await new Promise<void>((resolve) => window.setTimeout(resolve, BOOT_HOLD_AT_COMPLETE_MS))

      setPhase('playing')
      await playHelloMarkup(markup)
    } catch {
      finishIntro()
    }
  }, [finishIntro, playHelloMarkup])

  const handlePowerClick = () => {
    if (phase !== 'idle') return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      onComplete()
      return
    }

    setPhase('booting')
  }

  useEffect(() => {
    if (phase !== 'booting' || bootRunRef.current) return
    bootRunRef.current = true
    void runBootAndHello()
  }, [phase, runBootAndHello])

  const shellClass =
    phase === 'exiting'
      ? 'hello-intro hello-intro--exit'
      : phase === 'holding'
        ? 'hello-intro hello-intro--holding'
        : phase === 'playing'
          ? 'hello-intro hello-intro--playing'
          : phase === 'booting'
            ? 'hello-intro hello-intro--booting'
            : 'hello-intro'

  return (
    <div className={shellClass} aria-hidden={phase === 'exiting'}>
      <div className="hello-intro__start">
        <p className="hello-intro__prompt">Click button to switch ON system</p>
        <button
          type="button"
          className="hello-intro__power"
          onClick={handlePowerClick}
          disabled={phase !== 'idle'}
          aria-label="Power on"
        >
          <span className="hello-intro__power-hit">
            <span className="hello-intro__power-glow" aria-hidden />
            <span className="hello-intro__power-ring" aria-hidden />
            <PowerIcon />
          </span>
        </button>
      </div>

      {phase === 'booting' && (
        <div className="hello-intro__boot" aria-busy="true" aria-label="Starting up">
          <span className="hello-intro__boot-mark" aria-hidden>🦚</span>
          <div className="hello-intro__boot-track" role="progressbar" aria-valuemin={0} aria-valuemax={100}>
            <div ref={bootFillRef} className="hello-intro__boot-fill" />
          </div>
        </div>
      )}

      <div
        className={[
          'hello-intro__stage-anchor',
          phase === 'holding' && 'hello-intro__stage-anchor--hold',
          (phase === 'holding' || phase === 'exiting') && 'hello-intro__stage-anchor--show-spinner',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden={phase !== 'playing' && phase !== 'holding' && phase !== 'exiting'}
      >
        <div ref={stageRef} className="hello-intro__stage" />
        <div
          className="hello-intro__hold-spinner"
          aria-hidden={phase !== 'holding' && phase !== 'exiting'}
        >
          <span className="hello-intro__hold-spinner-ring" />
        </div>
      </div>
    </div>
  )
}

function PowerIcon() {
  return (
    <svg className="hello-intro__power-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 4.25v5.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <path
        d="M8.1 8.35a5.9 5.9 0 1 0 7.8 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
    </svg>
  )
}
