import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useMusicPlayer } from '../hooks/useMusicPlayer'
import { useMusicPlaylist } from '../hooks/useMusicPlaylist'
import { setMusicAutoplayHandler } from '../music/autoplay'
import { setMusicPlaybackBridge } from '../music/playbackBridge'
import type { MusicTrack } from '../music/types'

type MusicPlayerContextValue = ReturnType<typeof useMusicPlayer> & {
  tracks: MusicTrack[]
  loadError: boolean
}

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null)

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const { tracks, loadError } = useMusicPlaylist()
  const player = useMusicPlayer(tracks)

  useEffect(() => {
    if (!player.hasTracks) {
      setMusicAutoplayHandler(null)
      setMusicPlaybackBridge(null)
      return
    }
    setMusicAutoplayHandler(() => {
      player.play()
    })
    setMusicPlaybackBridge({
      playTrack: (trackId) => player.playTrackById(trackId),
    })
    return () => {
      setMusicAutoplayHandler(null)
      setMusicPlaybackBridge(null)
    }
  }, [player.hasTracks, player.play, player.playTrackById, tracks])

  return (
    <MusicPlayerContext.Provider value={{ ...player, tracks, loadError }}>
      <audio
        ref={player.audioRef}
        preload="none"
        onTimeUpdate={player.onTimeUpdate}
        onLoadedMetadata={player.onLoadedMetadata}
        onEnded={player.onEnded}
        onPlay={player.onAudioPlay}
        onPause={player.onAudioPause}
      />
      {children}
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayerContext(): MusicPlayerContextValue {
  const ctx = useContext(MusicPlayerContext)
  if (!ctx) throw new Error('useMusicPlayerContext must be used within MusicPlayerProvider')
  return ctx
}
