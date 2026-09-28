import type { MusicTrack } from '../../music/types'
import type { FinderGridEntry, FinderLocationId } from './finderLocations'
import { FINDER_LOCATIONS } from './finderLocations'

export function musicTracksToFinderEntries(tracks: MusicTrack[]): FinderGridEntry[] {
  return tracks.map((track) => ({
    kind: 'music',
    label: track.title,
    artist: track.artist,
    trackId: track.id,
    fileName: track.file,
  }))
}

export function finderItemsForLocation(
  locationId: FinderLocationId,
  musicTracks: MusicTrack[],
): FinderGridEntry[] {
  if (locationId === 'music-beats') return musicTracksToFinderEntries(musicTracks)
  return FINDER_LOCATIONS[locationId].items
}
