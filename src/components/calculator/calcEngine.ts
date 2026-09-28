export type CalcOp = '+' | '−' | '×' | '÷'

export type CalcState = {
  /** Operand being typed (not shown on main display while a binary op is pending). */
  entry: string
  stored: number | null
  pendingOp: CalcOp | null
  freshEntry: boolean
  /** Shown on main display when the expression cannot be fully evaluated yet. */
  lastResult: number
}

export const initialCalcState: CalcState = {
  entry: '0',
  stored: null,
  pendingOp: null,
  freshEntry: false,
  lastResult: 0,
}

function parseEntry(entry: string): number {
  const n = parseFloat(entry)
  return Number.isFinite(n) ? n : 0
}

function applyOp(a: number, b: number, op: CalcOp): number {
  switch (op) {
    case '+':
      return a + b
    case '−':
      return a - b
    case '×':
      return a * b
    case '÷':
      return b === 0 ? NaN : a / b
  }
}

function formatResult(n: number): string {
  if (!Number.isFinite(n)) return 'Error'
  if (Math.abs(n) >= 1e12 || (Math.abs(n) > 0 && Math.abs(n) < 1e-8)) {
    return n.toExponential(6).replace(/\+/, '')
  }
  const rounded = Math.round(n * 1e10) / 1e10
  let s = String(rounded)
  if (s.includes('e')) return s
  if (s.length > 12) s = rounded.toPrecision(10).replace(/\.?0+$/, '')
  return s
}

function errorState(): CalcState {
  return {
    entry: 'Error',
    stored: null,
    pendingOp: null,
    freshEntry: true,
    lastResult: 0,
  }
}

/** Large result line — live evaluation when possible, otherwise last result. */
export function calcMainDisplay(state: CalcState): string {
  if (state.entry === 'Error') return 'Error'
  if (state.pendingOp != null && state.stored != null) {
    if (!state.freshEntry) {
      const live = applyOp(state.stored, parseEntry(state.entry), state.pendingOp)
      return formatResult(live)
    }
    return formatResult(state.lastResult)
  }
  return state.entry
}

export function calcDigit(state: CalcState, digit: string): CalcState {
  if (state.entry === 'Error') return initialCalcState
  let entry = state.entry
  if (state.freshEntry) {
    entry = digit
  } else if (entry === '0') {
    entry = digit
  } else if (entry.replace('-', '').length < 12) {
    entry += digit
  }
  const lastResult = state.pendingOp == null ? parseEntry(entry) : state.lastResult
  return { ...state, entry, freshEntry: false, lastResult }
}

export function calcDecimal(state: CalcState): CalcState {
  if (state.entry === 'Error') return initialCalcState
  if (state.freshEntry) {
    return { ...state, entry: '0.', freshEntry: false, lastResult: state.pendingOp == null ? 0 : state.lastResult }
  }
  if (!state.entry.includes('.')) {
    const entry = `${state.entry}.`
    const lastResult = state.pendingOp == null ? parseEntry(entry) : state.lastResult
    return { ...state, entry, freshEntry: false, lastResult }
  }
  return state
}

export function calcToggleSign(state: CalcState): CalcState {
  if (state.entry === 'Error' || state.entry === '0') return state
  const entry = state.entry.startsWith('-') ? state.entry.slice(1) : `-${state.entry}`
  const lastResult = state.pendingOp == null ? parseEntry(entry) : state.lastResult
  return { ...state, entry, freshEntry: false, lastResult }
}

export function calcPercent(state: CalcState): CalcState {
  if (state.entry === 'Error') return initialCalcState
  const n = parseEntry(state.entry) / 100
  const entry = formatResult(n)
  if (entry === 'Error') return errorState()
  const lastResult = parseEntry(entry)
  return { ...state, entry, freshEntry: true, lastResult }
}

export function calcClear(_state: CalcState): CalcState {
  return initialCalcState
}

export function calcBackspace(state: CalcState): CalcState {
  if (state.entry === 'Error') return initialCalcState
  if (state.freshEntry) return state
  let entry = state.entry
  if (entry.length <= 1 || (entry.length === 2 && entry.startsWith('-'))) {
    entry = '0'
  } else {
    entry = entry.slice(0, -1)
  }
  const lastResult = state.pendingOp == null ? parseEntry(entry) : state.lastResult
  return { ...state, entry, lastResult }
}

export function calcOperator(state: CalcState, op: CalcOp): CalcState {
  if (state.entry === 'Error') return initialCalcState
  const current = parseEntry(state.entry)

  if (state.pendingOp != null && state.stored != null && !state.freshEntry) {
    const result = applyOp(state.stored, current, state.pendingOp)
    const formatted = formatResult(result)
    if (formatted === 'Error') return errorState()
    const lastResult = parseEntry(formatted)
    return {
      entry: formatted,
      stored: lastResult,
      pendingOp: op,
      freshEntry: true,
      lastResult,
    }
  }

  return {
    ...state,
    stored: current,
    pendingOp: op,
    freshEntry: true,
    lastResult: current,
  }
}

export function calcEquals(state: CalcState): CalcState {
  if (state.entry === 'Error') return initialCalcState
  if (state.pendingOp == null || state.stored == null) return state
  const current = state.freshEntry ? state.lastResult : parseEntry(state.entry)
  const result = applyOp(state.stored, current, state.pendingOp)
  const entry = formatResult(result)
  if (entry === 'Error') return errorState()
  const lastResult = parseEntry(entry)
  return {
    entry,
    stored: null,
    pendingOp: null,
    freshEntry: true,
    lastResult,
  }
}

/** Small expression row above the main display (e.g. 5×5). */
export function calcExpressionPreview(state: CalcState): string | null {
  if (state.entry === 'Error' || state.pendingOp == null || state.stored == null) return null
  const left = formatResult(state.stored)
  if (state.freshEntry) return `${left}${state.pendingOp}`
  return `${left}${state.pendingOp}${state.entry}`
}
