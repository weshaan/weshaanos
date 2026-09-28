export type ClockTimeFormat = '12' | '24'

export const DEFAULT_CLOCK_TIME_FORMAT: ClockTimeFormat = '12'

export function isClockTimeFormat(value: string): value is ClockTimeFormat {
  return value === '12' || value === '24'
}

export function formatWidgetTime(now: Date, format: ClockTimeFormat): string {
  const minutes = now.getMinutes().toString().padStart(2, '0')
  if (format === '24') {
    const hours = now.getHours().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }
  const hours = now.getHours()
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes}`
}

export function formatMenuTime(now: Date, format: ClockTimeFormat): string {
  const minutes = now.getMinutes().toString().padStart(2, '0')
  if (format === '24') {
    const hours = now.getHours().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }
  const hours = now.getHours()
  const hour12 = hours % 12 || 12
  const ampm = hours >= 12 ? 'PM' : 'AM'
  return `${hour12}:${minutes} ${ampm}`
}
