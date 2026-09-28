export type ChapterMoment = {
  id: string
  /** Short label on the strip, e.g. "12" or "Launch" */
  label: string
  /** Full date line in the detail panel */
  dateLine: string
  title: string
  body: string
  tags?: string[]
}

export type CalendarChapter = {
  id: string
  /** e.g. "March 2026" */
  period: string
  /** Creative chapter title */
  title: string
  /** One-line mood for the cover */
  subtitle: string
  /** CSS custom property values for cover gradient */
  cover: { from: string; via: string; to: string }
  moments: ChapterMoment[]
}

/** Portfolio timeline — edit moments here as your year unfolds. */
export const calendarChapters: CalendarChapter[] = [
  {
    id: '2025-10',
    period: 'October 2025',
    title: 'Sketch the desktop',
    subtitle: 'When the portfolio stopped being a slide deck',
    cover: { from: '#2d1f4e', via: '#5c3d7a', to: '#c45c8a' },
    moments: [
      {
        id: '2025-10-08',
        label: '08',
        dateLine: 'Wed, 8 Oct',
        title: 'First window chrome',
        body: 'Traffic lights, blur, and a wallpaper — proof the OS metaphor could carry real work.',
        tags: ['UI', 'Prototype'],
      },
      {
        id: '2025-10-19',
        label: '19',
        dateLine: 'Sun, 19 Oct',
        title: 'Dock physics',
        body: 'Spent an evening tuning magnification curves until it felt like rubber, not math.',
        tags: ['Motion'],
      },
      {
        id: '2025-10-28',
        label: '28',
        dateLine: 'Tue, 28 Oct',
        title: 'Lock screen beat',
        body: 'Added the unlock gesture and timed the hello reveal to land on the downbeat.',
        tags: ['Audio', 'Delight'],
      },
    ],
  },
  {
    id: '2025-11',
    period: 'November 2025',
    title: 'Folders that breathe',
    subtitle: 'Finder logic, real files, fake desktop',
    cover: { from: '#1a3d5c', via: '#2a6f9e', to: '#7ec8e8' },
    moments: [
      {
        id: '2025-11-05',
        label: '05',
        dateLine: 'Wed, 5 Nov',
        title: 'Finder sidebar',
        body: 'Locations, tags, and the satisfaction of a crisp column resize.',
        tags: ['Finder'],
      },
      {
        id: '2025-11-14',
        label: '14',
        dateLine: 'Fri, 14 Nov',
        title: 'Resume in-app',
        body: 'PDF window with lazy load so the first paint stays light.',
        tags: ['Perf'],
      },
      {
        id: '2025-11-22',
        label: '22',
        dateLine: 'Sat, 22 Nov',
        title: 'Widgets rail',
        body: 'Music, weather peek, reminders — the right edge became a control panel.',
        tags: ['Widgets'],
      },
    ],
  },
  {
    id: '2025-12',
    period: 'December 2025',
    title: 'Weather as a place',
    subtitle: 'Scenes, loops, and night glass',
    cover: { from: '#0f2840', via: '#1e4a6e', to: '#4a90c8' },
    moments: [
      {
        id: '2025-12-03',
        label: '03',
        dateLine: 'Wed, 3 Dec',
        title: 'Open-Meteo wiring',
        body: 'Real forecasts for Bengaluru and the cities that matter on the sidebar.',
        tags: ['API'],
      },
      {
        id: '2025-12-12',
        label: '12',
        dateLine: 'Fri, 12 Dec',
        title: 'Scene video layers',
        body: 'Rain and clouds as atmosphere, not decoration — playback tuned to feel alive.',
        tags: ['Weather'],
      },
      {
        id: '2025-12-21',
        label: '21',
        dateLine: 'Sun, 21 Dec',
        title: 'Moonrise card',
        body: 'Phase masks and a friendly moon face for the longest nights.',
        tags: ['Craft'],
      },
    ],
  },
  {
    id: '2026-01',
    period: 'January 2026',
    title: 'Small apps, loud personality',
    subtitle: 'Calculator keys and boot sounds',
    cover: { from: '#1c1c1e', via: '#3a3a3c', to: '#636366' },
    moments: [
      {
        id: '2026-01-09',
        label: '09',
        dateLine: 'Fri, 9 Jan',
        title: 'Calculator window',
        body: 'macOS-dark keypad, live expression line, keyboard shortcuts for nerds.',
        tags: ['Apps'],
      },
      {
        id: '2026-01-17',
        label: '17',
        dateLine: 'Sat, 17 Jan',
        title: 'Boot SFX pass',
        body: 'Curated short sounds for unlock and hello — loud enough to notice, quiet enough to keep.',
        tags: ['Sound'],
      },
      {
        id: '2026-01-26',
        label: '26',
        dateLine: 'Mon, 26 Jan',
        title: 'Theme toggle',
        body: 'Light and dark window chrome synced with system settings panel.',
        tags: ['Settings'],
      },
    ],
  },
  {
    id: '2026-02',
    period: 'February 2026',
    title: 'Polish passes',
    subtitle: 'Scrollbars, spacing, the last 10%',
    cover: { from: '#3d2b1f', via: '#8b5a3c', to: '#e8b88a' },
    moments: [
      {
        id: '2026-02-04',
        label: '04',
        dateLine: 'Wed, 4 Feb',
        title: 'Custom scroll',
        body: 'Weather lists got draggable thumbs and night-mode contrast fixes.',
        tags: ['UX'],
      },
      {
        id: '2026-02-14',
        label: '14',
        dateLine: 'Sat, 14 Feb',
        title: 'Widget forecast fix',
        body: 'Extended hourly fetch so evenings still show a full strip ahead.',
        tags: ['Bugfix'],
      },
    ],
  },
  {
    id: '2026-03',
    period: 'March 2026',
    title: 'Chapter scroll',
    subtitle: 'This calendar — months as stories, not grids',
    cover: { from: '#ff2d55', via: '#ff6482', to: '#ffb3c1' },
    moments: [
      {
        id: '2026-03-01',
        label: '01',
        dateLine: 'Sun, 1 Mar',
        title: 'You are here',
        body: 'Swipe the film strip. Each month is a chapter; tap a day to read the footnote.',
        tags: ['Meta'],
      },
      {
        id: '2026-03-28',
        label: '28',
        dateLine: 'Sat, 28 Mar',
        title: 'What ships next',
        body: 'Drop new moments into chapterData.ts — the UI will pick them up on refresh.',
        tags: ['Roadmap'],
      },
    ],
  },
]

export function defaultChapterIndex(): number {
  const now = new Date()
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const idx = calendarChapters.findIndex((c) => c.id === key)
  return idx >= 0 ? idx : calendarChapters.length - 1
}
