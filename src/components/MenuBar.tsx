import { useClock } from '../hooks/useClock'
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
}

export function MenuBar({ onAppleMenuClick }: MenuBarProps) {
  const { menuTime } = useClock()

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
        <span className="menu-bar__weather" aria-label="Weather 24 degrees Celsius">
          <WeatherMenuIcon />
          <span className="menu-bar__weather-temp">24°C</span>
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
        <time className="menu-bar__clock" dateTime={menuTime}>{menuTime}</time>
      </div>
    </header>
  )
}
