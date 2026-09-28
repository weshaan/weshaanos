import { useCallback, useEffect, useState } from 'react'
import {
  loadWeatherDetail,
  peekWeatherDetail,
} from '../weather/weatherDetailCache'
import type { WeatherDetail, WeatherLocation } from '../weather/types'

export function useWeatherDetail(location: WeatherLocation | null) {
  const locationId = location?.id ?? null

  const [detail, setDetail] = useState<WeatherDetail | null>(() =>
    locationId ? peekWeatherDetail(locationId) : null,
  )
  const [loading, setLoading] = useState(() =>
    locationId ? !peekWeatherDetail(locationId) : false,
  )
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!location) {
      setDetail(null)
      setLoading(false)
      setRefreshing(false)
      setError(null)
      return
    }

    let active = true
    const cached = peekWeatherDetail(location.id)

    if (cached) {
      setDetail(cached)
      setLoading(false)
      setError(null)
      setRefreshing(true)
      void loadWeatherDetail(location, { force: true })
        .then((data) => {
          if (active) setDetail(data)
        })
        .catch(() => {
          if (active) setError('Could not load weather')
        })
        .finally(() => {
          if (active) setRefreshing(false)
        })
      return () => {
        active = false
      }
    }

    setDetail(null)
    setLoading(true)
    setError(null)
    setRefreshing(false)
    void loadWeatherDetail(location)
      .then((data) => {
        if (active) setDetail(data)
      })
      .catch(() => {
        if (active) {
          setError('Could not load weather')
          setDetail(null)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [locationId, location?.latitude, location?.longitude])

  const reload = useCallback(() => {
    if (!location) return
    setRefreshing(true)
    setError(null)
    void loadWeatherDetail(location, { force: true })
      .then(setDetail)
      .catch(() => {
        setError('Could not load weather')
      })
      .finally(() => setRefreshing(false))
  }, [location])

  return { detail, loading, refreshing, error, reload }
}
