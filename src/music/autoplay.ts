type AutoplayHandler = () => void

let handler: AutoplayHandler | null = null
let pendingAutoplay = false

export function setMusicAutoplayHandler(fn: AutoplayHandler | null) {
  handler = fn
  if (fn && pendingAutoplay) {
    pendingAutoplay = false
    fn()
  }
}

/** Call from a user-gesture handler (e.g. lock screen unlock). */
export function triggerMusicAutoplay() {
  if (handler) handler()
  else pendingAutoplay = true
}
