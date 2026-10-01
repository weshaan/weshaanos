import { useCallback, useEffect, useRef, useState } from 'react'
import type { MusicTrack } from '../music/types'
import { trackSrc } from '../music/types'

function ensureTrackLoaded(audio: HTMLAudioElement, t: MusicTrack) {
  if (audio.dataset.trackId === t.id) return
  audio.dataset.trackId = t.id
  audio.src = trackSrc(t)
}

const PROGRESS_UI_MS = 250

export function useMusicPlayer(tracks: MusicTrack[]) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentTimeRef = useRef(0)
  const lastProgressUiMs = useRef(0)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const count = tracks.length
  const safeIndex = count > 0 ? ((index % count) + count) % count : 0
  const track = count > 0 ? tracks[safeIndex] : null

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !track) return
    ensureTrackLoaded(audio, track)
  }, [track])

  const playCurrent = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !track) return
    ensureTrackLoaded(audio, track)
    void audio.play().catch(() => setPlaying(false))
  }, [track])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !track) return
    if (audio.paused) playCurrent()
    else pause()
  }, [track, playCurrent, pause])

  const goTo = useCallback(
    (nextIndex: number, autoplay: boolean) => {
      if (count === 0) return
      const i = ((nextIndex % count) + count) % count
      setIndex(i)
      const t = tracks[i]
      const audio = audioRef.current
      if (!audio || !t) return
      ensureTrackLoaded(audio, t)
      if (autoplay) void audio.play().catch(() => setPlaying(false))
      else audio.pause()
    },
    [count, tracks],
  )

  const next = useCallback(() => goTo(safeIndex + 1, true), [goTo, safeIndex])

  const previous = useCallback(() => {
    const audio = audioRef.current
    if (audio && currentTimeRef.current > 3) {
      audio.currentTime = 0
      currentTimeRef.current = 0
      setCurrentTime(0)
      return
    }
    goTo(safeIndex - 1, true)
  }, [goTo, safeIndex])

  const onEnded = useCallback(() => {
    goTo(safeIndex + 1, true)
  }, [goTo, safeIndex])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = time
    currentTimeRef.current = time
    lastProgressUiMs.current = performance.now()
    setCurrentTime(time)
  }, [])

  const onTimeUpdate = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    const t = audio.currentTime
    currentTimeRef.current = t
    const now = performance.now()
    if (now - lastProgressUiMs.current < PROGRESS_UI_MS) return
    lastProgressUiMs.current = now
    setCurrentTime(t)
  }, [])

  const onLoadedMetadata = useCallback(() => {
    const audio = audioRef.current
    if (audio) setDuration(audio.duration || 0)
  }, [])

  const onAudioPlay = useCallback(() => setPlaying(true), [])
  const onAudioPause = useCallback(() => {
    setPlaying(false)
    setCurrentTime(currentTimeRef.current)
  }, [])

  const playTrackById = useCallback(
    (trackId: string) => {
      const i = tracks.findIndex((t) => t.id === trackId)
      if (i < 0) return
      goTo(i, true)
    },
    [tracks, goTo],
  )

  return {
    audioRef,
    track,
    hasTracks: count > 0,
    playing,
    currentTime,
    duration,
    play: playCurrent,
    playTrackById,
    togglePlay,
    previous,
    next,
    seek,
    onTimeUpdate,
    onLoadedMetadata,
    onEnded,
    onAudioPlay,
    onAudioPause,
  }
}
