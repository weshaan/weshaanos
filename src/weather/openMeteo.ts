import { getPrimaryLocation } from './primaryLocation'
import { currentHourlyIndex, formatClockTime } from './openMeteoUtils'
import { wmoConditionLabel, wmoIconKind, type WeatherIconKind } from './wmoWeather'

export type WeatherForecastSlot = {
  timeLabel: string
  tempC: number
  icon: WeatherIconKind
}

export type WeatherSnapshot = {
  cityLabel: string
  tempC: number
  condition: string
  heroIcon: WeatherIconKind
  highC: number
  lowC: number
  hourly: WeatherForecastSlot[]
  fetchedAt: number
}

type Coordinates = { latitude: number; longitude: number }

/** Fallback when location is unavailable. */
export const WEATHER_FALLBACK_COORDS: Coordinates = {
  latitude: 12.9716,
  longitude: 77.5946,
}

type OpenMeteoResponse = {
  current: {
    temperature_2m: number
    weather_code: number
    is_day: number
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    weather_code: number[]
    is_day: number[]
  }
  daily: {
    temperature_2m_max: number[]
    temperature_2m_min: number[]
  }
}

function formatSlotLabel(isoTime: string, slotIndex: number): string {
  if (slotIndex === 0) return 'Now'
  return formatClockTime(isoTime)
}

export async function fetchWeather(coords?: Coordinates): Promise<WeatherSnapshot> {
  const primary = getPrimaryLocation()
  const resolved = coords ?? { latitude: primary.latitude, longitude: primary.longitude }
  const params = new URLSearchParams({
    latitude: String(resolved.latitude),
    longitude: String(resolved.longitude),
    current: 'temperature_2m,weather_code,is_day',
    hourly: 'temperature_2m,weather_code,is_day',
    daily: 'temperature_2m_max,temperature_2m_min',
    forecast_days: '1',
    timezone: 'auto',
  })

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!res.ok) throw new Error('Weather request failed')

  const data = (await res.json()) as OpenMeteoResponse
  const nowMs = Date.now()
  const isDay = data.current.is_day === 1

  const hourly: WeatherForecastSlot[] = []
  const times = data.hourly.time
  const start = currentHourlyIndex(times, nowMs)

  for (let i = 0; i < 5 && start + i < times.length; i++) {
    const idx = start + i
    const code = data.hourly.weather_code[idx]
    const hourIsDay = data.hourly.is_day[idx] === 1
    hourly.push({
      timeLabel: formatSlotLabel(times[idx], i),
      tempC: Math.round(data.hourly.temperature_2m[idx]),
      icon: wmoIconKind(code, hourIsDay),
    })
  }

  return {
    cityLabel: primary.name,
    tempC: Math.round(data.current.temperature_2m),
    condition: wmoConditionLabel(data.current.weather_code),
    heroIcon: wmoIconKind(data.current.weather_code, isDay),
    highC: Math.round(data.daily.temperature_2m_max[0]),
    lowC: Math.round(data.daily.temperature_2m_min[0]),
    hourly,
    fetchedAt: nowMs,
  }
}

export function resolveCoordinates(): Promise<Coordinates> {
  const primary = getPrimaryLocation()
  return Promise.resolve({ latitude: primary.latitude, longitude: primary.longitude })
}
