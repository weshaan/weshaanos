import { useWindowTheme } from '../../context/WindowThemeContext'
import {
  GITHUB_AVATAR_SRC,
  GITHUB_CONTRIBUTION_SNAKE_DARK_SRC,
  GITHUB_CONTRIBUTION_SNAKE_LIGHT_SRC,
  GITHUB_CONTRIBUTIONS_LAST_YEAR,
  GITHUB_DISPLAY,
  GITHUB_PINNED_REPOS,
  GITHUB_PROFILE_URL,
  GITHUB_STATS_CARD_ONE_SRC,
  GITHUB_STATS_CARD_TWO_SRC,
} from './githubProfile'
import './BrowserGitHubPage.css'

export function BrowserGitHubPage() {
  const { theme } = useWindowTheme()
  const contributionSnakeSrc =
    theme === 'light' ? GITHUB_CONTRIBUTION_SNAKE_LIGHT_SRC : GITHUB_CONTRIBUTION_SNAKE_DARK_SRC

  return (
    <div className="browser-gh">
      <div className="browser-gh__page">
        <div className="browser-gh__layout">
          <aside className="browser-gh__profile-sidebar">
            <div className="browser-gh__profile-sticky">
              <img className="browser-gh__avatar-lg" src={GITHUB_AVATAR_SRC} alt="" decoding="async" />
              <h2 className="browser-gh__name">{GITHUB_DISPLAY.name}</h2>
              <p className="browser-gh__login">{GITHUB_DISPLAY.login}</p>
              <p className="browser-gh__bio">{GITHUB_DISPLAY.bio}</p>
              <a
                className="browser-gh__btn browser-gh__btn--follow"
                href={GITHUB_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Follow
              </a>
              <ul className="browser-gh__meta-list">
                <li className="browser-gh__meta-stats">
                  <a href={`${GITHUB_PROFILE_URL}?tab=followers`} target="_blank" rel="noopener noreferrer">
                    <strong>{GITHUB_DISPLAY.followers}</strong> followers
                  </a>
                  <span>·</span>
                  <a href={`${GITHUB_PROFILE_URL}?tab=following`} target="_blank" rel="noopener noreferrer">
                    <strong>{GITHUB_DISPLAY.following}</strong> following
                  </a>
                </li>
                <li className="browser-gh__meta-joined">
                  <CalendarIcon />
                  Joined {GITHUB_DISPLAY.joined}
                </li>
              </ul>
            </div>
          </aside>
          <div className="browser-gh__profile-main">
            <div className="browser-gh__stats-cards">
              <img
                className="browser-gh__stats-card"
                src={GITHUB_STATS_CARD_ONE_SRC}
                alt="Most used languages on GitHub"
                decoding="async"
              />
              <img
                className="browser-gh__stats-card"
                src={GITHUB_STATS_CARD_TWO_SRC}
                alt="GitHub stats: stars, commits, pull requests, and issues"
                decoding="async"
              />
            </div>
            <div className="browser-gh__pinned-head">
              <h2>Pinned</h2>
            </div>
            <div className="browser-gh__pinned-grid">
              {GITHUB_PINNED_REPOS.map((repo) => (
                <article key={repo.name} className="browser-gh__repo-card">
                  <div className="browser-gh__repo-card-head">
                    <a
                      className="browser-gh__repo-link"
                      href={`${GITHUB_PROFILE_URL}/${repo.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {repo.name}
                    </a>
                    <span className="browser-gh__repo-badge">Public</span>
                  </div>
                  <p className="browser-gh__repo-about">{repo.description}</p>
                  <div className="browser-gh__repo-meta">
                    {repo.language ? (
                      <span className="browser-gh__repo-lang">
                        <span
                          className="browser-gh__repo-lang-dot"
                          style={{ backgroundColor: repo.languageColor }}
                          aria-hidden
                        />
                        {repo.language}
                      </span>
                    ) : null}
                    <span className="browser-gh__repo-stars">
                      <StarIcon />
                      {repo.stars}
                    </span>
                    {repo.forks ? (
                      <span className="browser-gh__repo-forks">
                        <ForkIcon />
                        {repo.forks}
                      </span>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>

            <div className="browser-gh__activity">
              <h2 className="browser-gh__activity-title">
                {GITHUB_CONTRIBUTIONS_LAST_YEAR.toLocaleString()} contributions in the last year
              </h2>
              <img
                className="browser-gh__contrib-snake"
                src={contributionSnakeSrc}
                alt="GitHub contribution activity"
                decoding="async"
              />
              <div className="browser-gh__contrib-footer">
                <a
                  className="browser-gh__contrib-link"
                  href={GITHUB_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn how we count contributions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path
        d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416.856l-.759 4.023a.75.75 0 0 1-1.088.791L8 12.347l-3.574 1.818a.75.75 0 0 1-1.088-.79l-.758-4.023a.75.75 0 0 1 .416-.856l4.21-.612L7.327 3.668A.75.75 0 0 1 8 .25Z"
      />
    </svg>
  )
}

function ForkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path
        d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.372h-1.5A2.25 2.25 0 0 1 3.5 6.123v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"
      />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path
        d="M4.75 0a.75.75 0 0 1 .75.75V2h5V.75a.75.75 0 0 1 1.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 0 1 4.75 0ZM2.5 7.5v6.75c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V7.5Zm0-3.75v2h11v-2a.25.25 0 0 0-.25-.25H2.75a.25.25 0 0 0-.25.25Z"
      />
    </svg>
  )
}
