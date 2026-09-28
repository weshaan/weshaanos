import type { WeatherIconKind } from './wmoWeather'

export type WeatherCoordinates = {
  latitude: number
  longitude: number
}

export type WeatherLocation = {
  id: string
  name: string
  region?: string
  country?: string
  latitude: number
  longitude: number
  isPrimary?: boolean
}

export type WeatherDayForecast = {
  dayName: string
  highC: number
  lowC: number
  condition: string
  icon: WeatherIconKind
}

export type WeatherDetail = {
  locationId: string
  cityLabel: string
  regionLabel: string
  tempC: number
  condition: string
  heroIcon: WeatherIconKind
  isDay: boolean
  weatherCode: number
  highC: number
  lowC: number
  feelsLikeC: number
  humidity: number
  dewPointC: number
  pressureHpa: number
  pressureGaugePos: number
  windKph: number
  windGustKph: number
  windDirectionDeg: number
  visibilityKm: number
  dailyForecast: WeatherDayForecast[]
  precipLast6hMm: number
  precipNext24hMm: number
  precipTodayMm: number
  sunrise: string
  sunset: string
  sunriseIso: string
  sunsetIso: string
  sunDaylightProgress: number
  avgHighDeltaC: number
  todayHighC: number
  avgHighC: number
  avgHighUsesClimate: boolean
  moon: {
    phaseName: string
    /** Open-Meteo daily moon_phase in 0–1 (0 new → 0.5 full → 1 new). */
    phaseFraction: number
    illuminationPct: number
    moonriseLabel: string
    moonsetLabel: string
  }
  timezone: string
  fetchedAt: number
}
