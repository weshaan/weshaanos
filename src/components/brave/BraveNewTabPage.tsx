import { useEffect, useState, type FormEvent } from 'react'
import { SearchIcon, TabFaviconIcon } from './braveIcons'
import { BRAVE_NEW_TAB_LINKS, searchQueryToUrl, type TabFavicon } from './braveBrowserModel'
import './BraveNewTabPage.css'

type Link = {
  label: string
  url: string
  hint: string
  favicon: TabFavicon
}

type Props = {
  greeting: string
  desktopTip: string
  onNavigate: (url: string) => void
  links?: Link[]
}

function formatClockParts(date: Date) {
  const time = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  const dateLine = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  return { time, dateLine }
}

export function BraveNewTabPage({ greeting, desktopTip, onNavigate, links = BRAVE_NEW_TAB_LINKS }: Props) {
  const [query, setQuery] = useState('')
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = () => setNow(new Date())
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [])

  const { time, dateLine } = formatClockParts(now)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const url = searchQueryToUrl(query)
    if (url === 'brave://newtab') return
    onNavigate(url)
    setQuery('')
  }

  return (
    <div className="brave-start">
      <div className="brave-start__backdrop" aria-hidden>
        <span className="brave-start__orb brave-start__orb--a" />
        <span className="brave-start__orb brave-start__orb--b" />
        <span className="brave-start__orb brave-start__orb--c" />
        <span className="brave-start__mesh" />
      </div>

      <div className="brave-start__inner">
        <section className="brave-start__quick" aria-labelledby="brave-quick-links-heading">
          <h2 id="brave-quick-links-heading" className="brave-start__quick-title">Jump back in</h2>
          <ul className="brave-start__bento">
            {links.map((item) => (
              <li key={item.url} className="brave-start__bento-item">
                <button type="button" className="brave-start__bento-card" onClick={() => onNavigate(item.url)}>
                  <TabFaviconIcon kind={item.favicon} />
                  <span className="brave-start__bento-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <p className="brave-start__greeting">{greeting}</p>

        <form className="brave-start__search" onSubmit={onSubmit}>
          <SearchIcon size={16} className="brave-start__search-icon" />
          <input
            type="search"
            className="brave-start__search-input"
            placeholder="Search or enter address"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search or enter address"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="brave-start__search-kbd" aria-hidden>↵</kbd>
        </form>
      </div>

      <aside className="brave-start__tip-corner">
        <p className="brave-start__tip-label">Desktop tip</p>
        <p className="brave-start__tip-text">{desktopTip}</p>
      </aside>

      <div className="brave-start__clock-corner" aria-live="polite" aria-label="Date and time">
        <p className="brave-start__time">{time}</p>
        <p className="brave-start__date">{dateLine}</p>
      </div>
    </div>
  )
}
