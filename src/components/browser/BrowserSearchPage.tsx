import { SearchIcon } from './browserIcons'
import './BrowserSearchPage.css'

export function BrowserSearchPage() {
  return (
    <div className="browser-search-page">
      <span className="browser-search-page__icon" aria-hidden>
        <SearchIcon size={22} />
      </span>
      <h2 className="browser-search-page__title">Coming soon</h2>
      <p className="browser-search-page__lead">
        Search isn&apos;t ready in this browser yet. You can still open links and type URLs in the address bar.
      </p>
    </div>
  )
}
