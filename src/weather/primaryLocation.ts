import { DEFAULT_WEATHER_LOCATIONS } from './defaultLocations'
import type { WeatherLocation } from './types'

const STORAGE_KEY = 'weather-primary-location-v3'

const DEFAULT_PRIMARY =
  DEFAULT_WEATHER_LOCATIONS.find((l) => l.isPrimary) ?? DEFAULT_WEATHER_LOCATIONS[0]

const listeners = new Set<() => void>()

function readStoredPrimary(): WeatherLocation {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PRIMARY, isPrimary: true }
    const parsed = JSON.parse(raw) as WeatherLocation
    if (
      typeof parsed.id === 'string' &&
      typeof parsed.name === 'string' &&
      typeof parsed.latitude === 'number' &&
      typeof parsed.longitude === 'number'
    ) {
      return { ...parsed, isPrimary: true }
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_PRIMARY, isPrimary: true }
}

let primaryLocation: WeatherLocation = readStoredPrimary()

function emit() {
  listeners.forEach((l) => l())
}

export function subscribePrimaryLocation(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getPrimaryLocation(): WeatherLocation {
  return primaryLocation
}

export function setPrimaryLocation(location: WeatherLocation): void {
  const next: WeatherLocation = { ...location, isPrimary: true }
  primaryLocation = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
  emit()
}

export function applyPrimaryToLocations(locations: WeatherLocation[]): WeatherLocation[] {
  const id = primaryLocation.id
  const hasPrimary = locations.some((l) => l.id === id)
  const list = hasPrimary
    ? locations
    : [{ ...primaryLocation, isPrimary: true }, ...locations.map((l) => ({ ...l, isPrimary: false }))]
  return list.map((l) => ({ ...l, isPrimary: l.id === id }))
}

export function initialWeatherLocations(): WeatherLocation[] {
  return applyPrimaryToLocations(DEFAULT_WEATHER_LOCATIONS.map((l) => ({ ...l, isPrimary: false })))
}
