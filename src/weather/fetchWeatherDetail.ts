import type { WeatherCoordinates, WeatherDayForecast, WeatherDetail, WeatherLocation } from './types'
import {
  daylightProgress,
  fetchClimatologyDailyMaxC,
  formatClockTime,
  hourlyIndexAtNoon,
  moonIlluminationPct,
  moonPhaseLabel,
  pressureGaugePosition,
  sumHourlyPrecipitation,
} from './openMeteoUtils'
import { wmoConditionLabel, wmoIconKind } from './wmoWeather'

type DetailResponse = {
  timezone: string
  current: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    precipitation: number
    weather_code: number
    surface_pressure: number
    wind_speed_10m: number
    wind_gusts_10m: number
    wind_direction_10m: number
    visibility: number
    dew_point_2m: number
    is_day: number
  }
  hourly: {
    time: string[]
    precipitation: number[]
    is_day: number[]
  }
  daily: {
    time: string[]
    sunrise: string[]
    sunset: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
    weather_code: number[]
    moonrise: (string | null)[]
    moonset: (string | null)[]
    moon_phase: number[]
  }
}

function windDirectionLabel(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const idx = Math.round(deg / 45) % 8
  return dirs[idx]
}

function forecastParams(location: WeatherLocation): URLSearchParams {
  return new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'precipitation',
      'weather_code',
      'surface_pressure',
      'wind_speed_10m',
      'wind_gusts_10m',
      'wind_direction_10m',
      'visibility',
      'dew_point_2m',
      'is_day',
    ].join(','),
    hourly: 'precipitation,is_day',
    daily:
      'sunrise,sunset,temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,moonrise,moonset,moon_phase',
    forecast_days: '7',
    timezone: 'auto',
  })
}

function buildWeatherDetail(
  location: WeatherLocation,
  data: DetailResponse,
  climateHighC: number | null,
  nowMs = Date.now(),
): WeatherDetail {
  const isDay = data.current.is_day === 1
  const code = data.current.weather_code

  const todayHigh = Math.round(data.daily.temperature_2m_max[0])
  const todayLow = Math.round(data.daily.temperature_2m_min[0])

  const { pastMm, futureMm } = sumHourlyPrecipitation(
    data.hourly.precipitation,
    data.hourly.time,
    6,
    24,
    nowMs,
  )

  const forecastHighAvg = Math.round(
    data.daily.temperature_2m_max.reduce((a, b) => a + b, 0) / data.daily.temperature_2m_max.length,
  )
  const normalHighC = climateHighC ?? forecastHighAvg

  const regionLabel = [location.region, location.country].filter(Boolean).join(', ')

  const moonriseRaw = data.daily.moonrise[0]
  const moonsetRaw = data.daily.moonset[0]
  const moonFraction = data.daily.moon_phase[0] ?? 0

  const dailyForecast: WeatherDayForecast[] = data.daily.time.map((dayIso, i) => {
    const dayDate = new Date(`${dayIso}T12:00:00`)
    const dayCode = data.daily.weather_code[i]
    const noonIdx = hourlyIndexAtNoon(data.hourly.time, dayIso)
    const dayIsDay = noonIdx >= 0 ? data.hourly.is_day[noonIdx] === 1 : true
    return {
      dayName:
        i === 0 ? 'Today' : dayDate.toLocaleDateString(undefined, { weekday: 'short' }),
      highC: Math.round(data.daily.temperature_2m_max[i]),
      lowC: Math.round(data.daily.temperature_2m_min[i]),
      condition: wmoConditionLabel(dayCode),
      icon: wmoIconKind(dayCode, dayIsDay),
    }
  })

  const visibilityKm = Math.round((data.current.visibility / 1000) * 10) / 10
  const pressureHpa = Math.round(data.current.surface_pressure)

  return {
    locationId: location.id,
    cityLabel: location.name,
    regionLabel,
    tempC: Math.round(data.current.temperature_2m),
    condition: wmoConditionLabel(code),
    heroIcon: wmoIconKind(code, isDay),
    isDay,
    weatherCode: code,
    highC: todayHigh,
    lowC: todayLow,
    feelsLikeC: Math.round(data.current.apparent_temperature),
    humidity: Math.round(data.current.relative_humidity_2m),
    dewPointC: Math.round(data.current.dew_point_2m),
    pressureHpa,
    pressureGaugePos: pressureGaugePosition(pressureHpa),
    windKph: Math.round(data.current.wind_speed_10m),
    windGustKph: Math.round(data.current.wind_gusts_10m),
    windDirectionDeg: data.current.wind_direction_10m,
    visibilityKm,
    dailyForecast,
    precipLast6hMm: Math.round(pastMm * 10) / 10,
    precipNext24hMm: Math.round(futureMm * 10) / 10,
    precipTodayMm: Math.round(data.daily.precipitation_sum[0] * 10) / 10,
    sunrise: formatClockTime(data.daily.sunrise[0]),
    sunset: formatClockTime(data.daily.sunset[0]),
    sunriseIso: data.daily.sunrise[0],
    sunsetIso: data.daily.sunset[0],
    sunDaylightProgress: daylightProgress(data.daily.sunrise[0], data.daily.sunset[0], nowMs),
    avgHighDeltaC: Math.round(todayHigh - normalHighC),
    todayHighC: todayHigh,
    avgHighC: normalHighC,
    avgHighUsesClimate: climateHighC != null,
    moon: {
      phaseName: moonPhaseLabel(moonFraction),
      phaseFraction: ((moonFraction % 1) + 1) % 1,
      illuminationPct: moonIlluminationPct(moonFraction),
      moonriseLabel: moonriseRaw ? formatClockTime(moonriseRaw) : '—',
      moonsetLabel: moonsetRaw ? formatClockTime(moonsetRaw) : '—',
    },
    timezone: data.timezone,
    fetchedAt: nowMs,
  }
}

export async function fetchWeatherForecastDetail(
  location: WeatherLocation,
): Promise<{ detail: WeatherDetail; todayIso: string }> {
  const forecastRes = await fetch(`https://api.open-meteo.com/v1/forecast?${forecastParams(location)}`)
  if (!forecastRes.ok) throw new Error('Weather request failed')
  const data = (await forecastRes.json()) as DetailResponse
  const todayIso = data.daily.time[0]
  const detail = buildWeatherDetail(location, data, null)
  return { detail, todayIso }
}

export async function fetchWeatherDetail(location: WeatherLocation): Promise<WeatherDetail> {
  const { detail, todayIso } = await fetchWeatherForecastDetail(location)
  const climateHighC = await fetchClimatologyDailyMaxC(
    location.latitude,
    location.longitude,
    todayIso,
  )
  if (climateHighC == null) return detail
  return {
    ...detail,
    avgHighC: climateHighC,
    avgHighDeltaC: detail.todayHighC - climateHighC,
    avgHighUsesClimate: true,
  }
}

export async function fetchWeatherDetailForCoords(coords: WeatherCoordinates, label: string): Promise<WeatherDetail> {
  return fetchWeatherDetail({
    id: 'coords',
    name: label,
    latitude: coords.latitude,
    longitude: coords.longitude,
  })
}

export function windCardinal(deg: number): string {
  return `${Math.round(deg)}° ${windDirectionLabel(deg)}`
}
