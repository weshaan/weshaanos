import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useClock } from '../../hooks/useClock'
import { useDraggableWindow, type WindowPoint } from '../../hooks/useDraggableWindow'
import { refreshWidgetWeather, useWeather } from '../../hooks/useWeather'
import { useWeatherDetail } from '../../hooks/useWeatherDetail'
import {
  applyPrimaryToLocations,
  getPrimaryLocation,
  initialWeatherLocations,
  setPrimaryLocation,
} from '../../weather/primaryLocation'
import { windCardinal } from '../../weather/fetchWeatherDetail'
import {
  ensureSidebarWeather,
  peekWeatherDetail,
  prefetchWeatherDetail,
  summariesFromCache,
  subscribeWeatherDetailCache,
} from '../../weather/weatherDetailCache'
import { RefreshIcon } from '../icons/RefreshIcon'
import { WeatherIcon } from '../WeatherIcon'
import { searchWeatherLocations } from '../../weather/geocoding'
import type { WeatherDetail, WeatherLocation } from '../../weather/types'
import { formatTimeInTimeZone } from '../../weather/openMeteoUtils'
import { WEATHER_SCENE_LOADING, weatherSceneClass } from '../../weather/weatherScene'
import { WindowBottomDragHandle } from '../desktop/WindowBottomDragHandle'
import { WeatherScroll } from './WeatherScroll'
import { WeatherSceneEffects } from './WeatherSceneEffects'
import './WeatherWindow.css'
import './WeatherSceneEffects.css'

type Props = {
  windowId: string
  zIndex: number
  position: WindowPoint
  onPositionChange: (point: WindowPoint) => void
  onFocus: () => void
  onClose: () => void
}

