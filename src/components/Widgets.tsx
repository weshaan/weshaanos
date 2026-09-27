import { useClock } from '../hooks/useClock'
import { useSecondHandRotation } from '../hooks/useSecondHandRotation'
import { CloudIcon, MoonIcon, PartlyCloudyIcon } from './icons/WeatherSymbols'
import { MusicPlayerWidget } from './MusicPlayerWidget'
import './Widgets.css'

const forecast = [
  { time: 'Now', Icon: PartlyCloudyIcon, temp: 24 },
  { time: '1AM', Icon: CloudIcon, temp: 23 },
  { time: '2AM', Icon: CloudIcon, temp: 22 },
  { time: '3AM', Icon: MoonIcon, temp: 21 },
  { time: '4AM', Icon: MoonIcon, temp: 20 },
] as const

export type ReminderAction = 'resume' | 'profile' | 'projects' | 'mail'

type Props = {
  onReminder: (action: ReminderAction) => void
}

const reminders: { id: ReminderAction; label: string; list: string }[] = [
  { id: 'resume', label: 'Open resume', list: 'Portfolio' },
  { id: 'profile', label: 'View profile', list: 'About' },
  { id: 'projects', label: 'View projects', list: 'Work' },
  { id: 'mail', label: 'Send an email', list: 'Inbox' },
]

export function Widgets({ onReminder }: Props) {
  const { widgetTime, now, seconds } = useClock()
  const secondHandRotation = useSecondHandRotation(seconds)
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  const dayNum = now.getDate()

  return (
    <aside className="widgets" aria-label="Desktop widgets">
      <div className="widget widget--weather">
        <div className="widget-weather__top">
          <span className="widget-weather__city">hello world</span>
          <PartlyCloudyIcon size={18} />
        </div>
        <div className="widget-weather__hero">
          <span className="widget-weather__temp">24°</span>
          <span className="widget-weather__condition">Mostly Clear</span>
        </div>
        <div className="widget-weather__forecast">
          {forecast.map((slot) => (
            <div key={slot.time} className="widget-weather__slot">
              <span className="widget-weather__slot-time">{slot.time}</span>
              <slot.Icon size={12} />
              <span className="widget-weather__slot-temp">{slot.temp}°</span>
            </div>
          ))}
        </div>
      </div>

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
