import type { PathSegment } from '../browser/BrowserWindow'
import type { FinderFolderGlyph } from '../icons/FinderFolderIcon'

export type FinderLocationId =
  | 'recents'
  | 'shared'
  | 'applications'
  | 'desktop'
  | 'documents'
  | 'downloads'
  | 'pictures'
  | 'music'
  | 'music-beats'
  | 'movies-nav'
  | 'home'
  | 'projects'
  | 'images'
  | 'misc'
  | 'localhost'
  | 'projects-marketplace'
  | 'projects-portfolio'
  | 'projects-experiments'

export type FinderLaunchId =
  | 'resume'
  | 'mail'
  | 'terminal'
  | 'settings'
  | 'weather'
  | 'calendar'
  | 'calculator'
  | 'pdfviewer'
  | 'games'
  | 'clock'
  | 'musicapp'

const DESKTOP_FOLDER_IDS = ['projects', 'images', 'misc', 'localhost'] as const
export type FinderDesktopFolderId = (typeof DESKTOP_FOLDER_IDS)[number]

export function isFinderDesktopFolderId(id: string): id is FinderDesktopFolderId {
  return (DESKTOP_FOLDER_IDS as readonly string[]).includes(id)
}

export function finderEntryKey(entry: FinderGridEntry): string {
  if (entry.kind === 'place') return `place-${entry.place}`
  if (entry.kind === 'music') return `music-${entry.trackId}`
  return `launch-${entry.launch}`
}

/** Where search / open should navigate for this item (one target per logical item). */
export function finderEntryNavigateTo(entry: FinderGridEntry): FinderLocationId {
  if (entry.kind === 'place') return entry.place
  if (entry.kind === 'music') return 'music-beats'
  if (entry.launch === 'resume') return 'documents'
  return 'applications'
}

export type FinderGridEntry =
  | {
      kind: 'place'
      label: string
      glyph: FinderFolderGlyph
      place: FinderLocationId
    }
  | {
      kind: 'launch'
      label: string
      glyph: FinderFolderGlyph
      launch: FinderLaunchId
      /** Shown as document icon style in grid (future); for now same folder chrome */
      variant?: 'folder'
    }
  | {
      kind: 'music'
      label: string
      artist?: string
      trackId: string
      fileName: string
    }

type FinderLocation = {
  title: string
  sidebarId: FinderLocationId
  path: PathSegment[]
  items: FinderGridEntry[]
  emptyMessage?: string
}

const HOME_BASE: PathSegment[] = [
  { label: 'Macintosh HD', icon: 'hd' },
  { label: 'Users', icon: 'folder' },
  { label: 'weshaan', icon: 'home' },
]

function userPath(folder: string): PathSegment[] {
  return [...HOME_BASE, { label: folder, icon: 'folder' }]
}

