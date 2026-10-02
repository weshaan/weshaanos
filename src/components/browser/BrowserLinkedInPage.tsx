import { LINKEDIN_PROFILE_URL } from './browserAppModel'
import {
  LINKEDIN_BANNER_SRC,
  LINKEDIN_DISPLAY,
  LINKEDIN_EDUCATION,
  LINKEDIN_EXPERIENCE,
  LINKEDIN_PICTURE_SRC,
  LINKEDIN_VOLUNTEERING,
  linkedInLogoForCompany,
} from './linkedInProfile'
import { linkedInPath } from './browserSiteUrls'
import './BrowserLinkedInPage.css'

type Props = {
  url: string
  onOpenMail?: () => void
}

const PROFILE_PATH = linkedInPath(LINKEDIN_PROFILE_URL)

type RoleEntry = {
  title: string
  company: string
  dates: string
  location: string
  bullets: readonly string[]
}

function LinkedInRoleSection({
  title,
  roles,
  idPrefix,
}: {
  title: string
  roles: readonly RoleEntry[]
  idPrefix: string
}) {
  return (
    <section className="browser-li__card">
      <h2>{title}</h2>
      <ul className="browser-li__experience">
        {roles.map((role) => {
          const logoSrc = linkedInLogoForCompany(role.company)
          return (
          <li key={`${idPrefix}-${role.company}-${role.title}`}>
            <div className="browser-li__exp-icon">
              {logoSrc ? <img src={logoSrc} alt="" /> : null}
            </div>
            <div>
              <h3>{role.title}</h3>
              <p className="browser-li__exp-company">{role.company}</p>
              <p className="browser-li__exp-meta">{role.dates} · {role.location}</p>
              <ul>
                {role.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </li>
          )
        })}
      </ul>
    </section>
  )
}

export function BrowserLinkedInPage({ url, onOpenMail }: Props) {
  const path = linkedInPath(url)
  const isProfile = path === PROFILE_PATH

  return (
    <div className="browser-li">
      {isProfile ? (
        <main className="browser-li__main">
          <section className="browser-li__card browser-li__profile">
            <img className="browser-li__cover" src={LINKEDIN_BANNER_SRC} alt="" decoding="async" />
            <div className="browser-li__profile-body">
              <img className="browser-li__avatar" src={LINKEDIN_PICTURE_SRC} alt="" decoding="async" />
              <h1 className="browser-li__name">{LINKEDIN_DISPLAY.name}</h1>
              <p className="browser-li__headline">{LINKEDIN_DISPLAY.headline}</p>
              <p className="browser-li__followers">{LINKEDIN_DISPLAY.followers}</p>
              <p className="browser-li__meta">
                {LINKEDIN_DISPLAY.location} ·{' '}
                <button
                  type="button"
                  className="browser-li__link"
                  onClick={() => onOpenMail?.()}
                >
                  Contact info
                </button>
              </p>
              <div className="browser-li__actions">
                <a
                  className="browser-li__btn browser-li__btn--primary"
                  href={LINKEDIN_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Connect
                </a>
                <a
                  className="browser-li__btn"
                  href={LINKEDIN_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Message
                </a>
              </div>
            </div>
          </section>

          <section className="browser-li__card">
            <h2>About</h2>
            {LINKEDIN_DISPLAY.about.split('\n\n').map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </section>

          <LinkedInRoleSection title="Experience" roles={LINKEDIN_EXPERIENCE} idPrefix="exp" />
          <LinkedInRoleSection title="Volunteering" roles={LINKEDIN_VOLUNTEERING} idPrefix="vol" />

          <section className="browser-li__card">
            <h2>Education</h2>
            <ul className="browser-li__experience">
              <li>
                <div className="browser-li__exp-icon">
                  <img src={LINKEDIN_EDUCATION.logoSrc} alt="" />
                </div>
                <div>
                  <h3>{LINKEDIN_EDUCATION.school}</h3>
                  <p className="browser-li__exp-company">{LINKEDIN_EDUCATION.degree}</p>
                  <p className="browser-li__exp-meta">{LINKEDIN_EDUCATION.dates}</p>
                </div>
              </li>
            </ul>
          </section>
        </main>
      ) : (
        <main className="browser-li__main browser-li__main--fallback">
          <p className="browser-li__fallback">
            This LinkedIn path isn&apos;t mocked yet. Open{' '}
            <span className="browser-li__mono">linkedin.com/in/eshaan-walia</span> for the profile view.
          </p>
        </main>
      )}
    </div>
  )
}
