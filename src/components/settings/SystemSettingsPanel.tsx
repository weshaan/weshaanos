import { useWindowTheme } from '../../context/WindowThemeContext'
import './SystemSettingsPanel.css'

type Props = {
  onOpenClockSettings?: () => void
}

export function SystemSettingsPanel({ onOpenClockSettings }: Props) {
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

      <section className="system-settings__section" aria-label="Clock">
        <div className="system-settings__row">
          <div className="system-settings__row-text">
            <span className="system-settings__label">Customize clock</span>
            <span className="system-settings__hint">Desktop widget face, time format, and seconds</span>
          </div>
          <button
            type="button"
            className="system-settings__action-btn"
            onClick={onOpenClockSettings}
            disabled={!onOpenClockSettings}
          >
            Open Clock…
          </button>
        </div>
      </section>

      <ul className="system-settings__list">
        <li>Wallpaper: Mikasa</li>
        <li>Menu bar: maroon glass</li>
        <li>Dock magnification: on</li>
      </ul>
    </div>
  )
}
