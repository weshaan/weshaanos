const DESKTOP_TIPS: string[] = [
  'Music widget on the right — play, pause, vibe.',
  'The weather widget actually works, try clicking on it.',
  'Red traffic light closes a window. The others are decorative.',
  'Finder → weshaan for folders and side quests.',
  'Documents in Finder has the resume PDF.',
  'System Settings can change the window theme.',
  'Fun fact: Holding apps from top or bottom drags them.',
  'You can drag apps out of the screen too, almost...',
  'Desktop folders on the left are clickable too.',
  'Smily in the menu bar has a little welcome.',
  'Did you try the new clock faces?',
  'Games on the dock. No spoilers from me.',
  'Mail opens a contact card, say hi if something clicks.',
  'Try brave://about in the address bar for the site story.',
  'Notes has a lore to unfold.',
  'Bin on the dock is vibes only. Nothing really gets deleted.',
  'Widgets stack on the right, scroll if you’re on a short screen.',
]

function pickRandom(items: readonly string[]): string {
  return items[Math.floor(Math.random() * items.length)]!
}

/** One tip per new-tab visit. */
export function pickNewTabDesktopTip(): string {
  return pickRandom(DESKTOP_TIPS)
}
