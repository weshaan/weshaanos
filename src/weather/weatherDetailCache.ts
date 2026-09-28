import { fetchClimatologyDailyMaxC } from './openMeteoUtils'
import { fetchWeatherForecastDetail } from './fetchWeatherDetail'
import type { WeatherDetail, WeatherLocation } from './types'

type CacheEntry = { data: WeatherDetail; fetchedAt: number }

const cache = new Map<string, CacheEntry>()
const inFlight = new Map<string, Promise<WeatherDetail>>()
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

export function subscribeWeatherDetailCache(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function peekWeatherDetail(locationId: string): WeatherDetail | null {
  return cache.get(locationId)?.data ?? null
}

export function summariesFromCache(locationIds: string[]): Record<string, WeatherDetail> {
  const out: Record<string, WeatherDetail> = {}
  for (const id of locationIds) {
    const data = peekWeatherDetail(id)
    if (data) out[id] = data
  }
  return out
}

function storeDetail(detail: WeatherDetail) {
  cache.set(detail.locationId, { data: detail, fetchedAt: Date.now() })
  emit()
}

function patchClimate(location: WeatherLocation, todayIso: string): void {
  void fetchClimatologyDailyMaxC(location.latitude, location.longitude, todayIso).then((climateHighC) => {
    if (climateHighC == null) return
    const current = cache.get(location.id)?.data
    if (!current || current.locationId !== location.id) return
    storeDetail({
      ...current,
      avgHighC: climateHighC,
      avgHighDeltaC: current.todayHighC - climateHighC,
      avgHighUsesClimate: true,
    })
  })
}

async function fetchAndStore(location: WeatherLocation): Promise<WeatherDetail> {
  const { detail, todayIso } = await fetchWeatherForecastDetail(location)
  storeDetail(detail)
  patchClimate(location, todayIso)
  return detail
}

export async function loadWeatherDetail(
  location: WeatherLocation,
  options?: { force?: boolean },
): Promise<WeatherDetail> {
  const id = location.id

  if (!options?.force) {
    const cached = cache.get(id)
    if (cached) return cached.data
  }

  const pending = inFlight.get(id)
  if (pending) return pending

  const promise = fetchAndStore(location).finally(() => {
    inFlight.delete(id)
  })
  inFlight.set(id, promise)
  return promise
}

export function prefetchWeatherDetail(location: WeatherLocation): void {
  if (cache.has(location.id) || inFlight.has(location.id)) return
  void loadWeatherDetail(location)
}

export async function ensureSidebarWeather(
  locations: WeatherLocation[],
  priorityId: string,
): Promise<void> {
  const priority = locations.find((l) => l.id === priorityId)
  if (priority && !peekWeatherDetail(priority.id)) {
    try {
      await loadWeatherDetail(priority)
    } catch {
      /* sidebar can stay empty for this row */
    }
  }

  const missing = locations.filter((l) => !peekWeatherDetail(l.id))
  await Promise.all(
    missing.map((loc) =>
      loadWeatherDetail(loc).catch(() => {
        /* ignore per-city failures */
      }),
    ),
  )
}
