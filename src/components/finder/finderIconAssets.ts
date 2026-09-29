/** PNG paths under /public/finder — regenerate on macOS via ./scripts/export-finder-icons.sh */
import type { FinderGridEntry } from './finderLocations'
import type { FinderFolderGlyph } from '../icons/FinderFolderIcon'

const GLYPH_ICONS: Record<FinderFolderGlyph, string> = {
  generic: '/finder/generic-folder.png',
  monitor: '/finder/desktop-folder.png',
  document: '/finder/documents-folder.png',
  download: '/finder/downloads-folder.png',
  film: '/finder/movie-folder.png',
  music: '/finder/music-folder.png',
  photo: '/finder/pictures-folder.png',
  person: '/finder/public-folder.png',
  app: '/finder/applications-folder.png',
}

export function getFinderItemIcon(entry: FinderGridEntry): string {
  if (entry.kind === 'music') {
    return '/finder/music-audio.png'
  }

  if (entry.kind === 'launch') {
    switch (entry.launch) {
      case 'resume':
        return '/finder/resume-document.png'
      case 'mail':
        return '/finder/app-mail.png'
      case 'terminal':
        return '/finder/app-terminal.png'
      case 'settings':
        return '/finder/app-settings.png'
      case 'weather':
        return '/dock/weather.png'
      case 'calendar':
        return '/dock/calendar.png'
      case 'calculator':
        return '/dock/calculator.png'
      case 'pdfviewer':
        return '/finder/app-pdf-viewer.png'
      case 'games':
        return '/finder/app-games.png'
      case 'clock':
        return '/finder/app-clock.svg'
      case 'musicapp':
        return '/finder/app-music.svg'
      case 'brave':
        return '/dock/brave.png'
      default:
        break
    }
  }

  if (entry.kind === 'place') {
    switch (entry.place) {
      case 'localhost':
        return '/finder/developer-folder.png'
      case 'images':
        return GLYPH_ICONS.photo
      case 'projects':
      case 'projects-marketplace':
      case 'projects-portfolio':
      case 'projects-experiments':
        return GLYPH_ICONS.generic
      default:
        break
    }
  }

  return GLYPH_ICONS[entry.glyph]
}
