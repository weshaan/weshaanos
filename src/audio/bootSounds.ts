const BOOT_SOUND_URLS = {
  bootComplete: '/sounds/boot/boot-complete.mp3',
  helloReveal: '/sounds/boot/hello-reveal.mp3',
} as const

/** Perceived loudness — samples are loudnorm’d; keep under 1 to avoid clipping. */
const GAIN = {
  bootComplete: 0.88,
  helloReveal: 0.88,
} as const

let sharedCtx: AudioContext | null = null
const bufferCache = new Map<string, AudioBuffer>()
let preloadStarted = false

function bootAudioEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function ensureBootAudioContext(): AudioContext | null {
  if (!bootAudioEnabled()) return null
  if (!sharedCtx) sharedCtx = new AudioContext()
  if (sharedCtx.state === 'suspended') void sharedCtx.resume()
  void preloadBootSounds()
  return sharedCtx
}

async function loadBuffer(ctx: AudioContext, url: string): Promise<AudioBuffer> {
  const cached = bufferCache.get(url)
  if (cached) return cached
  const res = await fetch(url)
  if (!res.ok) throw new Error(`boot sound missing: ${url}`)
  const data = await res.arrayBuffer()
  const buffer = await ctx.decodeAudioData(data)
  bufferCache.set(url, buffer)
  return buffer
}

export async function preloadBootSounds(): Promise<void> {
  if (!bootAudioEnabled() || preloadStarted) return
  preloadStarted = true
  const ctx = ensureBootAudioContext()
  if (!ctx) return
  await Promise.all(Object.values(BOOT_SOUND_URLS).map((url) => loadBuffer(ctx, url).catch(() => undefined)))
}

function playSample(url: string, gain: number) {
  const ctx = ensureBootAudioContext()
  if (!ctx) return
  void loadBuffer(ctx, url)
    .then((buffer) => {
      const src = ctx.createBufferSource()
      src.buffer = buffer
      const g = ctx.createGain()
      g.gain.value = gain
      src.connect(g)
      g.connect(ctx.destination)
      src.start()
    })
    .catch(() => {
      /* ignore — boot still works without audio */
    })
}

/** Progress bar reaches the end */
export function playBootCompleteSound() {
  playSample(BOOT_SOUND_URLS.bootComplete, GAIN.bootComplete)
}

/** Hello logo animation begins */
export function playHelloRevealSound() {
  playSample(BOOT_SOUND_URLS.helloReveal, GAIN.helloReveal)
}
