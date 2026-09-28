import { useCallback, useEffect, useRef, useState } from 'react'
import * as pdfjs from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import { DesktopWindow } from './desktop/DesktopWindow'
import type { WindowPoint } from '../hooks/useDraggableWindow'
import './ResumePdfWindow.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export const RESUME_PDF_URL = '/desktop/Eshaan_Walia_resume.pdf'
export const RESUME_PDF_NAME = 'Eshaan_Walia_resume.pdf'

const DEFAULT_ZOOM = 0.75
const MIN_ZOOM = 0.3
const MAX_ZOOM = 2
const ZOOM_STEP = 0.15
/** CSS layout scale at 100% zoom — bitmap is rendered at higher DPR. */
const DISPLAY_SCALE = 1.5

function pdfRectToViewport(viewport: pdfjs.PageViewport, rect: number[]): [number, number, number, number] {
  const [vx1, vy1] = viewport.convertToViewportPoint(rect[0], rect[1])
  const [vx2, vy2] = viewport.convertToViewportPoint(rect[2], rect[3])
  return [vx1, vy1, vx2, vy2]
}

function resolveAnnotationUrl(rawUrl: string): string | null {
  const direct = pdfjs.createValidAbsoluteUrl(rawUrl)
  if (direct) return direct.href

  if (typeof window === 'undefined') return null
  const docBase = new URL(RESUME_PDF_URL, window.location.origin).href
  return pdfjs.createValidAbsoluteUrl(rawUrl, docBase)?.href ?? null
}

async function appendAnnotationLinks(
  page: PDFPageProxy,
  doc: PDFDocumentProxy,
  viewport: pdfjs.PageViewport,
  layer: HTMLDivElement,
  pagesHost: HTMLDivElement,
) {
  const annotations = await page.getAnnotations({ intent: 'display' })
  layer.replaceChildren()

  for (const annotation of annotations) {
    if (annotation.subtype !== 'Link') continue

    const rect = pdfRectToViewport(viewport, annotation.rect as number[])
    const [x1, y1, x2, y2] = rect
    const left = Math.min(x1, x2)
    const top = Math.min(y1, y2)
    const width = Math.abs(x2 - x1)
    const height = Math.abs(y2 - y1)
    if (width < 1 || height < 1) continue

    const link = document.createElement('a')
    link.className = 'resume-pdf__link'
    link.style.left = `${left}px`
    link.style.top = `${top}px`
    link.style.width = `${width}px`
    link.style.height = `${height}px`

    const rawUrl = annotation.url ?? annotation.unsafeUrl
    if (rawUrl) {
      const href = resolveAnnotationUrl(rawUrl)
      if (!href) continue
      link.href = href
      const parsed = pdfjs.createValidAbsoluteUrl(href)
      const external =
        parsed?.protocol === 'http:' ||
        parsed?.protocol === 'https:' ||
        annotation.newWindow
      if (external) {
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
      }
      link.addEventListener('pointerdown', (event) => event.stopPropagation())
      layer.appendChild(link)
      continue
    }

    if (!annotation.dest) continue

    link.href = '#'
    link.addEventListener('click', (event) => {
      event.preventDefault()
      void scrollToPdfDestination(doc, annotation.dest, pagesHost)
    })
    layer.appendChild(link)
  }
}

