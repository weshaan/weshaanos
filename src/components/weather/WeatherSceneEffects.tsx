import { useEffect, useRef, useState } from 'react'

type Props = {
  scene: string
}

const PUBLIC = import.meta.env.BASE_URL

/** Looped backgrounds in public/weather/ — see public/weather/ATTRIBUTION.txt */
const SCENE_VIDEO_BASE: Partial<Record<string, string>> = {
  'weather-scene--clear': `${PUBLIC}weather/clear`,
  'weather-scene--partly': `${PUBLIC}weather/partly`,
  'weather-scene--cloudy': `${PUBLIC}weather/partly`,
  'weather-scene--rain': `${PUBLIC}weather/rain`,
  'weather-scene--storm': `${PUBLIC}weather/storm`,
  'weather-scene--night': `${PUBLIC}weather/night`,
}

export function WeatherSceneEffects({ scene }: Props) {
  const videoBase = SCENE_VIDEO_BASE[scene]
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)

  useEffect(() => {
    const el = videoRef.current
    if (!el || !videoBase) {
      setVideoReady(false)
      return
    }

    setVideoReady(false)

    const markReady = () => setVideoReady(true)

    const tryPlay = () => {
      void el.play().then(markReady).catch(markReady)
    }

    const onLoaded = () => {
      markReady()
      tryPlay()
    }

    el.addEventListener('loadeddata', onLoaded)
    el.load()
    if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) onLoaded()

    return () => {
      el.removeEventListener('loadeddata', onLoaded)
    }
  }, [videoBase, scene])

  useEffect(() => {
    const onVis = () => {
      const el = videoRef.current
      if (!el) return
      if (document.hidden) el.pause()
      else void el.play().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [videoBase])

  const suffix = sceneClassSuffix(scene)

  return (
    <div
      className={`weather-scene-effects weather-scene-effects--${suffix}${videoReady ? ' weather-scene-effects--has-video' : ''}`}
      aria-hidden
    >
      {videoBase ? (
        <video
          key={videoBase}
          ref={videoRef}
          className={`weather-scene-effects__video${videoReady ? ' weather-scene-effects__video--ready' : ''}`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onError={() => setVideoReady(false)}
        >
          {/* MP4 first for Safari; WebM for Chromium */}
          <source src={`${videoBase}.mp4`} type="video/mp4" />
          <source src={`${videoBase}.webm`} type="video/webm" />
        </video>
      ) : null}
      <div className="weather-scene-effects__particles" />
    </div>
  )
}

function sceneClassSuffix(scene: string): string {
  return scene.replace('weather-scene--', '') || 'partly'
}
