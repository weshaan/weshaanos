export type WeatherIconKind = 'clear-day' | 'clear-night' | 'partly' | 'cloud' | 'fog' | 'rain' | 'snow' | 'thunder'

export function wmoConditionLabel(code: number): string {
  if (code === 0) return 'Clear'
  if (code === 1) return 'Mostly Clear'
  if (code === 2) return 'Partly Cloudy'
  if (code === 3) return 'Overcast'
  if (code === 45 || code === 48) return 'Foggy'
  if (code >= 51 && code <= 57) return 'Drizzle'
  if (code >= 61 && code <= 67) return 'Rain'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 80 && code <= 82) return 'Showers'
  if (code >= 85 && code <= 86) return 'Snow Showers'
  if (code >= 95) return 'Thunderstorm'
  return 'Clear'
}

export function wmoIconKind(code: number, isDay: boolean): WeatherIconKind {
  if (code === 0) return isDay ? 'clear-day' : 'clear-night'
  if (code === 1 || code === 2) return 'partly'
  if (code === 3) return 'cloud'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 67) return 'rain'
  if (code >= 71 && code <= 77) return 'snow'
  if (code >= 80 && code <= 86) return 'rain'
  if (code >= 95) return 'thunder'
  return isDay ? 'partly' : 'cloud'
}
