import { useEffect, useMemo, useState } from 'react'
import {
  ARMAAN_REVEAL_EVENT,
  isArmaanPlaylistRevealedFromNotes,
  visibleMusicPlaylists,
} from '../music/musicSecretPlaylists'
import type { MusicCatalog, MusicPlaylistMeta, MusicTrack } from '../music/types'

const EMPTY_CATALOG: MusicCatalog = { tracks: [], playlists: [] }

export function useMusicPlaylist() {
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [allPlaylists, setAllPlaylists] = useState<MusicPlaylistMeta[]>([])
  const [armaanRevealed, setArmaanRevealed] = useState(isArmaanPlaylistRevealedFromNotes)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    const sync = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail
      setArmaanRevealed(
        typeof detail === 'boolean' ? detail : isArmaanPlaylistRevealedFromNotes(),
      )
    }
    window.addEventListener(ARMAAN_REVEAL_EVENT, sync)
    return () => window.removeEventListener(ARMAAN_REVEAL_EVENT, sync)
  }, [])

  const playlists = useMemo(
    () => visibleMusicPlaylists(allPlaylists, armaanRevealed),
    [allPlaylists, armaanRevealed],
  )

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/music/playlist.json')
        if (!res.ok) throw new Error('playlist missing')
        const data = (await res.json()) as MusicCatalog
        if (!cancelled) {
          setTracks(Array.isArray(data.tracks) ? data.tracks : [])
          setAllPlaylists(Array.isArray(data.playlists) ? data.playlists : [])
          setLoadError(false)
        }
      } catch {
        if (!cancelled) {
          setTracks([])
          setAllPlaylists([])
          setLoadError(true)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { tracks, playlists, loadError, catalog: { tracks, playlists } }
}

export { EMPTY_CATALOG }
