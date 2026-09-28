import { useWindowTheme } from '../../context/WindowThemeContext'
import './SystemSettingsPanel.css'

export function SystemSettingsPanel() {
  const { theme, setTheme } = useWindowTheme()
  const isDark = theme === 'dark'

  return (
    <div className="system-settings">
      <h2>weshaanOS</h2>
      <p>Appearance, dock, and desktop preferences — customize this portfolio shell here.</p>

      <div className="system-settings__row">
        <div className="system-settings__row-text">
          <span className="system-settings__label">Window appearance</span>
          <span className="system-settings__hint">
            {isDark ? 'Dark' : 'Light'} — windows, Finder, widgets
          </span>
        </div>
        <button
          type="button"
          className={`system-settings__toggle ${isDark ? 'system-settings__toggle--on' : ''}`}
          role="switch"
          aria-checked={isDark}
          aria-label="Dark mode for windows"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
          <span className="system-settings__toggle-knob" />
        </button>
      </div>

      <ul className="system-settings__list">
        <li>Wallpaper: Mikasa</li>
        <li>Menu bar: maroon glass</li>
        <li>Dock magnification: on</li>
      </ul>
    </div>
  )
}
