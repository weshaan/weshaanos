import type { WeatherLocation } from './types'

type GeocodingResult = {
  results?: Array<{
    id: number
    name: string
    latitude: number
    longitude: number
    admin1?: string
    country?: string
  }>
}

export async function searchWeatherLocations(query: string): Promise<WeatherLocation[]> {
  const q = query.trim()
  if (q.length < 2) return []

  const params = new URLSearchParams({
    name: q,
    count: '8',
    language: 'en',
    format: 'json',
  })

  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`)
  if (!res.ok) return []

  const data = (await res.json()) as GeocodingResult
  return (data.results ?? []).map((r) => ({
    id: `geo-${r.id}`,
    name: r.name,
    region: r.admin1,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
  }))
}
