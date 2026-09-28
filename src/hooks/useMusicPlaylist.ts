import { useEffect, useState } from 'react'
import type { MusicPlaylist, MusicTrack } from '../music/types'

export function useMusicPlaylist() {
  const [tracks, setTracks] = useState<MusicTrack[]>([])
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

  return { tracks, loadError }
}
