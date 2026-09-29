import { useCallback, useState } from 'react'
import { WindowBottomDragHandle } from '../desktop/WindowBottomDragHandle'
import { useMusicPlayerContext } from '../../context/MusicPlayerContext'
import { IpodTrackVisualizer } from './IpodTrackVisualizer'
import { useDraggableWindow, type WindowPoint } from '../../hooks/useDraggableWindow'
import './MusicWindow.css'

const IPOD_SHELL = '/music/6G_iPod.svg'

type Props = {
  windowId: string
  zIndex: number
  position: WindowPoint
  onPositionChange: (point: WindowPoint) => void
  onFocus: () => void
  onClose: () => void
}

type IpodView = 'now-playing' | 'songs'

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MusicWindow({
  windowId,
  zIndex,
  position,
  onPositionChange,
  onFocus,
  onClose,
}: Props) {
  const { titleBarProps, dragHandleProps } = useDraggableWindow(position, onPositionChange)
  const {
    track,
    tracks,
    hasTracks,
    loadError,
    playing,
    currentTime,
    duration,
    togglePlay,
    previous,
    next,
    seek,
    playTrackById,
    audioRef,
  } = useMusicPlayerContext()

  const [view, setView] = useState<IpodView>('now-playing')
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0
  const emptyLabel = loadError ? 'No playlist' : 'No songs'

  const handleCenter = useCallback(() => {
    if (view === 'songs' && track) {
      playTrackById(track.id)
      setView('now-playing')
      return
    }
    if (hasTracks) togglePlay()
  }, [view, track, hasTracks, togglePlay, playTrackById])

  return (
    <div
      className="music-window ipod-window"
      style={{ left: position.x, top: position.y, zIndex }}
      role="dialog"
      aria-label="Music"
      data-window-id={windowId}
      onPointerDown={onFocus}
    >
      <header className="ipod-window__titlebar" {...titleBarProps} style={{ touchAction: 'none', cursor: 'grab' }}>
        <button type="button" className="ipod-window__traffic" onClick={onClose} aria-label="Close">
          <span className="ipod-window__dot ipod-window__dot--close" aria-hidden />
          <span className="ipod-window__dot ipod-window__dot--min" aria-hidden />
          <span className="ipod-window__dot ipod-window__dot--max" aria-hidden />
        </button>
      </header>

      <div className="ipod-device">
        <img className="ipod-device__shell" src={IPOD_SHELL} alt="" draggable={false} />

        <div className="ipod-device__screen" aria-live="polite">
          {view === 'now-playing' ? (
            <div className="ipod-now">
              <div className="ipod-now__status">
                <span>Now Playing</span>
                <span className="ipod-now__battery" aria-hidden />
              </div>
              <div className="ipod-now__art" aria-hidden>
                <IpodTrackVisualizer trackId={track?.id} playing={playing} audioRef={audioRef} />
              </div>
              <p className="ipod-now__title">{track?.title ?? emptyLabel}</p>
              <p className="ipod-now__artist">{track?.artist ?? '—'}</p>
              <div className="ipod-now__progress">
                <div className="ipod-now__bar" aria-hidden>
                  <div className="ipod-now__bar-fill" style={{ width: `${progress}%` }} />
                </div>
                <input
                  type="range"
                  className="ipod-now__seek"
                  min={0}
                  max={duration || 100}
                  step={0.25}
                  value={currentTime}
                  disabled={!track || duration <= 0}
                  onChange={(e) => seek(Number(e.target.value))}
                  aria-label="Seek"
                />
                <div className="ipod-now__times">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="ipod-songs">
              <p className="ipod-songs__heading">Songs</p>
              <ul className="ipod-songs__list">
                {tracks.length === 0 ? (
                  <li className="ipod-songs__empty">{emptyLabel}</li>
                ) : (
                  tracks.map((t) => {
                    const active = track?.id === t.id
                    return (
                      <li key={t.id}>
                        <button
                          type="button"
                          className={`ipod-songs__row${active ? ' ipod-songs__row--active' : ''}`}
                          onClick={() => {
                            playTrackById(t.id)
                            setView('now-playing')
                          }}
                        >
                          <span className="ipod-songs__name">{t.title}</span>
                          {t.artist ? <span className="ipod-songs__artist">{t.artist}</span> : null}
                        </button>
                      </li>
                    )
                  })
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="ipod-device__wheel" aria-label="Click wheel">
          <button type="button" className="ipod-wheel-hit ipod-wheel-hit--menu" onClick={() => setView('songs')}>
            <span className="visually-hidden">Menu</span>
          </button>
          <button
            type="button"
            className="ipod-wheel-hit ipod-wheel-hit--prev"
            onClick={previous}
            disabled={!hasTracks}
            aria-label="Previous track"
          />
          <button
            type="button"
            className="ipod-wheel-hit ipod-wheel-hit--next"
            onClick={next}
            disabled={!hasTracks}
            aria-label="Next track"
          />
          <button
            type="button"
            className="ipod-wheel-hit ipod-wheel-hit--play"
            onClick={() => {
              if (view !== 'now-playing') setView('now-playing')
              togglePlay()
            }}
            disabled={!hasTracks}
            aria-label={playing ? 'Pause' : 'Play'}
          />
          <button
            type="button"
            className="ipod-wheel-hit ipod-wheel-hit--center"
            onClick={handleCenter}
            disabled={!hasTracks}
            aria-label="Select"
          />
        </div>
      </div>

      <WindowBottomDragHandle dragHandleProps={dragHandleProps} />
    </div>
  )
}
