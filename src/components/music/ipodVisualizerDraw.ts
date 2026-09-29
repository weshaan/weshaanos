import type { VisualizerKind, VisualizerPalette } from './ipodVisualizerCore'
import {
  levelFromFrequency,
  simulatedBandLevels,
  vuBarBandPermutation,
} from './ipodVisualizerCore'

type DrawInput = {
  ctx: CanvasRenderingContext2D
  w: number
  h: number
  t: number
  playing: boolean
  seed: number
  palette: VisualizerPalette
  frequency?: Uint8Array
  waveform?: Uint8Array
}

export function drawIpodVisualizer(kind: VisualizerKind, input: DrawInput) {
  switch (kind) {
    case 'vu-bars':
      drawVuBars(input)
      break
    case 'oscilloscope':
      drawOscilloscope(input)
      break
    case 'block-grid':
      drawBlockGrid(input)
      break
    case 'radial-burst':
      drawRadialBurst(input)
      break
    case 'peak-mirror':
      drawPeakMirror(input)
      break
    case 'lissajous':
      drawLissajous(input)
      break
  }
}

function clearFrame({ ctx, w, h, palette }: DrawInput) {
  ctx.fillStyle = palette.bg
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = palette.dim
  ctx.fillRect(0, h - 1, w, 1)
}

function drawVuBars(input: DrawInput) {
  const { ctx, w, h, t, playing, seed, palette, frequency } = input
  clearFrame(input)
  const bars = 13
  const gap = 2
  const barW = (w - gap * (bars + 1)) / bars
  const sim = simulatedBandLevels(seed, bars, t, playing)
  const bandOrder = vuBarBandPermutation(seed, bars)

  for (let i = 0; i < bars; i++) {
    const band = bandOrder[i]
    const level = levelFromFrequency(frequency, band, bars, sim[band])
    const bh = Math.max(2, level * (h - 8))
    const x = gap + i * (barW + gap)
    const y = h - 4 - bh
    const grad = ctx.createLinearGradient(x, y, x, h - 4)
    grad.addColorStop(0, palette.accent)
    grad.addColorStop(1, palette.fg)
    ctx.fillStyle = grad
    ctx.fillRect(x, y, barW, bh)
    if (level > 0.82) {
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.fillRect(x, y, barW, 2)
    }
  }
}

function drawOscilloscope(input: DrawInput) {
  const { ctx, w, h, t, playing, seed, palette, waveform } = input
  clearFrame(input)
  const mid = h / 2
  ctx.strokeStyle = palette.fg
  ctx.lineWidth = 1.5
  ctx.shadowColor = palette.fg
  ctx.shadowBlur = 4
  ctx.beginPath()

  const points = w
  for (let x = 0; x < points; x++) {
    let y: number
    if (waveform && waveform.length > 0) {
      const idx = Math.floor((x / points) * waveform.length)
      y = mid + ((waveform[idx] - 128) / 128) * (h * 0.38)
    } else {
      const phase = t * (3 + (seed % 7) * 0.2) + x * 0.12
      y = mid + Math.sin(phase) * (playing ? h * 0.32 : h * 0.08)
      y += Math.sin(phase * 2.3 + seed) * (playing ? h * 0.08 : 0)
    }
    if (x === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.shadowBlur = 0

  ctx.strokeStyle = palette.dim
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, mid)
  ctx.lineTo(w, mid)
  ctx.stroke()
}

function drawBlockGrid(input: DrawInput) {
  const { ctx, w, h, t, playing, seed, palette, frequency } = input
  clearFrame(input)
  const cols = 10
  const rows = 7
  const pad = 3
  const cellW = (w - pad * 2) / cols
  const cellH = (h - pad * 2) / rows
  const sim = simulatedBandLevels(seed, cols * rows, t, playing)

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col
      const level = levelFromFrequency(frequency, i, cols * rows, sim[i])
      const litRows = Math.round(level * rows)
      if (row >= rows - litRows) {
        const x = pad + col * cellW
        const y = pad + row * cellH
        ctx.fillStyle = row === 0 && litRows === rows ? palette.accent : palette.fg
        ctx.globalAlpha = 0.35 + level * 0.65
        ctx.fillRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1)
      }
    }
  }
  ctx.globalAlpha = 1
}

