type AudioGraph = {
  ctx: AudioContext
  analyser: AnalyserNode
  frequency: Uint8Array<ArrayBuffer>
  waveform: Uint8Array<ArrayBuffer>
}

const graphs = new WeakMap<HTMLAudioElement, AudioGraph>()

function attachGraph(audio: HTMLAudioElement): AudioGraph {
  const existing = graphs.get(audio)
  if (existing) return existing

  const ctx = new AudioContext()
  const source = ctx.createMediaElementSource(audio)
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 256
  analyser.smoothingTimeConstant = 0.72
  source.connect(analyser)
  analyser.connect(ctx.destination)

  const graph: AudioGraph = {
    ctx,
    analyser,
    frequency: new Uint8Array(analyser.frequencyBinCount),
    waveform: new Uint8Array(analyser.fftSize),
  }
  graphs.set(audio, graph)
  return graph
}

export function sampleAudioLevels(audio: HTMLAudioElement | null): {
  frequency: Uint8Array
  waveform: Uint8Array
} | null {
  if (!audio || audio.paused) return null
  try {
    const graph = attachGraph(audio)
    if (graph.ctx.state === 'suspended') void graph.ctx.resume()
    graph.analyser.getByteFrequencyData(graph.frequency)
    graph.analyser.getByteTimeDomainData(graph.waveform)
    return { frequency: graph.frequency, waveform: graph.waveform }
  } catch {
    return null
  }
}
