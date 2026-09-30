import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { WindowBottomDragHandle } from '../desktop/WindowBottomDragHandle'
import { useDraggableWindow, type WindowPoint } from '../../hooks/useDraggableWindow'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  LockIcon,
  PlusIcon,
  ReloadIcon,
  SearchIcon,
  TabFaviconIcon,
} from './braveIcons'
import { createNewTabPageContent, type NewTabPageContent } from './braveNewTabContent'
import { BraveNewTabPage } from './BraveNewTabPage'
import {
  BRAVE_HOME_URL,
  createTabId,
  defaultBraveTabs,
  faviconForUrl,
  resolveBravePage,
  tabFaviconFor,
  tabTitleFor,
  tabUrlsMatch,
  type BraveTab,
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
  /** Greeting + tip for this tab’s start page; one set per tab. */
  newTabPage?: NewTabPageContent
}

function createTabState(tab: BraveTab): TabState {
  const session: TabState = { tab, history: [tab.url], historyIndex: 0, frameKey: 0 }
  if (tab.url === BRAVE_HOME_URL) {
    session.newTabPage = createNewTabPageContent()
  }
  return session
}

function resetHomeSession(session: TabState): TabState {
  if (!session.tab.isHome) return session
  return refreshStartPageSession(session)
}

/** New greeting/tip + single-entry history — Home tab or any tab on the start page. */
function refreshStartPageSession(session: TabState): TabState {
  const isHome = session.tab.isHome
  return {
    ...session,
    history: [BRAVE_HOME_URL],
    historyIndex: 0,
    frameKey: session.frameKey + 1,
    newTabPage: createNewTabPageContent(),
    tab: {
      ...session.tab,
      url: BRAVE_HOME_URL,
      title: isHome ? 'Home' : 'New Tab',
      favicon: isHome ? 'home' : 'brave',
    },
  }
}

