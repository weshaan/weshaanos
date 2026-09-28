export function formatClockTime(isoLocal: string): string {
  const d = new Date(isoLocal)
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function formatTimeInTimeZone(timeZone: string, date = new Date()): string {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  })
}

/** Local noon slot in Open-Meteo hourly arrays (times are in the location timezone). */
export function hourlyIndexAtNoon(times: string[], dayIso: string): number {
  const noonPrefix = `${dayIso}T12:`
  return times.findIndex((t) => t.startsWith(noonPrefix))
}

/** Index of the hourly slot that contains or most recently preceded now. */
export function currentHourlyIndex(times: string[], nowMs = Date.now()): number {
  let idx = 0
  for (let i = 0; i < times.length; i++) {
    if (new Date(times[i]).getTime() <= nowMs) idx = i
    else break
  }
  return idx
}

export function sumHourlyPrecipitation(
  values: number[],
  times: string[],
  pastHours: number,
  futureHours: number,
  nowMs = Date.now(),
): { pastMm: number; futureMm: number } {
  const idx = currentHourlyIndex(times, nowMs)
  const pastStart = Math.max(0, idx - pastHours + 1)
  const pastMm = values.slice(pastStart, idx + 1).reduce((a, b) => a + b, 0)
  const futureEnd = Math.min(values.length, idx + 1 + futureHours)
  const futureMm = values.slice(idx + 1, futureEnd).reduce((a, b) => a + b, 0)
  return { pastMm, futureMm }
}

export function moonPhaseLabel(fraction: number): string {
  const p = ((fraction % 1) + 1) % 1
  if (p < 0.03 || p > 0.97) return 'New Moon'
  if (p < 0.22) return 'Waxing Crescent'
  if (p < 0.28) return 'First Quarter'
  if (p < 0.47) return 'Waxing Gibbous'
  if (p < 0.53) return 'Full Moon'
  if (p < 0.72) return 'Waning Gibbous'
  if (p < 0.78) return 'Last Quarter'
  return 'Waning Crescent'
}

export function moonIlluminationPct(fraction: number): number {
  const p = ((fraction % 1) + 1) % 1
  return Math.round(((1 - Math.cos(p * 2 * Math.PI)) / 2) * 100)
}

/** 0 = sunrise, 1 = sunset, clamped outside daylight. */
export function daylightProgress(sunriseIso: string, sunsetIso: string, nowMs = Date.now()): number {
  const rise = new Date(sunriseIso).getTime()
  const set = new Date(sunsetIso).getTime()
  if (!Number.isFinite(rise) || !Number.isFinite(set) || set <= rise) return 0.5
  if (nowMs <= rise) return 0
  if (nowMs >= set) return 1
  return (nowMs - rise) / (set - rise)
}

/** 0–1 position on a typical sea-level pressure scale (hPa). */
export function pressureGaugePosition(hpa: number): number {
  const min = 980
  const max = 1040
  return Math.min(1, Math.max(0, (hpa - min) / (max - min)))
}

export async function fetchClimatologyDailyMaxC(
  latitude: number,
  longitude: number,
  dayIso: string,
): Promise<number | null> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    start_date: dayIso,
    end_date: dayIso,
    models: 'EC_Earth3P_HR',
    daily: 'temperature_2m_max',
  })

  try {
    const res = await fetch(`https://climate-api.open-meteo.com/v1/climate?${params}`)
    if (!res.ok) return null
    const data = (await res.json()) as { daily?: { temperature_2m_max?: number[] } }
    const value = data.daily?.temperature_2m_max?.[0]
    return value != null ? Math.round(value) : null
  } catch {
    return null
  }
}
