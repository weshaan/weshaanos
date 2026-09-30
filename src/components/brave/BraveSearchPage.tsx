import { SearchIcon } from './braveIcons'
import './BraveSearchPage.css'

export function BraveSearchPage() {
  return (
    <div className="brave-search-page">
      <span className="brave-search-page__icon" aria-hidden>
        <SearchIcon size={22} />
      </span>
      <h2 className="brave-search-page__title">Coming soon</h2>
      <p className="brave-search-page__lead">
        Search isn&apos;t ready in this browser yet. You can still open links and type URLs in the address bar.
      </p>
    </div>
  )
}
