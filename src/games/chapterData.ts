export type GameId = 'fivefold'

export type ChapterDetail = {
  /** Shelf line in the detail panel (genre, status, etc.) */
  dateLine: string
  title: string
  body: string
  tags?: string[]
}

export type ChapterCover = { from: string; via: string; to: string }

export type CalendarChapter = {
  id: string
  /** Shelf label on the cover */
  period: string
  title: string
  subtitle: string
  cover: ChapterCover
  detail: ChapterDetail
  gameId?: GameId
}

/** Featured shelves and titles for the Games window. */
export const calendarChapters: CalendarChapter[] = [
  {
    id: 'featured',
    period: 'Featured',
    title: 'Fivefold',
    subtitle: 'New word every round',
    cover: { from: '#121213', via: '#1c1c1e', to: '#2d3a2c' },
    gameId: 'fivefold',
    detail: {
      dateLine: 'Word · Unlimited',
      title: 'Guess the five-letter word',
      body:
        'Green means right letter, right spot. Yellow means right letter, wrong spot, Guess the word. Win or lose, hit Play again for a new word and go again!',
      tags: ['Unlimited', 'Word', 'Puzzle'],
    },
  },
  {
    id: 'indie',
    period: 'Indie',
    title: 'coming soon...',
    subtitle: 'Patience — we’re tuning the fun curve',
    cover: { from: '#1a3d5c', via: '#2a6f9e', to: '#7ec8e8' },
    detail: {
      dateLine: 'Status · Polishing',
      title: 'High scores pending',
      body:
        'Leaderboards are empty on purpose. We’re saving room for your name, your friends, and that one run you swear was frame-perfect.',
      tags: ['Coming soon', 'Indie', 'Leaderboards'],
    },
  },
  {
    id: 'adventure',
    period: 'Adventure',
    title: 'coming soon...',
    subtitle: 'Side quests still in ~/Downloads',
    cover: { from: '#0f2840', via: '#1e4a6e', to: '#4a90c8' },
    detail: {
      dateLine: 'Status · Writing lore',
      title: 'Map not final',
      body:
        'Every good adventure needs a mysterious folder and a NPC who only speaks in tooltips. We’re stocking both before we let you in.',
      tags: ['Coming soon', 'Story', 'Secrets'],
    },
  },
  {
    id: 'action',
    period: 'Action',
    title: 'coming soon...',
    subtitle: 'Forecast: 100% hype with scattered patches',
    cover: { from: '#1c1c1e', via: '#3a3a3c', to: '#636366' },
    detail: {
      dateLine: 'Status · Stress testing',
      title: 'Engines warming up',
      body:
        'Particles, punch, and the kind of soundtrack that makes you sit up straighter. Launching when it feels fast, not when the calendar says so.',
      tags: ['Coming soon', 'Action', 'OST'],
    },
  },
  {
    id: 'classics',
    period: 'Classics',
    title: 'coming soon...',
    subtitle: 'Insert coin · please hold',
    cover: { from: '#3d2b1f', via: '#8b5a3c', to: '#e8b88a' },
    detail: {
      dateLine: 'Status · Arcade cabinet',
      title: 'Two-player couch energy',
      body:
        'Retro flair, modern netcode dreams, and a continue screen that begs you to stay for one more round. Quarter not included.',
      tags: ['Coming soon', 'Couch co-op', 'Retro'],
    },
  },
  {
    id: 'new',
    period: 'New',
    title: 'coming soon...',
    subtitle: 'Waves of features inbound',
    cover: { from: '#ff2d55', via: '#ff6482', to: '#ffb3c1' },
    detail: {
      dateLine: 'Status · Early access soon',
      title: 'Defend your free time',
      body:
        'We’re balancing turrets, snacks, and notification spam. Jump in early when you’re ready to help us break things on purpose.',
      tags: ['Coming soon', 'Strategy', 'Co-op'],
    },
  },
]

export function defaultChapterIndex(): number {
  return 0
}