async function scrollToPdfDestination(
  doc: PDFDocumentProxy,
  dest: string | unknown[] | null,
  pagesHost: HTMLDivElement,
) {
  if (!dest) return

  let explicitDest: unknown[] | null = null
  if (typeof dest === 'string') {
    explicitDest = (await doc.getDestination(dest)) as unknown[] | null
  } else if (Array.isArray(dest)) {
    explicitDest = dest
  }
  if (!explicitDest?.length) return

  const pageRef = explicitDest[0]
  let pageNumber = 1
  if (pageRef && typeof pageRef === 'object' && 'num' in pageRef) {
    pageNumber = (await doc.getPageIndex(pageRef as { num: number; gen: number })) + 1
  } else if (typeof pageRef === 'number') {
    pageNumber = pageRef + 1
  }

  pagesHost
    .querySelector(`[data-pdf-page="${pageNumber}"]`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

type Props = {
  windowId: string
  zIndex: number
  position: WindowPoint
  onPositionChange: (point: WindowPoint) => void
  onFocus: () => void
  onClose: () => void
}

export function ResumePdfWindow({
  windowId,
  zIndex,
  position,
  onPositionChange,
  onFocus,
  onClose,
}: Props) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [pageCount, setPageCount] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pdfRef = useRef<pdfjs.PDFDocumentProxy | null>(null)
  const pagesRef = useRef<HTMLDivElement>(null)

  const render = useCallback(async (doc: pdfjs.PDFDocumentProxy, zoomLevel: number) => {
    const host = pagesRef.current
    if (!host) return
    host.innerHTML = ''

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 3)
    const layoutScale = DISPLAY_SCALE * zoomLevel

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const viewport = page.getViewport({ scale: layoutScale })
      const renderViewport = page.getViewport({ scale: layoutScale * pixelRatio })

      const pageWrap = document.createElement('div')
      pageWrap.className = 'resume-pdf__page-wrap'
      pageWrap.dataset.pdfPage = String(i)
      pageWrap.style.width = `${Math.floor(viewport.width)}px`
      pageWrap.style.height = `${Math.floor(viewport.height)}px`

      const canvas = document.createElement('canvas')
      canvas.className = 'resume-pdf__page'
      canvas.style.width = `${Math.floor(viewport.width)}px`
      canvas.style.height = `${Math.floor(viewport.height)}px`
      canvas.width = Math.floor(renderViewport.width)
      canvas.height = Math.floor(renderViewport.height)

      const annotationLayer = document.createElement('div')
      annotationLayer.className = 'resume-pdf__annotations'
      annotationLayer.style.width = `${Math.floor(viewport.width)}px`
      annotationLayer.style.height = `${Math.floor(viewport.height)}px`

      pageWrap.append(canvas, annotationLayer)
      host.appendChild(pageWrap)

      const ctx = canvas.getContext('2d')
      if (!ctx) continue

      await page.render({
        canvasContext: ctx,
        viewport: renderViewport,
        canvas,
      }).promise

      await appendAnnotationLinks(page, doc, viewport, annotationLayer, host)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const task = pdfjs.getDocument({ url: RESUME_PDF_URL })
    task.promise
      .then((doc) => {
        if (cancelled) return
        pdfRef.current = doc
        setPageCount(doc.numPages)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load the resume PDF.')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
      pdfRef.current = null
      void task.destroy()
    }
  }, [])

  useEffect(() => {
    const doc = pdfRef.current
    if (!doc || loading || error) return
    void render(doc, zoom)
  }, [zoom, loading, error, render])

  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, Math.round((z - ZOOM_STEP) * 100) / 100))
  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + ZOOM_STEP) * 100) / 100))
  const zoomReset = () => setZoom(DEFAULT_ZOOM)

  const zoomLabel = `${Math.round(zoom * 100)}%`
  const pageMeta = `${pageCount} ${pageCount === 1 ? 'page' : 'pages'}`

  const zoomToolbar = (
    <div className="resume-pdf__zoom" aria-label="Zoom">
      <button type="button" className="resume-pdf__zoom-btn" onClick={zoomOut} aria-label="Zoom out">
        −
      </button>
      <button type="button" className="resume-pdf__zoom-pct" onClick={zoomReset} aria-label="Reset zoom">
        {zoomLabel}
      </button>
      <button type="button" className="resume-pdf__zoom-btn" onClick={zoomIn} aria-label="Zoom in">
        +
      </button>
    </div>
  )

  return (
    <DesktopWindow
      windowId={windowId}
      title={RESUME_PDF_NAME}
      subtitle={pageMeta}
      variant="preview"
      zIndex={zIndex}
      position={position}
      onPositionChange={onPositionChange}
      onFocus={onFocus}
      onClose={onClose}
      toolbarEnd={zoomToolbar}
    >
      <div className="resume-pdf__viewport">
        {loading && <p className="resume-pdf__status">Loading…</p>}
        {error && <p className="resume-pdf__status resume-pdf__status--error">{error}</p>}
        <div
          ref={pagesRef}
          className="resume-pdf__pages"
          aria-hidden={loading || Boolean(error)}
          style={loading || error ? { display: 'none' } : undefined}
        />
      </div>
    </DesktopWindow>
  )
}
