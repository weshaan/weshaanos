import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { useMusicPlayer } from '../hooks/useMusicPlayer'
import { setMusicAutoplayHandler } from '../music/autoplay'
import type { MusicPlaylist } from '../music/types'

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MusicPlayerWidget() {
  const [tracks, setTracks] = useState<MusicPlaylist['tracks']>([])
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/music/playlist.json')
        if (!res.ok) throw new Error('playlist missing')
        const data = (await res.json()) as MusicPlaylist
        if (!cancelled) {
          setTracks(Array.isArray(data.tracks) ? data.tracks : [])
          setLoadError(false)
        }
      } catch {
        if (!cancelled) {
          setTracks([])
          setLoadError(true)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const player = useMusicPlayer(tracks)

  useEffect(() => {
    if (!player.hasTracks) {
      setMusicAutoplayHandler(null)
      return
    }
    setMusicAutoplayHandler(() => {
      player.play()
    })
    return () => setMusicAutoplayHandler(null)
  }, [player.hasTracks, player.play, tracks])

  const progress = player.duration > 0 ? Math.min(100, (player.currentTime / player.duration) * 100) : 0

  const emptyLabel = loadError ? 'No playlist' : 'No songs yet'

  return (
    <div className="widget widget--music" aria-label="Music player">
      <audio
        ref={player.audioRef}
        preload="none"
        onTimeUpdate={player.onTimeUpdate}
        onLoadedMetadata={player.onLoadedMetadata}
        onEnded={player.onEnded}
        onPlay={player.onAudioPlay}
        onPause={player.onAudioPause}
      />

      <MusicInfoMarquee
        title={player.track?.title ?? emptyLabel}
        artist={player.track?.artist}
        scroll={player.playing}
      />

      <div className="widget-music__scrub">
        <div className="widget-music__bar" aria-hidden>
          <div className="widget-music__bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <input
          type="range"
          className="widget-music__seek"
          min={0}
          max={player.duration || 100}
          step={0.25}
          value={player.currentTime}
          disabled={!player.track || player.duration <= 0}
          onChange={(e) => player.seek(Number(e.target.value))}
          aria-label={`Playback position, ${formatTime(player.currentTime)} of ${formatTime(player.duration)}`}
        />
      </div>

      <div className="widget-music__transport">
        <button
          type="button"
          className="widget-music__skip"
          onClick={player.previous}
          disabled={!player.hasTracks}
          aria-label="Previous track"
        >
          <SkipBackIcon />
        </button>

        <button
          type="button"
          className={`widget-music__play${player.playing ? ' widget-music__play--pause' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            player.togglePlay()
          }}
          disabled={!player.track}
          aria-label={player.playing ? 'Pause' : 'Play'}
          aria-pressed={player.playing}
        >
          {player.playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        <button
          type="button"
          className="widget-music__skip"
          onClick={player.next}
          disabled={!player.hasTracks}
          aria-label="Next track"
        >
          <SkipForwardIcon />
        </button>
      </div>
    </div>
  )
}

const MARQUEE_GAP_PX = 20
const MARQUEE_PX_PER_SEC = 32

type MusicInfoMarqueeProps = {
  title: string
  artist?: string
  scroll: boolean
}

function MusicInfoMarquee({ title, artist, scroll }: MusicInfoMarqueeProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [contentWidthPx, setContentWidthPx] = useState(0)
  const [viewportWidthPx, setViewportWidthPx] = useState(0)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const measureEl = measureRef.current
    if (!viewport || !measureEl) return

    const measure = () => {
      setViewportWidthPx(viewport.clientWidth)
      setContentWidthPx(measureEl.scrollWidth)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(viewport)
    ro.observe(measureEl)
    return () => ro.disconnect()
  }, [title, artist])

  const overflowPx = Math.max(0, contentWidthPx - viewportWidthPx)
  const animate = scroll && overflowPx > 1
  const loopPx = contentWidthPx + MARQUEE_GAP_PX
  const marqueeStyle: CSSProperties | undefined = animate
    ? {
        ['--marquee-distance' as string]: `${loopPx}px`,
        ['--marquee-duration' as string]: `${Math.max(2.5, loopPx / MARQUEE_PX_PER_SEC)}s`,
      }
    : undefined

  const tooltip = artist ? `${title} — ${artist}` : title

  const lines = (
    <>
      <p className="widget-music__title">{title}</p>
      {artist ? <p className="widget-music__artist">{artist}</p> : null}
    </>
  )

  return (
    <div ref={viewportRef} className="widget-music__info" title={tooltip}>
      <div ref={measureRef} className="widget-music__measure" aria-hidden="true">
        {lines}
      </div>
      {animate ? (
        <div
          className="widget-music__marquee-track widget-music__marquee-track--scroll"
          style={marqueeStyle}
        >
          <div className="widget-music__marquee-block">{lines}</div>
          <div className="widget-music__marquee-block" aria-hidden="true">
            <p className="widget-music__title">{title}</p>
            {artist ? <p className="widget-music__artist">{artist}</p> : null}
          </div>
        </div>
      ) : (
        <div className="widget-music__marquee-block widget-music__marquee-block--clip">{lines}</div>
      )}
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M8 5.5v13l10.5-6.5L8 5.5z" fill="currentColor" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M7 6h3.5v12H7V6zm6.5 0H17v12h-3.5V6z" fill="currentColor" />
    </svg>
  )
}

function SkipBackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path d="M7 6h2v12H7V6zm4 6 7.5 4.5V7.5L11 12z" fill="currentColor" />
    </svg>
  )
}

function SkipForwardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <g transform="scale(-1, 1) translate(-24, 0)">
        <path d="M7 6h2v12H7V6zm4 6 7.5 4.5V7.5L11 12z" fill="currentColor" />
      </g>
    </svg>
  )
}
