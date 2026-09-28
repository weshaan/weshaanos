export type CalendarEvent = {
  /** Local calendar date YYYY-MM-DD */
  date: string
  title: string
  color?: 'red' | 'blue' | 'green'
}

export type YearlyCalendarEvent = {
  /** 1–12 */
  month: number
  /** 1–31 */
  day: number
  title: string
  color?: 'red' | 'blue' | 'green'
}

/** One-off events (specific YYYY-MM-DD). */
export const CALENDAR_EVENTS: CalendarEvent[] = []

/** Repeats every year on the same month/day. */
export const YEARLY_CALENDAR_EVENTS: YearlyCalendarEvent[] = [
  { month: 12, day: 2, title: 'Date is saved in favourites', color: 'green' },
]

const UPCOMING_YEAR_SPAN = 8

export function isoDateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isoFromParts(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function yearlyEventsOnDate(iso: string): CalendarEvent[] {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return []
  return YEARLY_CALENDAR_EVENTS
    .filter((e) => e.month === month && e.day === day)
    .map((e) => ({
      date: iso,
      title: e.title,
      color: e.color,
    }))
}

export function eventsOnDate(iso: string): CalendarEvent[] {
  const oneOff = CALENDAR_EVENTS.filter((e) => e.date === iso)
  return [...oneOff, ...yearlyEventsOnDate(iso)]
}

export function hasEventsOnDate(iso: string): boolean {
  return eventsOnDate(iso).length > 0
}

/** Widget “next” row — always the next 2 Dec favourites occurrence. */
export function nextFavouritesForWidget(from: Date): CalendarEvent | null {
  const fromIso = isoDateLocal(from)
  const y = from.getFullYear()
  for (let year = y; year <= y + UPCOMING_YEAR_SPAN; year++) {
    for (const e of YEARLY_CALENDAR_EVENTS) {
      const iso = isoFromParts(year, e.month, e.day)
      if (iso >= fromIso) {
        return { date: iso, title: e.title, color: e.color }
      }
    }
  }
  return null
}

/** macOS-style chip for the 2 Dec favourites line on the widget. */
export function favouritesWidgetChipLabel(): string {
  return 'THURS, 2 DEC'
}
