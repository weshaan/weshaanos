import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { fetchWeather, resolveCoordinates, type WeatherSnapshot } from '../weather/openMeteo'
import { subscribePrimaryLocation } from '../weather/primaryLocation'

export type WeatherViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; data: WeatherSnapshot }
  | { status: 'error'; message: string }

const REFRESH_MS = 30 * 60 * 1000

let state: WeatherViewState = { status: 'idle' }
let started = false
let refreshScheduled = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

async function loadWeather() {
  state = { status: 'loading' }
  emit()
  try {
    const coords = await resolveCoordinates()
    const data = await fetchWeather(coords)
    state = { status: 'ready', data }
  } catch {
    state = { status: 'error', message: 'Could not load weather' }
  }
  emit()
}

function ensureLoad() {
  if (started) return
  started = true
  void loadWeather()
}

function scheduleRefresh() {
  if (refreshScheduled) return
  refreshScheduled = true
  window.setInterval(() => {
    if (state.status !== 'ready') return
    void loadWeather()
  }, REFRESH_MS)
}

/** Refetch desktop widget / menu bar weather (My Location). */
export function refreshWidgetWeather(): void {
  started = true
  void loadWeather()
}

export function useWeather(enabled: boolean) {
  const view = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    if (!enabled) return
    ensureLoad()
    scheduleRefresh()
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    return subscribePrimaryLocation(() => {
      void loadWeather()
    })
  }, [enabled])

  const retry = useCallback(() => {
    if (!enabled) return
    void loadWeather()
  }, [enabled])

  const tempLabel =
    view.status === 'ready' ? `${view.data.tempC}°C` : view.status === 'loading' ? '…' : '—'

  return { view, retry, tempLabel }
}
