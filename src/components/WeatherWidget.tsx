import { useWeather } from '../hooks/useWeather'
import { WeatherIcon } from './WeatherIcon'

type Props = {
  enabled: boolean
  onOpen?: () => void
}

export function WeatherWidget({ enabled, onOpen }: Props) {
  const { view, retry } = useWeather(enabled)

  if (view.status === 'idle' || view.status === 'loading') {
    return (
      <button
        type="button"
        className="widget widget--weather widget--weather-button widget--weather-loading"
        onClick={onOpen}
        disabled={!onOpen}
        aria-busy="true"
        aria-label="Loading weather. Open Weather app."
      >
        <div className="widget-weather__top">
          <span className="widget-weather__city">Weather</span>
        </div>
        <div className="widget-weather__hero">
          <span className="widget-weather__temp">—</span>
          <span className="widget-weather__condition">Fetching forecast</span>
        </div>
      </button>
    )
  }

  if (view.status === 'error') {
    return (
      <button
        type="button"
        className="widget widget--weather widget--weather-button widget--weather-error"
        onClick={() => {
          onOpen?.()
          retry()
        }}
        aria-label="Weather unavailable. Open Weather app."
      >
        <span className="widget-weather__city">Weather</span>
        <span className="widget-weather__condition">{view.message}. Tap to open Weather.</span>
      </button>
    )
  }

  const { data } = view

  return (
    <button
      type="button"
      className="widget widget--weather widget--weather-button"
      onClick={onOpen}
      aria-label={`Weather in ${data.cityLabel}. Open Weather app.`}
    >
      <div className="widget-weather__top">
        <span className="widget-weather__city">{data.cityLabel}</span>
        <WeatherIcon kind={data.heroIcon} size={18} />
      </div>
      <div className="widget-weather__hero">
        <span className="widget-weather__temp">{data.tempC}°</span>
        <span className="widget-weather__condition">{data.condition}</span>
      </div>
      <div className="widget-weather__forecast">
        {data.hourly.map((slot, index) => (
          <div key={`${index}-${slot.timeLabel}`} className="widget-weather__slot">
            <span className="widget-weather__slot-time">{slot.timeLabel}</span>
            <WeatherIcon kind={slot.icon} size={12} />
            <span className="widget-weather__slot-temp">{slot.tempC}°</span>
          </div>
        ))}
      </div>
    </button>
  )
}
