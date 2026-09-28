import { useClock } from '../hooks/useClock'
import { useSecondHandRotation } from '../hooks/useSecondHandRotation'
import { MusicPlayerWidget } from './MusicPlayerWidget'
import { WeatherWidget } from './WeatherWidget'
import './Widgets.css'

export type ReminderAction = 'resume' | 'profile' | 'projects' | 'mail'

type Props = {
  onReminder: (action: ReminderAction) => void
  weatherEnabled?: boolean
  onOpenWeather?: () => void
}

const reminders: { id: ReminderAction; label: string; list: string }[] = [
  { id: 'resume', label: 'Open resume', list: 'Portfolio' },
  { id: 'profile', label: 'View profile', list: 'About' },
  { id: 'projects', label: 'View projects', list: 'Work' },
  { id: 'mail', label: 'Send an email', list: 'Inbox' },
]

export function Widgets({ onReminder, weatherEnabled = true, onOpenWeather }: Props) {
  const { widgetTime, now, seconds } = useClock()
  const secondHandRotation = useSecondHandRotation(seconds)
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  const dayNum = now.getDate()

  return (
    <aside className="widgets" aria-label="Desktop widgets">
      <WeatherWidget enabled={weatherEnabled} onOpen={onOpenWeather} />

      <div className="widgets__row">
        <div className="widget widget--clock">
          <div className="widget-clock__face">
            <div className="widget-clock__ticks" aria-hidden />
            <div
              className="widget-clock__seconds"
              style={{ transform: `rotate(${secondHandRotation}deg)` }}
              aria-hidden
            >
              <span className="widget-clock__seconds-dot" />
            </div>
            <time className="widget-clock__time">{widgetTime}</time>
          </div>
        </div>

        <MusicPlayerWidget />
      </div>

      <div className="widget widget--calendar">
        <div className="widget-calendar__today">
          <div className="widget-calendar__dayname">{dayName}</div>
          <div className="widget-calendar__daynum">{dayNum}</div>
          <div className="widget-calendar__empty">No Events Today</div>
        </div>
        <div className="widget-calendar__next">
          <div className="widget-calendar__next-label">THURS, 2 DEC</div>
          <div className="widget-calendar__event">
            <span className="widget-calendar__dot widget-calendar__dot--green" />
            add a reminder
          </div>
        </div>
      </div>

      <div className="widget widget--reminders">
        <div className="widget-reminders__title">Quick Actions</div>
        <ul className="widget-reminders__list">
          {reminders.map((item) => (
            <li key={item.id}>
              <button type="button" className="widget-reminders__item" onClick={() => onReminder(item.id)}>
                <span className="widget-reminders__circle" aria-hidden />
                <span className="widget-reminders__text">
                  <span className="widget-reminders__label">{item.label}</span>
                  <span className="widget-reminders__list-name">{item.list}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="widget widget--photos">
        <img className="widget-photos__img" src="/mikasa.jpg" alt="" />
        <div className="widget-photos__overlay">
          <span className="widget-photos__title">Memories</span>
          <span className="widget-photos__subtitle">Featured</span>
        </div>
      </div>
    </aside>
  )
}