function drawRadialBurst(input: DrawInput) {
  const { ctx, w, h, t, playing, seed, palette, frequency } = input
  clearFrame(input)
  const cx = w / 2
  const cy = h / 2
  const spokes = 24
  const sim = simulatedBandLevels(seed, spokes, t, playing)
  const inner = Math.min(w, h) * 0.14
  const outerMax = Math.min(w, h) * 0.46

  for (let i = 0; i < spokes; i++) {
    const angle = (i / spokes) * Math.PI * 2 - Math.PI / 2 + t * (playing ? 0.15 : 0.02)
    const level = levelFromFrequency(frequency, i, spokes, sim[i])
    const outer = inner + level * (outerMax - inner)
    ctx.strokeStyle = level > 0.7 ? palette.accent : palette.fg
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner)
    ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer)
    ctx.stroke()
  }

  ctx.fillStyle = palette.fg
  ctx.beginPath()
  ctx.arc(cx, cy, inner * 0.55, 0, Math.PI * 2)
  ctx.fill()
}

function drawPeakMirror(input: DrawInput) {
  const { ctx, w, h, t, playing, seed, palette, frequency } = input
  clearFrame(input)
  const bands = 32
  const sim = simulatedBandLevels(seed, bands, t, playing)
  const mid = h / 2

  const buildPath = (flip: boolean) => {
    ctx.beginPath()
    ctx.moveTo(0, mid)
    for (let i = 0; i <= bands; i++) {
      const level = levelFromFrequency(frequency, i, bands, sim[i] ?? 0)
      const x = (i / bands) * w
      const y = mid + (flip ? 1 : -1) * level * (h * 0.42)
      ctx.lineTo(x, y)
    }
    ctx.lineTo(w, mid)
    ctx.closePath()
  }

  buildPath(false)
  ctx.fillStyle = palette.dim
  ctx.fill()
  buildPath(true)
  ctx.fillStyle = palette.dim
  ctx.fill()

  ctx.strokeStyle = palette.fg
  ctx.lineWidth = 1.25
  ctx.beginPath()
  for (let i = 0; i <= bands; i++) {
    const level = levelFromFrequency(frequency, i, bands, sim[i] ?? 0)
    const x = (i / bands) * w
    const y = mid - level * (h * 0.42)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  ctx.strokeStyle = palette.accent
  ctx.globalAlpha = 0.85
  ctx.beginPath()
  for (let i = 0; i <= bands; i++) {
    const level = levelFromFrequency(frequency, i, bands, sim[i] ?? 0)
    const x = (i / bands) * w
    const y = mid + level * (h * 0.42)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.globalAlpha = 1
}

function drawLissajous(input: DrawInput) {
  const { ctx, w, h, t, playing, seed, palette, frequency } = input
  clearFrame(input)
  const cx = w / 2
  const cy = h / 2
  const a = 2 + (seed % 5)
  const b = 3 + ((seed >> 3) % 5)
  const delta = (seed % 100) * 0.01
  const ampBase = playing ? 0.38 : 0.12
  let avg = 0.5
  if (frequency && frequency.length > 0) {
    let sum = 0
    for (let i = 0; i < frequency.length; i++) sum += frequency[i]
    avg = sum / frequency.length / 255
  }
  const amp = ampBase + avg * 0.22
  const radius = Math.min(w, h) * amp

  ctx.strokeStyle = palette.dim
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(cx, cy, radius * 1.05, 0, Math.PI * 2)
  ctx.stroke()

  const steps = 120
  ctx.strokeStyle = palette.fg
  ctx.lineWidth = 1.5
  ctx.shadowColor = palette.accent
  ctx.shadowBlur = 6
  ctx.beginPath()
  for (let i = 0; i <= steps; i++) {
    const u = (i / steps) * Math.PI * 2
    const phase = t * (playing ? 1.8 : 0.35)
    const x = cx + Math.sin(a * u + phase + delta) * radius
    const y = cy + Math.sin(b * u + phase * 1.1) * radius
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.shadowBlur = 0

  const dotT = t * (playing ? 2.5 : 0.5)
  const dx = cx + Math.sin(a * dotT + delta) * radius
  const dy = cy + Math.sin(b * dotT) * radius
  ctx.fillStyle = palette.accent
  ctx.beginPath()
  ctx.arc(dx, dy, 2.5, 0, Math.PI * 2)
  ctx.fill()
}