export function WeatherWindow({
  windowId,
  zIndex,
  position,
  onPositionChange,
  onFocus,
  onClose,
}: Props) {
  const { titleBarProps, dragHandleProps } = useDraggableWindow(position, onPositionChange)
  const [locations, setLocations] = useState<WeatherLocation[]>(() => initialWeatherLocations())
  const [selectedId, setSelectedId] = useState(() => getPrimaryLocation().id)
  const [summaries, setSummaries] = useState<Record<string, WeatherDetail>>(() =>
    summariesFromCache(initialWeatherLocations().map((l) => l.id)),
  )
  const [search, setSearch] = useState('')
  const [searchHits, setSearchHits] = useState<WeatherLocation[]>([])
  const [searchOpen, setSearchOpen] = useState(false)

  const selected = useMemo(
    () => locations.find((l) => l.id === selectedId) ?? locations[0],
    [locations, selectedId],
  )

  const { view: widgetView } = useWeather(true)
  const { detail, loading, refreshing, error, reload } = useWeatherDetail(selected)
  const widgetRefreshing = widgetView.status === 'loading'

  const syncSummaries = useCallback(() => {
    setSummaries(summariesFromCache(locations.map((l) => l.id)))
  }, [locations])

  useEffect(() => {
    return subscribeWeatherDetailCache(syncSummaries)
  }, [syncSummaries])

  useEffect(() => {
    void ensureSidebarWeather(locations, selectedId)
  }, [locations, selectedId])

  const activeDetail =
    peekWeatherDetail(selectedId) ??
    (detail?.locationId === selectedId ? detail : null)
  const showMainLoading = !activeDetail && loading
  const showMainError = Boolean(error && !activeDetail)

  useEffect(() => {
    const q = search.trim()
    if (q.length < 2) {
      setSearchHits([])
      return
    }
    const id = window.setTimeout(() => {
      void searchWeatherLocations(q).then(setSearchHits)
    }, 280)
    return () => window.clearTimeout(id)
  }, [search])

  const setAsMyLocation = useCallback(() => {
    if (!selected?.isPrimary) {
      setPrimaryLocation(selected)
      setLocations((prev) =>
        applyPrimaryToLocations(prev.some((l) => l.id === selected.id) ? prev : [...prev, selected]),
      )
    }
  }, [selected])

  const addLocation = (loc: WeatherLocation) => {
    if (locations.some((l) => l.id === loc.id)) {
      setSelectedId(loc.id)
    } else {
      setLocations((prev) => [...prev, { ...loc, isPrimary: false }])
      setSelectedId(loc.id)
    }
    setSearch('')
    setSearchHits([])
    setSearchOpen(false)
  }

  const scene = activeDetail
    ? weatherSceneClass(activeDetail.weatherCode, activeDetail.isDay)
    : WEATHER_SCENE_LOADING

  return (
    <div
      className={`weather-window ${scene}`}
      style={{ left: position.x, top: position.y, zIndex }}
      role="dialog"
      aria-label="Weather"
      data-window-id={windowId}
      onPointerDown={onFocus}
    >
      <WeatherSceneBackdrop scene={scene} />
      <header className="weather-window__titlebar" {...titleBarProps}>
        <button type="button" className="weather-window__traffic" onClick={onClose} aria-label="Close">
          <span className="weather-window__dot weather-window__dot--close" />
          <span className="weather-window__dot weather-window__dot--min" />
          <span className="weather-window__dot weather-window__dot--max" />
        </button>
        <span className="weather-window__title">Weather</span>
      </header>

      <div className="weather-window__body">
        <aside className="weather-sidebar">
          <div className="weather-sidebar__search-wrap">
            <input
              type="search"
              className="weather-sidebar__search"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              aria-label="Search cities"
            />
            {searchOpen && searchHits.length > 0 && (
              <WeatherScroll className="weather-sidebar__search-scroll">
                <ul className="weather-sidebar__search-results">
                  {searchHits.map((hit) => (
                    <li key={hit.id}>
                      <button type="button" onClick={() => addLocation(hit)}>
                        {hit.name}
                        {hit.region ? `, ${hit.region}` : ''}
                      </button>
                    </li>
                  ))}
                </ul>
              </WeatherScroll>
            )}
          </div>

          <WeatherScroll className="weather-sidebar__list-scroll">
            <ul className="weather-sidebar__list">
              {locations.map((loc) => {
              const sum = summaries[loc.id]
              const active = loc.id === selectedId
              return (
                <li key={loc.id}>
                  <button
                    type="button"
                    className={`weather-sidebar__card${active ? ' weather-sidebar__card--active' : ''}`}
                    onClick={() => setSelectedId(loc.id)}
                    onMouseEnter={() => prefetchWeatherDetail(loc)}
                    onFocus={() => prefetchWeatherDetail(loc)}
                  >
                    <div className="weather-sidebar__card-top">
                      <div>
                        <p className="weather-sidebar__card-name">{loc.name}</p>
                        <p className="weather-sidebar__card-meta">
                          <SidebarLocationMeta isPrimary={loc.isPrimary} timezone={sum?.timezone} />
                        </p>
                      </div>
                      <span className="weather-sidebar__card-temp">{sum ? `${sum.tempC}°` : '—'}</span>
                    </div>
                    <div className="weather-sidebar__card-bottom">
                      <span>{sum?.condition ?? 'Loading…'}</span>
                      {sum ? (
                        <span className="weather-sidebar__card-hilo">H:{sum.highC}° L:{sum.lowC}°</span>
                      ) : null}
                    </div>
                  </button>
                </li>
              )
              })}
            </ul>
          </WeatherScroll>
        </aside>

        <WeatherScroll className="weather-main">
          {showMainLoading && <WeatherMainSkeleton />}
          {showMainError && (
            <p className="weather-main__status">
              {error}.{' '}
              <button type="button" className="weather-main__retry" onClick={() => void reload()}>
                Retry
              </button>
            </p>
          )}
          {activeDetail && (
            <div
              key={selectedId}
              className={`weather-main__pane${refreshing ? ' weather-main__pane--refreshing' : ''}`}
            >
              <header className="weather-main__hero">
                <div className="weather-main__hero-toolbar">
                  <button
                    type="button"
                    className="weather-main__refresh-btn"
                    disabled={widgetRefreshing}
                    onClick={() => refreshWidgetWeather()}
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label="Refresh desktop weather widget"
                    aria-busy={widgetRefreshing}
                    title="Refresh widget"
                  >
                    <RefreshIcon
                      size={16}
                      className={widgetRefreshing ? 'weather-main__refresh-btn__icon--spin' : undefined}
                    />
                  </button>
                  <button
                    type="button"
                    className="weather-main__hero-btn"
                    disabled={selected.isPrimary}
                    onClick={setAsMyLocation}
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label={
                      selected.isPrimary
                        ? 'This city is already My Location'
                        : `Set ${activeDetail.cityLabel} as My Location`
                    }
                  >
                    {selected.isPrimary ? 'My Location' : 'Set as My Location'}
                  </button>
                </div>
                <p className="weather-main__eyebrow" aria-hidden={!selected.isPrimary}>
                  {selected.isPrimary ? 'My Location' : '\u00a0'}
                </p>
                <h1 className="weather-main__city">{activeDetail.cityLabel}</h1>
                <p className="weather-main__summary">
                  <span>{activeDetail.tempC}°</span>
                  <span className="weather-main__pipe">|</span>
                  <span>{activeDetail.condition}</span>
                </p>
              </header>

              <div className="weather-grid">
                <article className="weather-card weather-card--week">
                  <h2 className="weather-card__title">7-Day Forecast</h2>
                  <ul className="weather-week">
                    {activeDetail.dailyForecast.map((day) => (
                      <li key={day.dayName} className="weather-week__day">
                        <span className="weather-week__name">{day.dayName}</span>
                        <WeatherIcon kind={day.icon} size={22} />
                        <span className="weather-week__hi">{day.highC}°</span>
                        <span className="weather-week__lo">{day.lowC}°</span>
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="weather-card weather-card--wide">
                  <h2 className="weather-card__title">Wind</h2>
                  <div className="weather-card__split">
                    <ul className="weather-card__facts">
                      <li>Wind: {activeDetail.windKph} kph</li>
                      <li>Gusts: {activeDetail.windGustKph} kph</li>
                      <li>Direction: {windCardinal(activeDetail.windDirectionDeg)}</li>
                    </ul>
                    <div className="weather-compass" aria-hidden>
                      <div
                        className="weather-compass__needle"
                        style={{ transform: `rotate(${activeDetail.windDirectionDeg}deg)` }}
                      />
                      <span className="weather-compass__speed">{activeDetail.windKph} kph</span>
                    </div>
                  </div>
                </article>

                <article className="weather-card weather-card--moonrise">
                  <h2 className="weather-card__title">Moonrise</h2>
                  <div className="weather-moonrise">
                    <div
                      className="weather-moon__halo weather-moon__halo--sm"
                      style={{ ['--moon-lit' as string]: `${activeDetail.moon.illuminationPct}%` }}
                      aria-hidden
                    >
                      <div
                        className={`weather-moon__disc${
                          activeDetail.moon.phaseFraction < 0.5
                            ? ' weather-moon__disc--waxing'
                            : ' weather-moon__disc--waning'
                        }`}
                      >
                        <span className="weather-moon__layer weather-moon__layer--base" />
                        <span className="weather-moon__layer weather-moon__layer--emissive" />
                        <span className="weather-moon__layer weather-moon__layer--sheen" />
                      </div>
                    </div>
                    <div>
                      <p className="weather-card__value">{activeDetail.moon.moonriseLabel}</p>
                      <p className="weather-card__footnote">{activeDetail.moon.phaseName}</p>
                      <p className="weather-card__footnote">Moonset: {activeDetail.moon.moonsetLabel}</p>
                    </div>
                  </div>
                </article>

                <WeatherMetricCard title="Sunset" value={activeDetail.sunset}>
                  <SunArc progress={activeDetail.sunDaylightProgress} />
                  <p className="weather-card__footnote">Sunrise: {activeDetail.sunrise}</p>
                </WeatherMetricCard>

                <WeatherMetricCard title="Feels Like" value={`${activeDetail.feelsLikeC}°`}>
                  <p className="weather-card__footnote">
                    {activeDetail.feelsLikeC > activeDetail.tempC
                      ? 'It feels warmer than the actual temperature.'
                      : activeDetail.feelsLikeC < activeDetail.tempC
                        ? 'It feels cooler than the actual temperature.'
                        : 'Matches the actual temperature right now.'}
                  </p>
                </WeatherMetricCard>

                <WeatherMetricCard title="Precipitation" value={`${activeDetail.precipLast6hMm} mm in last 6h`}>
                  <p className="weather-card__footnote">
                    {activeDetail.precipNext24hMm} mm forecast in next 24h · {activeDetail.precipTodayMm} mm today.
                  </p>
                </WeatherMetricCard>

                <WeatherMetricCard title="Visibility" value={`${activeDetail.visibilityKm} km`}>
                  <p className="weather-card__footnote">
                    {activeDetail.visibilityKm >= 10 ? 'Clear view.' : 'Reduced visibility.'}
                  </p>
                </WeatherMetricCard>

                <WeatherMetricCard title="Humidity" value={`${activeDetail.humidity}%`}>
                  <p className="weather-card__footnote">The dew point is {activeDetail.dewPointC}° right now.</p>
                </WeatherMetricCard>

                <WeatherMetricCard title="Pressure" value={`${activeDetail.pressureHpa} hPa`}>
                  <div className="weather-pressure-gauge" aria-hidden>
                    <span>Low</span>
                    <span
                      className="weather-pressure-gauge__dot"
                      style={{ ['--pressure-pos' as string]: String(activeDetail.pressureGaugePos) }}
                    />
                    <span>High</span>
                  </div>
                </WeatherMetricCard>

                <WeatherMetricCard
                  title="Averages"
                  value={`${activeDetail.avgHighDeltaC >= 0 ? '+' : ''}${activeDetail.avgHighDeltaC}°`}
                >
                  <p className="weather-card__footnote">
                    {activeDetail.avgHighUsesClimate
                      ? 'vs climate normal daily high for today'
                      : 'vs 7-day forecast average high'}
                  </p>
                  <p className="weather-card__footnote">
                    Today H:{activeDetail.todayHighC}° · Normal H:{activeDetail.avgHighC}°
                  </p>
                </WeatherMetricCard>
              </div>
            </div>
          )}
        </WeatherScroll>
      </div>
      <WindowBottomDragHandle dragHandleProps={dragHandleProps} />
    </div>
  )
}

const SCENE_FADE_MS = 880

function WeatherSceneBackdrop({ scene }: { scene: string }) {
  const [baseScene, setBaseScene] = useState(scene)
  const [fadeScene, setFadeScene] = useState<string | null>(null)

  useEffect(() => {
    if (scene === baseScene && fadeScene === null) return
    if (fadeScene === scene) return
    setFadeScene(scene)
  }, [scene, baseScene, fadeScene])

  useEffect(() => {
    if (!fadeScene) return
    const id = window.setTimeout(() => {
      setBaseScene(fadeScene)
      setFadeScene(null)
    }, SCENE_FADE_MS)
    return () => window.clearTimeout(id)
  }, [fadeScene])

  const activeScene = fadeScene ?? baseScene

  return (
    <div className="weather-window__backdrops" aria-hidden>
      <div className={`weather-window__backdrop ${baseScene}`} />
      {fadeScene ? (
        <div className={`weather-window__backdrop ${fadeScene} weather-window__backdrop--fade-in`} />
      ) : null}
      <WeatherSceneEffects scene={activeScene} />
    </div>
  )
}

function WeatherMainSkeleton() {
  return (
    <div className="weather-main__skeleton" aria-busy="true" aria-label="Loading forecast">
      <div className="weather-main__skeleton-hero">
        <span className="weather-main__skeleton-line weather-main__skeleton-line--city" />
        <span className="weather-main__skeleton-line weather-main__skeleton-line--summary" />
      </div>
      <div className="weather-main__skeleton-grid">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="weather-main__skeleton-card" />
        ))}
      </div>
    </div>
  )
}

function SidebarLocationMeta({
  isPrimary,
  timezone,
}: {
  isPrimary?: boolean
  timezone?: string
}) {
  const { now } = useClock()
  if (isPrimary) return 'My Location'
  if (!timezone) return '—'
  return formatTimeInTimeZone(timezone, now)
}

function WeatherMetricCard({
  title,
  value,
  children,
}: {
  title: string
  value: string
  children?: ReactNode
}) {
  return (
    <article className="weather-card">
      <h2 className="weather-card__title">{title}</h2>
      <p className="weather-card__value">{value}</p>
      {children}
    </article>
  )
}

function SunArc({ progress }: { progress: number }) {
  const t = Math.min(1, Math.max(0, progress))
  const cx = 8 + t * 104
  const cy = 40 - Math.sin(t * Math.PI) * 36

  return (
    <div className="weather-sun-arc" aria-hidden>
      <svg viewBox="0 0 120 48" className="weather-sun-arc__svg">
        <path d="M8 40 Q60 4 112 40" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="5" fill="#fcd34d" />
      </svg>
    </div>
  )
}