export const FINDER_LOCATIONS: Record<FinderLocationId, FinderLocation> = {
  recents: {
    title: 'Recents',
    sidebarId: 'recents',
    path: [{ label: 'Recents', icon: 'folder' }],
    items: [
      { kind: 'place', label: 'Projects', glyph: 'generic', place: 'projects' },
      { kind: 'place', label: 'Images', glyph: 'photo', place: 'images' },
      { kind: 'launch', label: 'Resume', glyph: 'document', launch: 'resume' },
      { kind: 'place', label: 'Misc', glyph: 'generic', place: 'misc' },
    ],
  },
  shared: {
    title: 'Shared',
    sidebarId: 'shared',
    path: [{ label: 'Shared', icon: 'folder' }],
    items: [],
    emptyMessage: 'No shared items',
  },
  applications: {
    title: 'Applications',
    sidebarId: 'applications',
    path: [{ label: 'Applications', icon: 'folder' }],
    items: [
      { kind: 'launch', label: 'Clock', glyph: 'app', launch: 'clock' },
      { kind: 'launch', label: 'Calendar', glyph: 'app', launch: 'calendar' },
      { kind: 'launch', label: 'Weather', glyph: 'app', launch: 'weather' },
      { kind: 'launch', label: 'Calculator', glyph: 'app', launch: 'calculator' },
      { kind: 'launch', label: 'PDF Viewer', glyph: 'app', launch: 'pdfviewer' },
      { kind: 'launch', label: 'Games', glyph: 'app', launch: 'games' },
      { kind: 'launch', label: 'Music', glyph: 'app', launch: 'musicapp' },
      { kind: 'launch', label: 'Mail', glyph: 'generic', launch: 'mail' },
      { kind: 'launch', label: 'Terminal', glyph: 'generic', launch: 'terminal' },
      { kind: 'launch', label: 'System Settings', glyph: 'app', launch: 'settings' },
    ],
  },
  desktop: {
    title: 'Desktop',
    sidebarId: 'desktop',
    path: userPath('Desktop'),
    items: [
      { kind: 'place', label: 'Projects', glyph: 'generic', place: 'projects' },
      { kind: 'place', label: 'Images', glyph: 'photo', place: 'images' },
      { kind: 'place', label: 'Misc', glyph: 'generic', place: 'misc' },
      { kind: 'place', label: 'Localhost', glyph: 'generic', place: 'localhost' },
    ],
  },
  documents: {
    title: 'Documents',
    sidebarId: 'documents',
    path: userPath('Documents'),
    items: [{ kind: 'launch', label: 'Resume', glyph: 'document', launch: 'resume' }],
  },
  downloads: {
    title: 'Downloads',
    sidebarId: 'downloads',
    path: userPath('Downloads'),
    items: [],
    emptyMessage: 'No items in Downloads',
  },
  pictures: {
    title: 'Pictures',
    sidebarId: 'pictures',
    path: userPath('Pictures'),
    items: [{ kind: 'place', label: 'Images', glyph: 'photo', place: 'images' }],
  },
  music: {
    title: 'Music',
    sidebarId: 'music',
    path: userPath('Music'),
    items: [{ kind: 'place', label: 'beats', glyph: 'generic', place: 'music-beats' }],
  },
  'music-beats': {
    title: 'beats',
    sidebarId: 'music',
    path: [...userPath('Music'), { label: 'beats', icon: 'folder' }],
    items: [],
    emptyMessage: 'No items in beats',
  },
  'movies-nav': {
    title: 'Movies',
    sidebarId: 'movies-nav',
    path: userPath('Movies'),
    items: [],
    emptyMessage: 'No movies yet',
  },
  projects: {
    title: 'Projects',
    sidebarId: 'desktop',
    path: [...userPath('Desktop'), { label: 'Projects', icon: 'folder' }],
    items: [
      { kind: 'place', label: 'marketplace', glyph: 'generic', place: 'projects-marketplace' },
      { kind: 'place', label: 'portfolio', glyph: 'generic', place: 'projects-portfolio' },
      { kind: 'place', label: 'experiments', glyph: 'generic', place: 'projects-experiments' },
    ],
  },
  'projects-marketplace': {
    title: 'marketplace',
    sidebarId: 'desktop',
    path: [
      ...userPath('Desktop'),
      { label: 'Projects', icon: 'folder' },
      { label: 'marketplace', icon: 'folder' },
    ],
    items: [],
    emptyMessage: 'No items in marketplace',
  },
  'projects-portfolio': {
    title: 'portfolio',
    sidebarId: 'desktop',
    path: [
      ...userPath('Desktop'),
      { label: 'Projects', icon: 'folder' },
      { label: 'portfolio', icon: 'folder' },
    ],
    items: [],
    emptyMessage: 'No items in portfolio',
  },
  'projects-experiments': {
    title: 'experiments',
    sidebarId: 'desktop',
    path: [
      ...userPath('Desktop'),
      { label: 'Projects', icon: 'folder' },
      { label: 'experiments', icon: 'folder' },
    ],
    items: [],
    emptyMessage: 'No items in experiments',
  },
  images: {
    title: 'Images',
    sidebarId: 'desktop',
    path: [...userPath('Desktop'), { label: 'Images', icon: 'folder' }],
    items: [],
    emptyMessage: 'No images yet',
  },
  misc: {
    title: 'Misc',
    sidebarId: 'desktop',
    path: [...userPath('Desktop'), { label: 'Misc', icon: 'folder' }],
    items: [],
    emptyMessage: 'No items yet',
  },
  localhost: {
    title: 'Localhost',
    sidebarId: 'desktop',
    path: [...userPath('Desktop'), { label: 'Localhost', icon: 'folder' }],
    items: [],
    emptyMessage: 'No dev projects here yet',
  },
  home: {
    title: 'weshaan',
    sidebarId: 'home',
    path: HOME_BASE,
    items: [
      { kind: 'place', label: 'Desktop', glyph: 'monitor', place: 'desktop' },
      { kind: 'place', label: 'Documents', glyph: 'document', place: 'documents' },
      { kind: 'place', label: 'Downloads', glyph: 'download', place: 'downloads' },
      { kind: 'place', label: 'Movies', glyph: 'film', place: 'movies-nav' },
      { kind: 'place', label: 'Music', glyph: 'music', place: 'music' },
      { kind: 'place', label: 'Pictures', glyph: 'photo', place: 'pictures' },
      { kind: 'place', label: 'Public', glyph: 'person', place: 'shared' },
      { kind: 'place', label: 'Applications', glyph: 'app', place: 'applications' },
    ],
  },
}

export type FinderSidebarEntry = {
  id: FinderLocationId
  label: string
  icon: 'clock' | 'shared' | 'app' | 'monitor' | 'document' | 'download' | 'photo' | 'music' | 'film' | 'home'
  section?: 'favourites' | 'locations'
}

export const FINDER_SIDEBAR: FinderSidebarEntry[] = [
  { id: 'recents', label: 'Recents', icon: 'clock' },
  { id: 'shared', label: 'Shared', icon: 'shared' },
  { id: 'applications', label: 'Applications', icon: 'app', section: 'favourites' },
  { id: 'desktop', label: 'Desktop', icon: 'monitor', section: 'favourites' },
  { id: 'documents', label: 'Documents', icon: 'document', section: 'favourites' },
  { id: 'downloads', label: 'Downloads', icon: 'download', section: 'favourites' },
  { id: 'pictures', label: 'Pictures', icon: 'photo', section: 'favourites' },
  { id: 'music', label: 'Music', icon: 'music', section: 'favourites' },
  { id: 'movies-nav', label: 'Movies', icon: 'film', section: 'favourites' },
  { id: 'home', label: 'weshaan', icon: 'home', section: 'locations' },
]
