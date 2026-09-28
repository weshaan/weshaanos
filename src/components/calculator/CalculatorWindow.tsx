import { useCallback, useEffect, useState } from 'react'
import { useDraggableWindow, type WindowPoint } from '../../hooks/useDraggableWindow'
import {
  calcBackspace,
  calcClear,
  calcDecimal,
  calcDigit,
  calcEquals,
  calcExpressionPreview,
  calcMainDisplay,
  calcOperator,
  calcPercent,
  calcToggleSign,
  initialCalcState,
  type CalcOp,
  type CalcState,
} from './calcEngine'
import './CalculatorWindow.css'

type Props = {
  windowId: string
  zIndex: number
  position: WindowPoint
  onPositionChange: (point: WindowPoint) => void
  onFocus: () => void
  onClose: () => void
}

type KeyDef =
  | { kind: 'digit'; label: string; value: string }
  | { kind: 'action'; label: string; action: 'backspace' | 'clear' | 'percent' | 'sign' | 'decimal' | 'equals' }
  | { kind: 'op'; label: string; op: CalcOp }

const KEYS: KeyDef[] = [
  { kind: 'action', label: '⌫', action: 'backspace' },
  { kind: 'action', label: 'AC', action: 'clear' },
  { kind: 'action', label: '%', action: 'percent' },
  { kind: 'op', label: '÷', op: '÷' },
  { kind: 'digit', label: '7', value: '7' },
  { kind: 'digit', label: '8', value: '8' },
  { kind: 'digit', label: '9', value: '9' },
  { kind: 'op', label: '×', op: '×' },
  { kind: 'digit', label: '4', value: '4' },
  { kind: 'digit', label: '5', value: '5' },
  { kind: 'digit', label: '6', value: '6' },
  { kind: 'op', label: '−', op: '−' },
  { kind: 'digit', label: '1', value: '1' },
  { kind: 'digit', label: '2', value: '2' },
  { kind: 'digit', label: '3', value: '3' },
  { kind: 'op', label: '+', op: '+' },
  { kind: 'action', label: '+/-', action: 'sign' },
  { kind: 'digit', label: '0', value: '0' },
  { kind: 'action', label: '.', action: 'decimal' },
  { kind: 'action', label: '=', action: 'equals' },
]

function BackspaceIcon() {
  return (
    <svg className="calculator-key__backspace-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M8.2 5.5h11.3a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H8.2a1.5 1.5 0 0 1-1.2-.6L2.8 13.1a1.5 1.5 0 0 1 0-1.8l4.2-5.2a1.5 1.5 0 0 1 1.2-.6zm3.8 4.1a1 1 0 0 0-1.4 1.4L11.6 12l-1 1a1 1 0 1 0 1.4 1.4l1-1 1 1a1 1 0 1 0 1.4-1.4l-1-1 1-1a1 1 0 0 0-1.4-1.4l-1 1-1-1z"
      />
    </svg>
  )
}

export function CalculatorWindow({
  windowId,
  zIndex,
  position,
  onPositionChange,
  onFocus,
  onClose,
}: Props) {
  const { titleBarProps } = useDraggableWindow(position, onPositionChange)
  const [state, setState] = useState<CalcState>(initialCalcState)
  const expressionPreview = calcExpressionPreview(state)
  const mainDisplay = calcMainDisplay(state)

  const press = useCallback((key: KeyDef) => {
    setState((s) => {
      switch (key.kind) {
        case 'digit':
          return calcDigit(s, key.value)
        case 'op':
          return calcOperator(s, key.op)
        case 'action':
          switch (key.action) {
            case 'backspace':
              return calcBackspace(s)
            case 'clear':
              return calcClear(s)
            case 'percent':
              return calcPercent(s)
            case 'sign':
              return calcToggleSign(s)
            case 'decimal':
              return calcDecimal(s)
            case 'equals':
              return calcEquals(s)
          }
      }
    })
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault()
        press({ kind: 'digit', label: e.key, value: e.key })
        return
      }
      if (e.key === '.') {
        e.preventDefault()
        press({ kind: 'action', label: '.', action: 'decimal' })
        return
      }
      if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault()
        press({ kind: 'action', label: '=', action: 'equals' })
        return
      }
      if (e.key === 'Backspace') {
        e.preventDefault()
        press({ kind: 'action', label: '⌫', action: 'backspace' })
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        press({ kind: 'action', label: 'AC', action: 'clear' })
        return
      }
      const opMap: Record<string, CalcOp> = { '+': '+', '-': '−', '*': '×', '/': '÷' }
      if (opMap[e.key]) {
        e.preventDefault()
        press({ kind: 'op', label: opMap[e.key], op: opMap[e.key] })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [press])

  return (
    <div
      className="calculator-window"
      style={{ left: position.x, top: position.y, zIndex }}
      role="dialog"
      aria-label="Calculator"
      data-window-id={windowId}
      onPointerDown={onFocus}
    >
      <header
        className="calculator-window__titlebar"
        {...titleBarProps}
        style={{ touchAction: 'none', cursor: 'grab' }}
      >
        <button type="button" className="calculator-window__traffic" onClick={onClose} aria-label="Close">
          <span className="calculator-window__dot calculator-window__dot--close" />
          <span className="calculator-window__dot calculator-window__dot--min" />
          <span className="calculator-window__dot calculator-window__dot--max" />
        </button>
      </header>

      <div className="calculator-window__displays">
        <div
          className={`calculator-window__expression${expressionPreview ? '' : ' calculator-window__expression--empty'}`}
          aria-hidden
        >
          {expressionPreview ?? '\u00a0'}
        </div>
        <div className="calculator-window__display" aria-live="polite" aria-atomic="true">
          {mainDisplay}
        </div>
      </div>

      <div className="calculator-window__keypad">
        {KEYS.map((key, i) => {
          const isOp = key.kind === 'op' || (key.kind === 'action' && key.action === 'equals')
          const isFn = key.kind === 'action' && key.action !== 'equals'
          const glyphClass =
            key.kind === 'op'
              ? ` calculator-key__glyph--op-${key.op === '+' ? 'plus' : key.op === '−' ? 'minus' : key.op === '×' ? 'times' : 'divide'}`
              : key.kind === 'action' && key.action === 'equals'
                ? ' calculator-key__glyph--equals'
                : key.kind === 'action' && key.action === 'sign'
                  ? ' calculator-key__glyph--sign'
                  : key.kind === 'action' && key.action === 'backspace'
                    ? ' calculator-key__glyph--backspace'
                    : ''
          return (
            <button
              key={i}
              type="button"
              className={`calculator-key${isOp ? ' calculator-key--op' : ''}${isFn ? ' calculator-key--fn' : ''}`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => press(key)}
            >
              <span className={`calculator-key__glyph${glyphClass}`}>
                {key.kind === 'action' && key.action === 'backspace' ? <BackspaceIcon /> : key.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
