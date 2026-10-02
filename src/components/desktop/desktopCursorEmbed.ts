export const DESKTOP_CURSOR_EMBED_EVENT = 'desktop-cursor-embed'

export type DesktopCursorEmbedDetail = {
  active: boolean
  clientX?: number
  clientY?: number
}

export function dispatchDesktopCursorEmbed(detail: DesktopCursorEmbedDetail) {
  window.dispatchEvent(new CustomEvent(DESKTOP_CURSOR_EMBED_EVENT, { detail }))
}

export function isPointerOverBrowserEmbed(clientX: number, clientY: number): boolean {
  const hosts = document.querySelectorAll('.browser-frame-host')
  for (const host of hosts) {
    const r = host.getBoundingClientRect()
    if (
      clientX >= r.left &&
      clientX <= r.right &&
      clientY >= r.top &&
      clientY <= r.bottom
    ) {
      return true
    }
  }
  return false
}
