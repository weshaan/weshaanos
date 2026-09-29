export type VisualizerKind =
  | 'vu-bars'
  | 'oscilloscope'
  | 'block-grid'
  | 'radial-burst'
  | 'peak-mirror'
  | 'lissajous'

export type VisualizerPalette = {
  bg: string
  fg: string
  dim: string
  accent: string
}

const TRACK_KIND: Record<string, VisualizerKind> = {
  'youth-tell-me-why': 'vu-bars',
  'johnny-joined': 'oscilloscope',
  'waera-harinezumi': 'radial-burst',
}

const KINDS: VisualizerKind[] = [
  'vu-bars',
  'oscilloscope',
  'block-grid',
  'radial-burst',
  'peak-mirror',
  'lissajous',
]

const PALETTES: VisualizerPalette[] = [
  { bg: '#050806', fg: '#3dff7a', dim: '#0f2a18', accent: '#9affc4' },
  { bg: '#120a02', fg: '#ffb020', dim: '#3a2208', accent: '#ffd080' },
  { bg: '#030810', fg: '#40d4ff', dim: '#0a2438', accent: '#a8ecff' },
  { bg: '#0c0408', fg: '#ff5ca8', dim: '#2a1020', accent: '#ffb3d9' },
  { bg: '#080808', fg: '#e8e8e8', dim: '#222', accent: '#ffffff' },
  { bg: '#0a0804', fg: '#c8ff40', dim: '#283008', accent: '#efffa0' },
]

export function hashTrackId(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function visualizerKindForTrack(trackId: string): VisualizerKind {
  return TRACK_KIND[trackId] ?? KINDS[hashTrackId(trackId) % KINDS.length]
}

export function paletteForTrack(trackId: string): VisualizerPalette {
  return PALETTES[hashTrackId(trackId) % PALETTES.length]
}

export function seededNoise(seed: number, i: number, t: number): number {
  const x = Math.sin(seed * 0.017 + i * 1.37 + t * 2.1) * 0.5 + 0.5
  const y = Math.sin(seed * 0.031 + i * 0.91 + t * 3.7) * 0.5 + 0.5
  return (x + y) * 0.5
}

export function simulatedBandLevels(
  seed: number,
  count: number,
  t: number,
  playing: boolean,
): number[] {
  const amp = playing ? 1 : 0.22
  const levels: number[] = []
  for (let i = 0; i < count; i++) {
    const base = seededNoise(seed, i, t)
    const beat = Math.sin(t * (2.4 + (i % 5) * 0.3) + seed * 0.001) * 0.5 + 0.5
    levels.push(Math.min(1, (base * 0.65 + beat * 0.35) * amp))
  }
  return levels
}

export function levelFromFrequency(
  frequency: Uint8Array | undefined,
  index: number,
  count: number,
  fallback: number,
): number {
  if (!frequency || frequency.length === 0) return fallback
  const start = Math.floor((index / count) * frequency.length)
  const end = Math.floor(((index + 1) / count) * frequency.length)
  let sum = 0
  let n = 0
  for (let i = start; i < end && i < frequency.length; i++) {
    sum += frequency[i]
    n++
  }
  if (n === 0) return fallback
  return sum / n / 255
}
