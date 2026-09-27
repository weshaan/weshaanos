export type MusicTrack = {
  id: string
  title: string
  artist?: string
  file: string
}

export type MusicPlaylist = {
  tracks: MusicTrack[]
}

export function trackSrc(track: MusicTrack): string {
  return `/music/${encodeURIComponent(track.file)}`
}
