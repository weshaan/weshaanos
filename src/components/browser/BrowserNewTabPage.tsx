import { useEffect, useState, type FormEvent } from 'react'
import { SearchIcon, TabFaviconIcon } from './browserIcons'
import { BROWSER_NEW_TAB_LINKS, searchQueryToUrl, type TabFavicon } from './browserAppModel'
import './BrowserNewTabPage.css'

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

export function BrowserNewTabPage({ greeting, desktopTip, onNavigate, links = BROWSER_NEW_TAB_LINKS }: Props) {
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
    if (url === 'browser://newtab') return
    onNavigate(url)
    setQuery('')
  }

  return (
    <div className="browser-start">
      <div className="browser-start__backdrop" aria-hidden>
        <span className="browser-start__orb browser-start__orb--a" />
        <span className="browser-start__orb browser-start__orb--b" />
        <span className="browser-start__orb browser-start__orb--c" />
        <span className="browser-start__mesh" />
      </div>

      <div className="browser-start__inner">
        <section className="browser-start__quick" aria-labelledby="browser-quick-links-heading">
          <h2 id="browser-quick-links-heading" className="browser-start__quick-title">Jump back in</h2>
          <ul className="browser-start__bento">
            {links.map((item) => (
              <li key={item.url} className="browser-start__bento-item">
                <button type="button" className="browser-start__bento-card" onClick={() => onNavigate(item.url)}>
                  <TabFaviconIcon kind={item.favicon} />
                  <span className="browser-start__bento-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <p className="browser-start__greeting">{greeting}</p>

        <form className="browser-start__search" onSubmit={onSubmit}>
          <SearchIcon size={16} className="browser-start__search-icon" />
          <input
            type="search"
            className="browser-start__search-input"
            placeholder="Search or enter address"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search or enter address"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="browser-start__search-kbd" aria-hidden>↵</kbd>
        </form>
      </div>

      <aside className="browser-start__tip-corner">
        <p className="browser-start__tip-label">Desktop tip</p>
        <p className="browser-start__tip-text">{desktopTip}</p>
      </aside>

      <div className="browser-start__clock-corner" aria-live="polite" aria-label="Date and time">
        <p className="browser-start__time">{time}</p>
        <p className="browser-start__date">{dateLine}</p>
      </div>
    </div>
  )
}
