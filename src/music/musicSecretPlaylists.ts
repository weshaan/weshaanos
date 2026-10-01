import { loadTodayNote } from '../components/notes/notesTodayStorage'

export const ARMAAN_PLAYLIST_ID = 'armaan'

const UNLOCK_PHRASE = 'itsarmaanmittal'
export const ARMAAN_REVEAL_EVENT = 'portfolio-music-armaan-reveal-changed'

export function isArmaanPhraseInText(text: string): boolean {
  return text.includes(UNLOCK_PHRASE)
}

export function isArmaanPlaylistRevealedFromNotes(): boolean {
  const { title, body } = loadTodayNote()
  return isArmaanPhraseInText(`${title}\n${body}`)
}

export function syncArmaanRevealFromNotesText(text: string): void {
  const revealed = isArmaanPhraseInText(text)
  window.dispatchEvent(new CustomEvent<boolean>(ARMAAN_REVEAL_EVENT, { detail: revealed }))
}

export function visibleMusicPlaylists<T extends { id: string }>(
  playlists: T[],
  revealed: boolean,
): T[] {
  if (revealed) return playlists
  return playlists.filter((p) => p.id !== ARMAAN_PLAYLIST_ID)
}
