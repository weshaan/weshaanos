/** Keep in sync with WordleGame.css flip animation. */
export const WORDLE_TILE_STAGGER_MS = 55
export const WORDLE_TILE_FLIP_MS = 550
export const WORDLE_TILE_COLS = 5

/** Time until the last tile in a row finishes its reveal animation. */
export function wordleRowRevealDurationMs(cols = WORDLE_TILE_COLS): number {
  return (cols - 1) * WORDLE_TILE_STAGGER_MS + WORDLE_TILE_FLIP_MS
}
