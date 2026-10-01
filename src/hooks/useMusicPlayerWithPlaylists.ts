import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MusicPlaylistMeta, MusicTrack } from '../music/types'
import { findPlaylistForTrack, resolvePlaylistTracks } from '../music/types'
import { useMusicPlayer } from './useMusicPlayer'

export function useMusicPlayerWithPlaylists(tracks: MusicTrack[], playlists: MusicPlaylistMeta[]) {
  const defaultPlaylistId = playlists[0]?.id ?? ''
  const [activePlaylistId, setActivePlaylistId] = useState(defaultPlaylistId)
  const pendingPlayTrackId = useRef<string | null>(null)

  useEffect(() => {
    if (!defaultPlaylistId) return
    setActivePlaylistId((current) =>
      playlists.some((p) => p.id === current) ? current : defaultPlaylistId,
    )
  }, [defaultPlaylistId, playlists])

  const activePlaylist = useMemo(
    () => playlists.find((p) => p.id === activePlaylistId),
    [playlists, activePlaylistId],
  )

  const queue = useMemo(
    () => resolvePlaylistTracks(activePlaylist, tracks),
    [activePlaylist, tracks],
  )

  const player = useMusicPlayer(queue)
  const playTrackByIdInnerRef = useRef(player.playTrackById)
  playTrackByIdInnerRef.current = player.playTrackById

  useEffect(() => {
    const id = pendingPlayTrackId.current
    if (!id || queue.length === 0) return
    pendingPlayTrackId.current = null
    playTrackByIdInnerRef.current(id)
  }, [queue])

  const playTrackById = useCallback(
    (trackId: string, playlistId?: string) => {
      const playlist =
        (playlistId ? playlists.find((p) => p.id === playlistId) : undefined) ??
        findPlaylistForTrack(trackId, playlists)
      if (!playlist) return

      const nextQueue = resolvePlaylistTracks(playlist, tracks)
      if (!nextQueue.some((t) => t.id === trackId)) return

      if (playlist.id !== activePlaylistId) {
        pendingPlayTrackId.current = trackId
        setActivePlaylistId(playlist.id)
        return
      }
      player.playTrackById(trackId)
    },
    [activePlaylistId, playlists, player.playTrackById, tracks],
  )

  const playPlaylist = useCallback(
    (playlistId: string) => {
      const playlist = playlists.find((p) => p.id === playlistId)
      const nextQueue = resolvePlaylistTracks(playlist, tracks)
      const first = nextQueue[0]
      if (!first) return
      playTrackById(first.id, playlistId)
    },
    [playlists, tracks, playTrackById],
  )

  return {
    ...player,
    playlists,
    activePlaylistId,
    activePlaylist,
    queue,
    setActivePlaylistId,
    playTrackById,
    playPlaylist,
  }
}
