export type DockApp = {
  id: string
  label: string
  icon: string
  badge?: number
  running?: boolean
  separatorBefore?: boolean
}

/** Curated dock — typical developer Mac, not every installed app */
export const dockApps: DockApp[] = [
  { id: 'finder', label: 'Finder', icon: '/dock/finder.png', running: true },
  { id: 'calendar', label: 'Calendar', icon: '/dock/calendar.png' },
  { id: 'weather', label: 'Weather', icon: '/dock/weather.png' },
  { id: 'brave', label: 'Brave', icon: '/dock/brave.png', running: true },
  { id: 'vscode', label: 'Visual Studio Code', icon: '/dock/vscode.png', running: true },
  { id: 'calculator', label: 'Calculator', icon: '/dock/calculator.png' },
  { id: 'games', label: 'Games', icon: '/dock/games.png' },
  { id: 'mail', label: 'Mail', icon: '/dock/mail.png' },
  { id: 'notes', label: 'Notes', icon: '/dock/notes.png' },
  { id: 'terminal', label: 'Terminal', icon: '/dock/terminal.png', running: true },
  { id: 'settings', label: 'System Settings', icon: '/dock/settings.png' },
  { id: 'trash', label: 'Bin', icon: '/dock/trash.png', separatorBefore: true },
]
