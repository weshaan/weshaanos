import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { WindowBottomDragHandle } from '../desktop/WindowBottomDragHandle'
import { useDraggableWindow, type WindowPoint } from '../../hooks/useDraggableWindow'
import {
  createTabId,
  defaultBraveTabs,
  faviconForUrl,
  resolveBravePage,
  titleForUrl,
  type BraveTab,
  type TabFavicon,
} from './braveBrowserModel'
import './BraveBrowserWindow.css'

type Props = {
  windowId: string
  zIndex: number
  position: WindowPoint
  onPositionChange: (point: WindowPoint) => void
  onFocus: () => void
  onClose: () => void
}

type TabState = {
  tab: BraveTab
  history: string[]
  historyIndex: number
  frameKey: number
}

function createTabState(tab: BraveTab): TabState {
  return { tab, history: [tab.url], historyIndex: 0, frameKey: 0 }
}

export function BraveBrowserWindow({
  windowId,
  zIndex,
  position,
  onPositionChange,
  onFocus,
  onClose,
}: Props) {
  const { titleBarProps, dragHandleProps } = useDraggableWindow(position, onPositionChange)
  const [sessions, setSessions] = useState<TabState[]>(() => defaultBraveTabs().map(createTabState))
  const [activeId, setActiveId] = useState(() => sessions[0]?.tab.id ?? '')
  const [addressDraft, setAddressDraft] = useState(sessions[0]?.tab.url ?? 'brave://newtab')
  const [addressFocused, setAddressFocused] = useState(false)

  const activeSession = sessions.find((s) => s.tab.id === activeId) ?? sessions[0]
  const activeUrl = activeSession?.history[activeSession.historyIndex] ?? 'brave://newtab'
  const displayUrl = addressFocused ? addressDraft : activeUrl
  const page = resolveBravePage(activeUrl)
  const canBack = (activeSession?.historyIndex ?? 0) > 0
  const canForward = activeSession ? activeSession.historyIndex < activeSession.history.length - 1 : false

  useEffect(() => {
    if (!addressFocused && activeSession) {
      setAddressDraft(activeSession.history[activeSession.historyIndex])
    }
  }, [activeSession, addressFocused])

  const navigateActive = useCallback((url: string, push = true) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.tab.id !== activeId) return s
        const title = titleForUrl(url)
        const favicon = faviconForUrl(url)
        const nextTab = { ...s.tab, url, title, favicon }
        if (!push) {
          return { ...s, tab: nextTab, frameKey: s.frameKey + 1 }
        }
        const trimmed = s.history.slice(0, s.historyIndex + 1)
        trimmed.push(url)
        return {
          tab: nextTab,
          history: trimmed,
          historyIndex: trimmed.length - 1,
          frameKey: s.frameKey + 1,
        }
      }),
    )
    setAddressDraft(url)
  }, [activeId])

  const selectTab = (id: string) => {
    setActiveId(id)
    const session = sessions.find((s) => s.tab.id === id)
    if (session) setAddressDraft(session.history[session.historyIndex])
  }

  const addTab = () => {
    const tab: BraveTab = {
      id: createTabId(),
      title: 'New Tab',
      url: 'brave://newtab',
      favicon: 'brave',
    }
    const session = createTabState(tab)
    setSessions((prev) => [...prev, session])
    setActiveId(tab.id)
    setAddressDraft(tab.url)
  }

  const closeTab = (id: string) => {
    if (sessions.length <= 1) return
    const closingIndex = sessions.findIndex((s) => s.tab.id === id)
    setSessions((prev) => prev.filter((s) => s.tab.id !== id))
    if (activeId === id) {
      const next = sessions.filter((s) => s.tab.id !== id)
      const fallback = next[Math.min(closingIndex, next.length - 1)] ?? next[0]
      if (fallback) {
        setActiveId(fallback.tab.id)
        setAddressDraft(fallback.history[fallback.historyIndex])
      }
    }
  }

  const goBack = () => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.tab.id !== activeId || s.historyIndex <= 0) return s
        const historyIndex = s.historyIndex - 1
        const url = s.history[historyIndex]
        return {
          ...s,
          historyIndex,
          tab: { ...s.tab, url, title: titleForUrl(url), favicon: faviconForUrl(url) },
          frameKey: s.frameKey + 1,
        }
      }),
    )
  }

  const goForward = () => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.tab.id !== activeId || s.historyIndex >= s.history.length - 1) return s
        const historyIndex = s.historyIndex + 1
        const url = s.history[historyIndex]
        return {
          ...s,
          historyIndex,
          tab: { ...s.tab, url, title: titleForUrl(url), favicon: faviconForUrl(url) },
          frameKey: s.frameKey + 1,
        }
      }),
    )
  }

  const reload = () => {
    setSessions((prev) =>
      prev.map((s) => (s.tab.id === activeId ? { ...s, frameKey: s.frameKey + 1 } : s)),
    )
  }

  const commitAddress = () => {
    let url = addressDraft.trim()
    if (!url) url = 'brave://newtab'
    else if (!/^https?:\/\//i.test(url) && !url.includes('://')) {
      url = `https://${url}`
    }
    navigateActive(url)
    setAddressFocused(false)
  }

  const shortcuts = useMemo(
    () => [
      { label: 'Projects', url: 'brave://projects', hint: 'Work & case studies', favicon: 'folder' as TabFavicon },
      { label: 'About', url: 'brave://about', hint: 'This desktop portfolio', favicon: 'home' as TabFavicon },
      { label: 'GitHub', url: 'https://github.com', hint: 'github.com', favicon: 'github' as TabFavicon },
      { label: 'Email', url: 'mailto:weshaan108@gmail.com', hint: 'Get in touch', favicon: 'mail' as TabFavicon },
    ],
    [],
  )

  const httpsActive = /^https:\/\//i.test(activeUrl)

  return (
    <div
      className="brave-window"
      style={{ left: position.x, top: position.y, zIndex }}
      role="dialog"
      aria-label="Brave"
      data-window-id={windowId}
      onPointerDown={onFocus}
    >
      <header
        className="brave-window__titlebar"
        {...titleBarProps}
        style={{ touchAction: 'none', cursor: 'grab' }}
      >
        <button type="button" className="brave-window__traffic" onClick={onClose} aria-label="Close">
          <span className="brave-window__dot brave-window__dot--close" aria-hidden />
          <span className="brave-window__dot brave-window__dot--min" aria-hidden />
          <span className="brave-window__dot brave-window__dot--max" aria-hidden />
        </button>
        <div className="brave-window__titlebar-brand" aria-hidden>
          <BraveLogoMark small />
          <span>Brave</span>
        </div>
      </header>

      <div className="brave-window__frame">
        <aside className="brave-window__tabs" aria-label="Tabs">
          <div className="brave-window__tab-list" role="tablist" aria-orientation="vertical">
            {sessions.map(({ tab }) => {
              const active = tab.id === activeId
              return (
                <div key={tab.id} className={`brave-tab${active ? ' brave-tab--active' : ''}`} role="presentation">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className="brave-tab__select"
                    onClick={() => selectTab(tab.id)}
                  >
                    <TabFaviconIcon kind={tab.favicon} />
                    <span className="brave-tab__title">{tab.title}</span>
                  </button>
                  {sessions.length > 1 ? (
                    <button
                      type="button"
                      className="brave-tab__close"
                      aria-label={`Close ${tab.title}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        closeTab(tab.id)
                      }}
                    >
                      <CloseIcon />
                    </button>
                  ) : null}
                </div>
              )
            })}
          </div>
          <button type="button" className="brave-window__new-tab" onClick={addTab}>
            <PlusIcon />
            <span>New tab</span>
          </button>
        </aside>

        <div className="brave-window__main">
          <div className="brave-window__toolbar">
            <div className="brave-window__nav">
              <ToolbarBtn label="Back" disabled={!canBack} onClick={goBack}>
                <ChevronLeftIcon />
              </ToolbarBtn>
              <ToolbarBtn label="Forward" disabled={!canForward} onClick={goForward}>
                <ChevronRightIcon />
              </ToolbarBtn>
              <ToolbarBtn label="Reload" onClick={reload}>
                <ReloadIcon />
              </ToolbarBtn>
            </div>
            <div className="brave-window__omnibox">
              {httpsActive ? <LockIcon /> : <ShieldIcon />}
              <input
                type="text"
                className="brave-window__url"
                value={displayUrl}
                aria-label="Address"
                spellCheck={false}
                onFocus={() => {
                  setAddressFocused(true)
                  setAddressDraft(activeUrl)
                }}
                onBlur={() => setAddressFocused(false)}
                onChange={(e) => setAddressDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    commitAddress()
                  }
                }}
              />
            </div>
            <button type="button" className="brave-window__shields" title="Shields up">
              <ShieldBadge />
              <span className="brave-window__shields-label">Shields</span>
            </button>
          </div>

          <div className="brave-window__content" role="tabpanel">
            {page.kind === 'newtab' ? (
              <div className="brave-start">
                <div className="brave-start__hero">
                  <div className="brave-start__logo-wrap">
                    <BraveLogoMark />
                  </div>
                  <h2 className="brave-start__title">Where to next?</h2>
                  <p className="brave-start__subtitle">Pick a shortcut or enter a URL above.</p>
                </div>
                <div className="brave-start__grid">
                  {shortcuts.map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      className="brave-start__card"
                      onClick={() => navigateActive(item.url)}
                    >
                      <TabFaviconIcon kind={item.favicon} />
                      <span className="brave-start__card-text">
                        <span className="brave-start__card-label">{item.label}</span>
                        <span className="brave-start__card-hint">{item.hint}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {page.kind === 'projects' ? (
              <article className="brave-page brave-page--doc">
                <header className="brave-page__header">
                  <TabFaviconIcon kind="folder" />
                  <h1>Projects</h1>
                </header>
                <p>
                  Featured work lives in the desktop <strong>Projects</strong> folder — marketplace builds, portfolio
                  pieces, and experiments. Open Finder from the dock to explore each folder.
                </p>
                <ul>
                  <li>Marketplace — product &amp; platform work</li>
                  <li>Portfolio — selected case studies</li>
                  <li>Experiments — prototypes and play</li>
                </ul>
              </article>
            ) : null}
            {page.kind === 'about' ? (
              <article className="brave-page brave-page--doc">
                <header className="brave-page__header">
                  <TabFaviconIcon kind="home" />
                  <h1>About this site</h1>
                </header>
                <p>
                  You are browsing a macOS-style portfolio desktop built as a single-page app. Dock apps, Finder, widgets,
                  and windows are interactive — including this Brave-style browser with vertical tabs.
                </p>
                <p>
                  Close any window with the traffic lights. Use the music widget on the right to control playback.
                </p>
              </article>
            ) : null}
            {page.kind === 'mailto' ? (
              <MailtoPage href={page.href} />
            ) : null}
            {page.kind === 'external' ? (
              <div className="brave-external-card">
                <TabFaviconIcon kind={faviconForUrl(page.href)} />
                <h2>{page.title}</h2>
                <p className="brave-external-card__url">{page.href}</p>
                <p className="brave-external-card__hint">This site opens in your system browser.</p>
                <a className="brave-btn brave-btn--primary" href={page.href} target="_blank" rel="noopener noreferrer">
                  Continue to {page.title}
                </a>
              </div>
            ) : null}
            {page.kind === 'iframe' ? (
              <BraveExternalFrame
                key={`${activeSession?.frameKey ?? 0}-${page.src}`}
                src={page.src}
                onOpenExternal={() => window.open(page.src, '_blank', 'noopener,noreferrer')}
              />
            ) : null}
          </div>
          <WindowBottomDragHandle dragHandleProps={dragHandleProps} />
        </div>
      </div>
    </div>
  )
}

function MailtoPage({ href }: { href: string }) {
  const email = href.replace(/^mailto:/i, '')
  return (
    <div className="brave-external-card">
      <TabFaviconIcon kind="mail" />
      <h2>Email</h2>
      <p className="brave-external-card__url">{email}</p>
      <a className="brave-btn brave-btn--primary" href={href}>
        Open in Mail
      </a>
    </div>
  )
}

function BraveExternalFrame({ src, onOpenExternal }: { src: string; onOpenExternal: () => void }) {
  const [blocked, setBlocked] = useState(false)

  return (
    <>
      {blocked ? (
        <div className="brave-external-card">
          <TabFaviconIcon kind="globe" />
          <h2>Can&apos;t preview this page</h2>
          <p className="brave-external-card__hint">The site blocked embedding. Open it externally instead.</p>
          <button type="button" className="brave-btn brave-btn--primary" onClick={onOpenExternal}>
            Open in browser
          </button>
        </div>
      ) : (
        <iframe
          className="brave-window__frame-embed"
          src={src}
          title="Web content"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          onError={() => setBlocked(true)}
        />
      )}
    </>
  )
}

function ToolbarBtn({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <button type="button" className="brave-toolbar-btn" disabled={disabled} aria-label={label} onClick={onClick}>
      {children}
    </button>
  )
}

function TabFaviconIcon({ kind }: { kind: TabFavicon }) {
  return (
    <span className={`brave-favicon brave-favicon--${kind}`} aria-hidden>
      {kind === 'brave' ? <BraveLogoMark small /> : null}
      {kind === 'github' ? <GithubIcon /> : null}
      {kind === 'folder' ? <FolderIcon /> : null}
      {kind === 'mail' ? <MailIcon /> : null}
      {kind === 'home' ? <HomeIcon /> : null}
      {kind === 'globe' ? <GlobeIcon /> : null}
    </span>
  )
}

function BraveLogoMark({ small }: { small?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={small ? 14 : 28} height={small ? 14 : 28} aria-hidden>
      <path
        fill="currentColor"
        d="M12 2c1.2 0 2.3.2 3.3.6-.3 1.1-.9 2-1.6 2.8.9-.1 1.8 0 2.6.3-1 .9-2.1 1.8-3.3 2.3.5 1 .8 2.1.8 3.2 0 3.9-3.1 7-7 7s-7-3.1-7-7 3.1-7 7-7c.4 0 .8 0 1.2.1-.5-.9-1.2-1.6-2-2.1C9.4 2.2 10.7 2 12 2z"
      />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg className="brave-window__shield-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <path
        fill="currentColor"
        d="M8 1 3 3v4.5c0 3.1 2.1 5.9 5 6.5 2.9-.6 5-3.4 5-6.5V3L8 1zm0 1.6 2.8 1.2V7.5c0 2.2-1.5 4.2-3.6 4.7-2.1-.5-3.6-2.5-3.6-4.7V3.8L8 2.6z"
      />
    </svg>
  )
}

function ShieldBadge() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden>
      <path fill="#fb542b" d="M10 2 4 4.5v5.2c0 3.5 2.6 6.7 6 7.3 3.4-.6 6-3.8 6-7.3V4.5L10 2z" />
      <path fill="#fff" d="M10 5.5 7.2 6.7V9.8c0 1.8 1.2 3.4 2.8 3.8 1.6-.4 2.8-2 2.8-3.8V6.7L10 5.5z" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 12 12" width="14" height="14" aria-hidden>
      <path d="M7.5 2.5 4 6l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 12 12" width="14" height="14" aria-hidden>
      <path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ReloadIcon() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden>
      <path
        d="M7 2.5a4.5 4.5 0 1 1-3.2 7.6H2.5V8.2h2.1A3 3 0 1 0 7 4v-1.5H9v3H7V2.5z"
        fill="currentColor"
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden>
      <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden>
      <path d="M3 3l6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="brave-window__omnibox-icon" viewBox="0 0 12 14" width="12" height="13" aria-hidden>
      <path
        fill="currentColor"
        d="M3 5V3.5a3 3 0 1 1 6 0V5h.5A1.5 1.5 0 0 1 11 6.5v5A1.5 1.5 0 0 1 9.5 13h-7A1.5 1.5 0 0 1 1 11.5v-5A1.5 1.5 0 0 1 2.5 5H3zm1.5 0h3V3.5a1.5 1.5 0 1 0-3 0V5z"
      />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <path fill="currentColor" d="M2 4.5A1.5 1.5 0 0 1 3.5 3H6l1.2 1.2H12.5A1.5 1.5 0 0 1 14 5.7v6.8A1.5 1.5 0 0 1 12.5 14h-9A1.5 1.5 0 0 1 2 12.5v-8z" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <path
        fill="currentColor"
        d="M8 1.2a6.8 6.8 0 0 0-2.15 13.25c.34.06.47-.15.47-.33v-1.2c-1.92.42-2.32-.82-2.32-.82-.31-.8-.76-1.01-.76-1.01-.62-.43.05-.42.05-.42.69.05 1.05.71 1.05.71.61 1.05 1.6.75 1.99.57.06-.45.24-.75.43-.92-1.53-.17-3.14-.77-3.14-3.43 0-.76.27-1.38.71-1.87-.07-.17-.31-.87.07-1.81 0 0 .58-.19 1.9.71a6.5 6.5 0 0 1 3.5 0c1.32-.9 1.9-.71 1.9-.71.38.94.14 1.64.07 1.81.44.49.71 1.1.71 1.87 0 2.67-1.62 3.26-3.16 3.42.25.22.47.64.47 1.29v1.92c0 .18.13.39.48.33A6.8 6.8 0 0 0 8 1.2z"
      />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <path
        fill="currentColor"
        d="M2 4.5A1.5 1.5 0 0 1 3.5 3h9A1.5 1.5 0 0 1 14 4.5v7A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5v-7zm1.1-.5 4.4 3.3 4.4-3.3H3.1z"
      />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <path fill="currentColor" d="M8 2.2 2.5 7v6.5A1.5 1.5 0 0 1 4 15h8a1.5 1.5 0 0 1 1.5-1.5V7L8 2.2z" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <path
        fill="currentColor"
        d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm5.2 4h-2.4a11.5 11.5 0 0 0-.9-2.8A5.5 5.5 0 0 1 13.2 5.5zM8 11c-.9-1.1-1.5-2.4-1.8-3.8h3.6c-.3 1.4-.9 2.7-1.8 3.8zM4.6 7.2c0-.7.1-1.4.3-2h2.2c-.1.6-.1 1.3-.1 2s0 1.4.1 2H4.9c-.2-.6-.3-1.3-.3-2zm.1 1.8h2.2c.3 1.4.9 2.7 1.8 3.8-1.5-.5-2.8-1.5-3.6-2.9a8 8 0 0 1-.4-1zm3.5 4.4c.6-.9 1.1-1.9 1.4-3h2.4a5.5 5.5 0 0 1-3.8 3zm4.2-4.4h2.4a5.5 5.5 0 0 1-2.1 3.6 11.4 11.4 0 0 0-.9-2.8h-2.4c.1-.7.1-1.3.1-2s0-1.3-.1-2h2.4c.2-.9.5-1.8.9-2.8A5.5 5.5 0 0 1 12.4 11.4zM9.1 3.4c-.6.9-1.1 1.9-1.4 3H5.3a5.5 5.5 0 0 1 3.8-3zM6.1 2.7c-.4 1-.7 1.9-.9 2.8H2.8a5.5 5.5 0 0 1 3.3-2.8z"
      />
    </svg>
  )
}
