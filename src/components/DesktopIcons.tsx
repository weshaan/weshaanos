import { FolderIcon } from './icons/FolderIcon'
import './DesktopIcons.css'

export type DesktopItemId = 'resume' | 'projects' | 'images' | 'misc' | 'localhost'

type DesktopItem = {
  id: DesktopItemId
  label: string
}

const ICON = 44

const items: DesktopItem[] = [
  { id: 'resume', label: 'Resume' },
  { id: 'projects', label: 'Projects' },
  { id: 'images', label: 'Images' },
  { id: 'misc', label: 'Misc' },
  { id: 'localhost', label: 'Localhost' },
]

type Props = {
  onOpen: (id: DesktopItemId) => void
}

export function DesktopIcons({ onOpen }: Props) {
  return (
    <div className="desktop-icons">
      <ul className="desktop-icons__list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={
                item.id === 'resume' ? 'desktop-icons__item desktop-icons__item--document' : 'desktop-icons__item'
              }
              onClick={() => onOpen(item.id)}
            >
              <span
                className={
                  item.id === 'resume'
                    ? 'desktop-icons__icon-wrap desktop-icons__icon-wrap--document'
                    : 'desktop-icons__icon-wrap'
                }
              >
                {item.id === 'resume' ? (
                  <img
                    src="/desktop/resume-pdf.png"
                    alt=""
                    className="desktop-icons__file-icon desktop-icons__file-icon--resume"
                    draggable={false}
                  />
                ) : (
                  <FolderIcon size={ICON} />
                )}
              </span>
              <span className="desktop-icons__label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
