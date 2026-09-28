/** Blue gradient only — no condition video while forecast is loading */
export const WEATHER_SCENE_LOADING = 'weather-scene--default'

/** CSS modifier for dynamic sky backgrounds in the Weather app. */
export function weatherSceneClass(code: number, isDay: boolean): string {
  if (!isDay) return 'weather-scene--night'
  if (code === 0 || code === 1) return 'weather-scene--clear'
  if (code === 2) return 'weather-scene--partly'
  if (code >= 95) return 'weather-scene--storm'
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 94)) return 'weather-scene--rain'
  if (code >= 51 && code <= 57) return 'weather-scene--rain'
  return 'weather-scene--cloudy'
}
