export type MusicTrack = {
  id: string
  title: string
  artist?: string
  file: string
}

export type MusicPlaylistMeta = {
  id: string
  name: string
  trackIds: string[]
}

export type MusicCatalog = {
  tracks: MusicTrack[]
  playlists: MusicPlaylistMeta[]
}

/** @deprecated Use MusicCatalog */
export type MusicPlaylist = {
  tracks: MusicTrack[]
}

export function resolvePlaylistTracks(
  playlist: MusicPlaylistMeta | undefined,
  tracks: MusicTrack[],
): MusicTrack[] {
  if (!playlist) return []
  return playlist.trackIds
    .map((id) => tracks.find((t) => t.id === id))
    .filter((t): t is MusicTrack => Boolean(t))
}

export function findPlaylistForTrack(
  trackId: string,
  playlists: MusicPlaylistMeta[],
): MusicPlaylistMeta | undefined {
  return playlists.find((p) => p.trackIds.includes(trackId))
}

export function trackSrc(track: MusicTrack): string {
  return `/music/${encodeURIComponent(track.file)}`
}
