import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { WindowBottomDragHandle } from '../desktop/WindowBottomDragHandle'
import { useMusicPlayerContext } from '../../context/MusicPlayerContext'
import { ARMAAN_PLAYLIST_ID } from '../../music/musicSecretPlaylists'
import { resolvePlaylistTracks } from '../../music/types'
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

type IpodView = 'now-playing' | 'playlists' | 'songs'

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
    playlists,
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
    playPlaylist,
    activePlaylistId,
  } = useMusicPlayerContext()

  const [view, setView] = useState<IpodView>('now-playing')
  const [browsePlaylistId, setBrowsePlaylistId] = useState<string | null>(null)
  const [menuIndex, setMenuIndex] = useState(0)
  /** Song already started once; second select on the same row opens Now Playing. */
  const [armedSongId, setArmedSongId] = useState<string | null>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (browsePlaylistId && playlists.some((p) => p.id === browsePlaylistId)) return
    setBrowsePlaylistId(playlists[0]?.id ?? null)
  }, [playlists, browsePlaylistId])

  const browsePlaylist = useMemo(
    () => playlists.find((p) => p.id === browsePlaylistId),
    [playlists, browsePlaylistId],
  )

  const browseTracks = useMemo(
    () => resolvePlaylistTracks(browsePlaylist, tracks),
    [browsePlaylist, tracks],
  )

  const menuListLength =
    view === 'playlists' ? playlists.length : view === 'songs' ? browseTracks.length : 0

  useEffect(() => {
    if (view === 'playlists') {
      const i = playlists.findIndex((p) => p.id === browsePlaylistId)
      setMenuIndex(i >= 0 ? i : 0)
    } else if (view === 'songs') {
      const i = browseTracks.findIndex((t) => t.id === track?.id)
      setMenuIndex(i >= 0 ? i : 0)
    }
  }, [view, playlists, browsePlaylistId, browseTracks, track?.id])

  useEffect(() => {
    if (menuListLength === 0) return
    setMenuIndex((i) => Math.min(i, menuListLength - 1))
  }, [menuListLength])

  useEffect(() => {
    if (view === 'now-playing' || menuListLength === 0) return
    const row = listRef.current?.children[menuIndex] as HTMLElement | undefined
    row?.scrollIntoView({ block: 'nearest' })
  }, [menuIndex, view, menuListLength])

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0
  const emptyLabel = loadError ? 'No playlist' : 'No songs'

  const handleMenu = useCallback(() => {
    if (view === 'now-playing') setView('playlists')
    else if (view === 'songs') setView('playlists')
    else setView('now-playing')
  }, [view])

  const moveMenuSelection = useCallback(
    (delta: number) => {
      if (menuListLength === 0) return
      setMenuIndex((i) => (i + delta + menuListLength) % menuListLength)
    },
    [menuListLength],
  )

  const handleWheelPrevious = useCallback(() => {
    if (view === 'now-playing') previous()
    else moveMenuSelection(-1)
  }, [view, previous, moveMenuSelection])

  const handleWheelNext = useCallback(() => {
    if (view === 'now-playing') next()
    else moveMenuSelection(1)
  }, [view, next, moveMenuSelection])

  const openPlaylist = useCallback(
    (playlistId: string) => {
      setBrowsePlaylistId(playlistId)
      setView('songs')
      const pl = playlists.find((p) => p.id === playlistId)
      const playlistTracks = resolvePlaylistTracks(pl, tracks)
      const playingFromHere =
        activePlaylistId === playlistId &&
        track?.id &&
        playlistTracks.some((t) => t.id === track.id) &&
        (playing || currentTime > 0)

      if (playlistId === ARMAAN_PLAYLIST_ID) {
        if (playingFromHere) {
          setArmedSongId(track.id)
        } else {
          playPlaylist(playlistId)
          setArmedSongId(playlistTracks[0]?.id ?? null)
        }
        return
      }

      setArmedSongId(playingFromHere ? track.id : null)
    },
    [playlists, tracks, activePlaylistId, track, playing, currentTime, playPlaylist],
  )

  const activateSongAt = useCallback(
    (index: number) => {
      const t = browseTracks[index]
      if (!t) return
      setMenuIndex(index)
      if (armedSongId === t.id && track?.id === t.id) {
        setView('now-playing')
        setArmedSongId(null)
        return
      }
      if (browsePlaylistId) playTrackById(t.id, browsePlaylistId)
      else playTrackById(t.id)
      setArmedSongId(t.id)
    },
    [browseTracks, browsePlaylistId, playTrackById, armedSongId, track?.id],
  )

  const handleCenter = useCallback(() => {
    if (view === 'playlists') {
      const pl = playlists[menuIndex]
      if (!pl) return
      openPlaylist(pl.id)
      return
    }
    if (view === 'songs') {
      activateSongAt(menuIndex)
      return
    }
    if (hasTracks) togglePlay()
  }, [view, menuIndex, playlists, hasTracks, togglePlay, openPlaylist, activateSongAt])

  const wheelTransportDisabled =
    view === 'now-playing' ? !hasTracks : menuListLength === 0
  const centerDisabled = wheelTransportDisabled

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
                <div className="ipod-now__art-placeholder" />
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
          ) : view === 'playlists' ? (
            <div className="ipod-songs">
              <p className="ipod-songs__heading">Playlists</p>
              <ul className="ipod-songs__list" ref={listRef}>
                {playlists.length === 0 ? (
                  <li className="ipod-songs__empty">{emptyLabel}</li>
                ) : (
                  playlists.map((pl, index) => (
                    <li key={pl.id}>
                      <button
                        type="button"
                        className={`ipod-songs__row${index === menuIndex ? ' ipod-songs__row--selected' : ''}`}
                        onClick={() => openPlaylist(pl.id)}
                      >
                        <span className="ipod-songs__name">{pl.name}</span>
                        <span className="ipod-songs__artist">{pl.trackIds.length} songs</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ) : (
            <div className="ipod-songs">
              <p className="ipod-songs__heading">{browsePlaylist?.name ?? 'Songs'}</p>
              <ul className="ipod-songs__list" ref={listRef}>
                {browseTracks.length === 0 ? (
                  <li className="ipod-songs__empty">{emptyLabel}</li>
                ) : (
                  browseTracks.map((t, index) => {
                    const selected = index === menuIndex
                    const playingNow = track?.id === t.id && playing
                    return (
                      <li key={t.id}>
                        <button
                          type="button"
                          className={`ipod-songs__row${selected ? ' ipod-songs__row--selected' : ''}${playingNow && !selected ? ' ipod-songs__row--playing' : ''}`}
                          onClick={() => activateSongAt(index)}
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
          <button type="button" className="ipod-wheel-hit ipod-wheel-hit--menu" onClick={handleMenu}>
            <span className="visually-hidden">Menu</span>
          </button>
          <button
            type="button"
            className="ipod-wheel-hit ipod-wheel-hit--prev"
            onClick={handleWheelPrevious}
            disabled={wheelTransportDisabled}
            aria-label={view === 'now-playing' ? 'Previous track' : 'Previous item'}
          />
          <button
            type="button"
            className="ipod-wheel-hit ipod-wheel-hit--next"
            onClick={handleWheelNext}
            disabled={wheelTransportDisabled}
            aria-label={view === 'now-playing' ? 'Next track' : 'Next item'}
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
            disabled={centerDisabled}
            aria-label="Select"
          />
        </div>
      </div>

      <WindowBottomDragHandle dragHandleProps={dragHandleProps} />
    </div>
  )
}
