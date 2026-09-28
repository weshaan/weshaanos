export type ClockFaceId =
  | 'classic'
  | 'minimal'
  | 'midnight'
  | 'sunrise'
  | 'ocean'
  | 'forest'
  | 'neon'
  | 'terminal'
  | 'pastel'
  | 'lcd'
  | 'aurora'
  | 'checker'
  | 'orbit'
  | 'dusk'
  | 'frost'
  | 'copper'
  | 'candy'
  | 'ink'

export type ClockFaceOverlay =
  | 'scanlines'
  | 'grid'
  | 'rings'
  | 'hex'
  | 'dotfield'
  | 'stripes'
  | 'orbit-dots'

export type ClockFaceTraits = {
  ticks: boolean
  /** No second hand even when “Show seconds” is on */
  noSeconds: boolean
  overlay?: ClockFaceOverlay
}

export type ClockFace = {
  id: ClockFaceId
  label: string
  description: string
}

export const CLOCK_FACE_TRAITS: Record<ClockFaceId, ClockFaceTraits> = {
  classic: { ticks: true, noSeconds: false },
  minimal: { ticks: false, noSeconds: false },
  midnight: { ticks: true, noSeconds: false },
  sunrise: { ticks: true, noSeconds: false },
  ocean: { ticks: true, noSeconds: false },
  forest: { ticks: true, noSeconds: false, overlay: 'dotfield' },
  neon: { ticks: false, noSeconds: false, overlay: 'grid' },
  terminal: { ticks: false, noSeconds: false, overlay: 'scanlines' },
  pastel: { ticks: false, noSeconds: false, overlay: 'rings' },
  lcd: { ticks: true, noSeconds: false },
  aurora: { ticks: false, noSeconds: false, overlay: 'stripes' },
  checker: { ticks: false, noSeconds: false },
  orbit: { ticks: false, noSeconds: false, overlay: 'orbit-dots' },
  dusk: { ticks: true, noSeconds: false },
  frost: { ticks: true, noSeconds: false, overlay: 'hex' },
  copper: { ticks: true, noSeconds: false },
  candy: { ticks: false, noSeconds: false, overlay: 'dotfield' },
  ink: { ticks: false, noSeconds: false, overlay: 'rings' },
}

export const CLOCK_FACES: ClockFace[] = [
  {
    id: 'classic',
    label: 'Classic',
    description: 'Ticks, red second marker, and bold digital time.',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean digits only — subtle grey second marker.',
  },
  {
    id: 'midnight',
    label: 'Midnight',
    description: 'Dark face with soft ticks and a warm second dot.',
  },
  {
    id: 'sunrise',
    label: 'Sunrise',
    description: 'Warm gradient with light ticks and deep type.',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    description: 'Deep teal gradient with cool ticks and ice-white digits.',
  },
  {
    id: 'forest',
    label: 'Forest',
    description: 'Mossy greens, firefly dots, and soft minute marks.',
  },
  {
    id: 'neon',
    label: 'Neon',
    description: 'Cyber grid on black with glowing magenta time.',
  },
  {
    id: 'terminal',
    label: 'Terminal',
    description: 'Phosphor green on CRT black with scanlines.',
  },
  {
    id: 'pastel',
    label: 'Pastel',
    description: 'Cotton-candy wash with floating ring halos.',
  },
  {
    id: 'lcd',
    label: 'LCD',
    description: 'Retro calculator bezel and classic LCD green.',
  },
  {
    id: 'aurora',
    label: 'Aurora',
    description: 'Northern-light bands behind crisp white type.',
  },
  {
    id: 'checker',
    label: 'Checker',
    description: 'Playful bento squares with punchy contrast.',
  },
  {
    id: 'orbit',
    label: 'Orbit',
    description: 'Space navy with planetary dots and thin rings.',
  },
  {
    id: 'dusk',
    label: 'Dusk',
    description: 'Violet twilight gradient and lavender ticks.',
  },
  {
    id: 'frost',
    label: 'Frost',
    description: 'Icy glass, hex shimmer, and cool blue numerals.',
  },
  {
    id: 'copper',
    label: 'Copper',
    description: 'Burnished metal plate with bold hour marks.',
  },
  {
    id: 'candy',
    label: 'Candy',
    description: 'Bubblegum stripes and sprinkled confetti dots.',
  },
  {
    id: 'ink',
    label: 'Ink',
    description: 'Sumi paper, ink rings, and brush-weight type.',
  },
]

export const DEFAULT_CLOCK_FACE: ClockFaceId = 'classic'

export function getClockFaceTraits(id: ClockFaceId): ClockFaceTraits {
  return CLOCK_FACE_TRAITS[id]
}

export function isClockFaceId(value: string): value is ClockFaceId {
  return CLOCK_FACES.some((f) => f.id === value)
}
