import { isoDateLocal } from './calendarEvents'

export type MonthDayCell = {
  date: Date
  iso: string
  inMonth: boolean
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const

export function weekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS
}

/** Sunday-start month grid (6 rows × 7 cols). */
export function buildMonthGrid(year: number, month: number): MonthDayCell[][] {
  const first = new Date(year, month, 1)
  const startOffset = first.getDay()
  const gridStart = new Date(year, month, 1 - startOffset)

  const rows: MonthDayCell[][] = []
  for (let row = 0; row < 6; row++) {
    const cells: MonthDayCell[] = []
    for (let col = 0; col < 7; col++) {
      const i = row * 7 + col
      const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i)
      cells.push({
        date,
        iso: isoDateLocal(date),
        inMonth: date.getMonth() === month,
      })
    }
    rows.push(cells)
  }
  return rows
}

export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const d = new Date(year, month + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() }
}

export function addYears(year: number, month: number, delta: number): { year: number; month: number } {
  return { year: year + delta, month }
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
