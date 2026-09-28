import { formatMenuTime } from '../clock/clockFormat'
import { useClockWidget } from '../context/ClockWidgetContext'
import { useClock } from '../hooks/useClock'
import { useWeather } from '../hooks/useWeather'
import {
  AppleMenuIcon,
  BatteryMenuIcon,
  BluetoothMenuIcon,
  ControlCenterMenuIcon,
  WeatherMenuIcon,
  WifiMenuIcon,
} from './menuBar/MenuBarIcons'
import './MenuBar.css'

const menuItems = ['File', 'Edit', 'View', 'Go', 'Window', 'Help']

type MenuBarProps = {
  onAppleMenuClick?: () => void
  weatherEnabled?: boolean
}

export function MenuBar({ onAppleMenuClick, weatherEnabled = false }: MenuBarProps) {
  const { now } = useClock()
  const { timeFormat } = useClockWidget()
  const menuTime = formatMenuTime(now, timeFormat)
  const { tempLabel } = useWeather(weatherEnabled)

  return (
    <header className="menu-bar">
      <div className="menu-bar__left">
        <button
          type="button"
          className="menu-bar__apple-btn"
          aria-label="About weshaanOS"
          onClick={onAppleMenuClick}
        >
          <AppleMenuIcon className="menu-bar__apple" />
        </button>
        <nav className="menu-bar__menus" aria-label="Application menu">
          <button type="button" className="menu-bar__item menu-bar__item--app">
            weshaanOS
          </button>
          {menuItems.map((item) => (
            <button key={item} type="button" className="menu-bar__item">
              {item}
            </button>
          ))}
        </nav>
      </div>
      <div className="menu-bar__right">
        <span className="menu-bar__weather" aria-label={`Weather ${tempLabel}`}>
          <WeatherMenuIcon />
          <span className="menu-bar__weather-temp">{tempLabel}</span>
        </span>
        <button type="button" className="menu-bar__status-btn" aria-label="Bluetooth">
          <BluetoothMenuIcon />
        </button>
        <button type="button" className="menu-bar__status-btn" aria-label="Wi-Fi">
          <WifiMenuIcon />
        </button>
        <button type="button" className="menu-bar__battery" aria-label="Battery 80 percent">
          <span className="menu-bar__battery-pct">80%</span>
          <BatteryMenuIcon level={80} />
        </button>
        <button type="button" className="menu-bar__status-btn menu-bar__status-btn--cc" aria-label="Control Center">
          <ControlCenterMenuIcon />
        </button>
        <time className="menu-bar__clock" dateTime={now.toISOString()}>{menuTime}</time>
      </div>
    </header>
  )
}
