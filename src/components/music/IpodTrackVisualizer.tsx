import { useEffect, useRef, type RefObject } from 'react'
import { sampleAudioLevels } from '../../music/audioAnalyser'
import { drawIpodVisualizer } from './ipodVisualizerDraw'
import {
  hashTrackId,
  paletteForTrack,
  visualizerKindForTrack,
} from './ipodVisualizerCore'

type Props = {
  trackId: string | undefined
  playing: boolean
  audioRef: RefObject<HTMLAudioElement | null>
}

const SIZE = 72

export function IpodTrackVisualizer({ trackId, playing, audioRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trackIdRef = useRef(trackId)
  trackIdRef.current = trackId

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = SIZE * dpr
    canvas.height = SIZE * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    let raf = 0
    let lastDraw = 0

    const paint = (now: number) => {
      if (!playing && now - lastDraw < 140) {
        raf = requestAnimationFrame(paint)
        return
      }
      lastDraw = now

      const id = trackIdRef.current
      if (!id) {
        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(0, 0, SIZE, SIZE)
        raf = requestAnimationFrame(paint)
        return
      }

      const levels = sampleAudioLevels(audioRef.current)
      const t = now / 1000
      const kind = visualizerKindForTrack(id)
      const palette = paletteForTrack(id)
      const seed = hashTrackId(id)

      drawIpodVisualizer(kind, {
        ctx,
        w: SIZE,
        h: SIZE,
        t,
        playing,
        seed,
        palette,
        frequency: levels?.frequency,
        waveform: levels?.waveform,
      })

      raf = requestAnimationFrame(paint)
    }

    raf = requestAnimationFrame(paint)
    return () => cancelAnimationFrame(raf)
  }, [audioRef, playing, trackId])

  return (
    <canvas
      ref={canvasRef}
      className="ipod-now__viz"
      width={SIZE}
      height={SIZE}
      aria-hidden
    />
  )
}
