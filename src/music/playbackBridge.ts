type MusicPlaybackBridge = {
  playTrack: (trackId: string) => void
}

let bridge: MusicPlaybackBridge | null = null

export function setMusicPlaybackBridge(next: MusicPlaybackBridge | null) {
  bridge = next
}

export function playTrackFromFinder(trackId: string) {
  bridge?.playTrack(trackId)
}