function withNewTabPage(session: TabState, url: string): TabState {
  if (url !== BRAVE_HOME_URL) return session
  return { ...session, newTabPage: createNewTabPageContent() }
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
        if (s.tab.isHome) return s
        const title = tabTitleFor(url, s.tab.isHome)
        const favicon = tabFaviconFor(url, s.tab.isHome)
        const nextTab = { ...s.tab, url, title, favicon }
        if (!push) {
          return withNewTabPage({ ...s, tab: nextTab, frameKey: s.frameKey + 1 }, url)
        }
        const trimmed = s.history.slice(0, s.historyIndex + 1)
        trimmed.push(url)
        return withNewTabPage(
          {
            ...s,
            tab: nextTab,
            history: trimmed,
            historyIndex: trimmed.length - 1,
            frameKey: s.frameKey + 1,
          },
          url,
        )
      }),
    )
    setAddressDraft(url)
  }, [activeId])

  const openInNewTab = useCallback((url: string) => {
    const tab: BraveTab = {
      id: createTabId(),
      title: tabTitleFor(url, false),
      url,
      favicon: tabFaviconFor(url, false),
    }
    const session = createTabState(tab)
    setSessions((prev) => [...prev, session])
    setActiveId(tab.id)
    setAddressDraft(url)
  }, [])

  const focusTabById = useCallback(
    (id: string) => {
      const session = sessions.find((s) => s.tab.id === id)
      if (!session) return
      setActiveId(id)
      setAddressDraft(session.history[session.historyIndex])
    },
    [sessions],
  )

  const openUrl = useCallback(
    (url: string) => {
      const target = url.trim()
      if (!target || target === BRAVE_HOME_URL || target === 'about:blank') {
        const active = sessions.find((s) => s.tab.id === activeId)
        if (active?.tab.isHome) return
        navigateActive(BRAVE_HOME_URL)
        return
      }

      const existing = sessions.find(
        (s) => !s.tab.isHome && tabUrlsMatch(s.history[s.historyIndex], target),
      )
      if (existing) {
        focusTabById(existing.tab.id)
        return
      }

      const active = sessions.find((s) => s.tab.id === activeId) ?? sessions[0]
      if (!active) return

      if (active.tab.isHome) {
        openInNewTab(target)
        return
      }

      navigateActive(target)
    },
    [activeId, focusTabById, navigateActive, openInNewTab, sessions],
  )

  const selectTab = (id: string) => {
    const session = sessions.find((s) => s.tab.id === id)
    if (session?.tab.isHome) {
      setSessions((prev) => prev.map((s) => (s.tab.isHome ? resetHomeSession(s) : s)))
      setActiveId(id)
      setAddressDraft(BRAVE_HOME_URL)
      return
    }
    setActiveId(id)
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
    const closing = sessions.find((s) => s.tab.id === id)
    if (!closing || closing.tab.isHome) return
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
          tab: {
            ...s.tab,
            url,
            title: tabTitleFor(url, s.tab.isHome),
            favicon: tabFaviconFor(url, s.tab.isHome),
          },
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
          tab: {
            ...s.tab,
            url,
            title: tabTitleFor(url, s.tab.isHome),
            favicon: tabFaviconFor(url, s.tab.isHome),
          },
          frameKey: s.frameKey + 1,
        }
      }),
    )
  }

  const reload = () => {
    let refreshedStartPage = false
    setSessions((prev) =>
      prev.map((s) => {
        if (s.tab.id !== activeId) return s
        const onStartPage = s.history[s.historyIndex] === BRAVE_HOME_URL
        if (onStartPage) {
          refreshedStartPage = true
          return refreshStartPageSession(s)
        }
        return { ...s, frameKey: s.frameKey + 1 }
      }),
    )
    if (refreshedStartPage) setAddressDraft(BRAVE_HOME_URL)
  }

  const commitAddress = () => {
    let url = addressDraft.trim()
    if (!url) url = 'brave://newtab'
    else if (!/^https?:\/\//i.test(url) && !url.includes('://')) {
      url = `https://${url}`
    }
    openUrl(url)
    setAddressFocused(false)
  }

  const httpsActive = /^https:\/\//i.test(activeUrl)
  const isNewTab = page.kind === 'newtab'

  return (
    <div
      className={`brave-window${isNewTab ? ' brave-window--newtab' : ''}`}
      style={{ left: position.x, top: position.y, zIndex }}
      role="dialog"
      aria-label="Browser"
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
      </header>

      <div className="brave-window__frame">
        <aside className="brave-window__tabs" aria-label="Tabs">
          <div className="brave-window__tab-list" role="tablist" aria-orientation="vertical">
            {sessions.map(({ tab }) => {
              const active = tab.id === activeId
              return (
                <div
                  key={tab.id}
                  className={`brave-tab${active ? ' brave-tab--active' : ''}${tab.isHome ? ' brave-tab--home' : ''}`}
                  role="presentation"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className="brave-tab__select"
                    onClick={() => selectTab(tab.id)}
                  >
                    <TabFaviconIcon kind={tab.favicon} />
                    <span className="brave-tab__title" title={tab.title}>{tab.title}</span>
                  </button>
                  {!tab.isHome ? (
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
          <div className={`brave-window__toolbar${isNewTab ? ' brave-window__toolbar--quiet' : ''}`}>
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
              {httpsActive ? (
                <LockIcon size={15} className="brave-window__omnibox-icon brave-window__omnibox-icon--secure" />
              ) : (
                <SearchIcon size={15} className="brave-window__omnibox-icon" />
              )}
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
          </div>

          <div className="brave-window__content" role="tabpanel">
            {page.kind === 'newtab' && activeSession?.newTabPage ? (
              <BraveNewTabPage
                key={activeSession.tab.id}
                greeting={activeSession.newTabPage.greeting}
                desktopTip={activeSession.newTabPage.tip}
                onNavigate={openUrl}
              />
            ) : null}
            {page.kind === 'about' ? (
              <article className="brave-page brave-page--doc">
                <header className="brave-page__header">
                  <TabFaviconIcon kind="home" />
                  <h1>About this site</h1>
                </header>
                <p>
                  You are browsing a macOS-style portfolio desktop built as a single-page app. Dock apps, Finder, widgets,
                  and windows are interactive — including this Zen-inspired browser with a calm sidebar and vertical tabs.
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

