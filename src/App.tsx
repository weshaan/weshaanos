import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { DesktopIcons, type DesktopItemId } from './components/DesktopIcons'
import { Dock } from './components/Dock'
import { HelloIntro } from './components/HelloIntro'
import { LockScreen } from './components/LockScreen'
import { triggerMusicAutoplay } from './music/autoplay'
import { FinderWindow } from './components/FinderWindow'
import { type FinderLocationId, isFinderDesktopFolderId } from './components/finder/finderLocations'
import { MacWindow } from './components/MacWindow'
import { MenuBar } from './components/MenuBar'
import { CalculatorWindow } from './components/calculator/CalculatorWindow'
import { CalendarWindow } from './components/calendar/CalendarWindow'
import { WeatherWindow } from './components/weather/WeatherWindow'
import { Widgets } from './components/Widgets'
import { SystemSettingsPanel } from './components/settings/SystemSettingsPanel'
import { useWindowTheme } from './context/WindowThemeContext'
import { useDesktopWindowStack } from './hooks/useDesktopWindowStack'
import './App.css'

const ResumePdfWindow = lazy(() =>
  import('./components/ResumePdfWindow').then((m) => ({ default: m.ResumePdfWindow })),
)

type WindowId = DesktopItemId | 'mail' | 'terminal' | 'profile' | 'settings' | 'finder' | 'weather' | 'calculator' | 'calendar'

type MacWindowId = Exclude<WindowId, 'resume' | 'finder' | 'weather' | 'calculator' | 'calendar'>

const windowCopy: Record<MacWindowId, { title: string; body: ReactNode | null }> = {
  projects: {
    title: 'Projects',
    body: (
      <>
        <h2>Projects</h2>
        <p>Featured work and case studies live in this folder. Adding screenshots, tech stack, and links to repos or demos.</p>
      </>
    ),
  },
  images: {
    title: 'Images',
    body: (
      <>
        <h2>Gallery</h2>
        <p>Photography, design work, or project visuals — grid or carousel can go here.</p>
      </>
    ),
  },
  misc: {
    title: 'Misc',
    body: (
      <>
        <h2>Misc</h2>
        <p>Odds and ends — experiments, notes, and anything that does not fit elsewhere.</p>
      </>
    ),
  },
  localhost: {
    title: 'Localhost',
    body: (
      <>
        <h2>Dev server</h2>
        <p>Local experiments, APIs, and side projects. Point dock Terminal here for a CLI aesthetic.</p>
      </>
    ),
  },
  mail: {
    title: 'Mail',
    body: (
      <>
        <h2>Contact</h2>
        <p>
          Like what you see? Let me know at{' '}
          <a href="mailto:weshaan108@gmail.com">weshaan108@gmail.com</a>{' '}
          :)
        </p>
      </>
    ),
  },
  terminal: {
    title: 'Terminal',
    body: (
      <pre className="terminal-preview">
        {`$ whoami
weshaan
$ ls projects/
marketplace/  portfolio/  experiments/
$ echo "Let's build something."
Let's build something.`}
      </pre>
    ),
  },
  profile: {
    title: 'About',
    body: (
      <>
        <h2>Hello</h2>
        <p>
          I'm the developer. This desktop is my personal portfolio. It captures a snapshot of some of my work and holds
          fragments of some hobbies.
          <br />
          <br />
          You can close this window by clicking on the red-yellow-green circles above. To stop/change music use the
          widget on the right. Explore folders and dock apps to learn more ;)
          <br />
          <br />
          P.S. if you're just here for a quick look of my work, please use the quick actions widget on the right for a
          speedy peek!
        </p>
      </>
    ),
  },
  settings: {
    title: 'System Settings',
    body: null,
  },
}

function App() {
  const { theme } = useWindowTheme()
  const {
    openIds,
    openWindow,
    closeWindow,
    focusWindow,
    positions,
    setWindowPosition,
    zById,
  } = useDesktopWindowStack()

  const [introDone, setIntroDone] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [lockExiting, setLockExiting] = useState(false)
  const [finderPendingLocation, setFinderPendingLocation] = useState<FinderLocationId | null>(null)
  const aboutWelcomeOpened = useRef(false)

  useEffect(() => {
    if (!unlocked) return
    if (aboutWelcomeOpened.current) return

    const id = window.setTimeout(() => {
      if (aboutWelcomeOpened.current) return
      aboutWelcomeOpened.current = true
      openWindow('profile')
    }, 1000)

    return () => window.clearTimeout(id)
  }, [unlocked, openWindow])

  const open = useCallback(
    (id: WindowId | null) => {
      if (id) openWindow(id)
    },
    [openWindow],
  )

  const openFinderAt = useCallback(
    (location: FinderLocationId) => {
      setFinderPendingLocation(location)
      if (!openIds.includes('finder')) openWindow('finder')
      else focusWindow('finder')
    },
    [focusWindow, openIds, openWindow],
  )

  const openDesktopItem = useCallback(
    (id: DesktopItemId) => {
      if (id === 'resume') {
        openWindow('resume')
        return
      }
      if (isFinderDesktopFolderId(id)) openFinderAt(id)
    },
    [openFinderAt, openWindow],
  )

  const handleUnlock = useCallback(() => {
    if (lockExiting || unlocked) return
    triggerMusicAutoplay()
    setLockExiting(true)
    window.setTimeout(() => {
      setUnlocked(true)
      setLockExiting(false)
    }, 1000)
  }, [lockExiting, unlocked])

  const handleDock = (id: string) => {
    switch (id) {
      case 'mail':
        open('mail')
        break
      case 'terminal':
        open('terminal')
        break
      case 'vscode':
        openFinderAt('localhost')
        break
      case 'finder':
        open('finder')
        break
      case 'notes':
        openFinderAt('projects')
        break
      case 'settings':
        open('settings')
        break
      case 'calendar':
        open('calendar')
        break
      case 'weather':
        open('weather')
        break
      case 'calculator':
        open('calculator')
        break
      case 'brave':
        open('profile')
        break
      default:
        break
    }
  }

  const desktopState = unlocked || lockExiting ? 'desktop--awake' : 'desktop--locked'

  const windowLayer = openIds.map((id) => {
    const position = positions[id] ?? { x: 80, y: 72 }
    const zIndex = zById[id] ?? 60

    if (id === 'finder') {
      return (
        <FinderWindow
          key={id}
          windowId={id}
          zIndex={zIndex}
          position={position}
          onPositionChange={(p) => setWindowPosition(id, p)}
          onFocus={() => focusWindow(id)}
          onClose={() => closeWindow(id)}
          onOpenItem={(itemId) => {
            if (itemId === 'pdfviewer') openWindow('resume')
            else openWindow(itemId)
          }}
          pendingLocation={finderPendingLocation}
          onPendingLocationHandled={() => setFinderPendingLocation(null)}
        />
      )
    }

    if (id === 'weather') {
      return (
        <WeatherWindow
          key={id}
          windowId={id}
          zIndex={zIndex}
          position={position}
          onPositionChange={(p) => setWindowPosition(id, p)}
          onFocus={() => focusWindow(id)}
          onClose={() => closeWindow(id)}
        />
      )
    }

    if (id === 'calculator') {
      return (
        <CalculatorWindow
          key={id}
          windowId={id}
          zIndex={zIndex}
          position={position}
          onPositionChange={(p) => setWindowPosition(id, p)}
          onFocus={() => focusWindow(id)}
          onClose={() => closeWindow(id)}
        />
      )
    }

    if (id === 'calendar') {
      return (
        <CalendarWindow
          key={id}
          windowId={id}
          zIndex={zIndex}
          position={position}
          onPositionChange={(p) => setWindowPosition(id, p)}
          onFocus={() => focusWindow(id)}
          onClose={() => closeWindow(id)}
        />
      )
    }

    if (id === 'resume') {
      return (
        <Suspense key={id} fallback={null}>
          <ResumePdfWindow
            windowId={id}
            zIndex={zIndex}
            position={position}
            onPositionChange={(p) => setWindowPosition(id, p)}
            onFocus={() => focusWindow(id)}
            onClose={() => closeWindow(id)}
          />
        </Suspense>
      )
    }

    const copy = windowCopy[id as MacWindowId]
    if (!copy) return null

    return (
      <MacWindow
        key={id}
        windowId={id}
        title={copy.title}
        zIndex={zIndex}
        position={position}
        onPositionChange={(p) => setWindowPosition(id, p)}
        onFocus={() => focusWindow(id)}
        onClose={() => closeWindow(id)}
      >
        {id === 'settings' ? <SystemSettingsPanel /> : copy.body}
      </MacWindow>
    )
  })

  return (
    <div className={`desktop ${desktopState}`} data-window-theme={theme}>
      {!unlocked && (
        <LockScreen onUnlock={handleUnlock} exiting={lockExiting} unlockEnabled={introDone} />
      )}
      {!introDone && <HelloIntro onComplete={() => setIntroDone(true)} />}
      <div className="desktop__session">
        <div className="desktop__wallpaper" role="presentation" />
        <MenuBar
          onAppleMenuClick={unlocked ? () => open('profile') : undefined}
          weatherEnabled={unlocked}
        />
        <div className="desktop__chrome">
          <DesktopIcons onOpen={openDesktopItem} />
          <Widgets
            weatherEnabled={unlocked}
            onOpenWeather={() => open('weather')}
            onOpenCalendar={() => open('calendar')}
            onReminder={(action) => {
              if (action === 'resume') open('resume')
              else if (action === 'profile') open('profile')
              else if (action === 'projects') openFinderAt('projects')
              else open('mail')
            }}
          />
        </div>
        <Dock onAppClick={handleDock} />
        {windowLayer.length > 0 && <div className="desktop-windows">{windowLayer}</div>}
      </div>
    </div>
  )
}

export default App
