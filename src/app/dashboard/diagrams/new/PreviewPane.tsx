'use client'

import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import clsx from 'clsx'

let mermaidInitialized = false

function ensureMermaidInitialized() {
  if (mermaidInitialized) return
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    themeVariables: {
      darkMode: true,
      background: '#141417',
      primaryColor: '#141417',
      primaryTextColor: '#F3EFE4',
      primaryBorderColor: '#C4FF3D',
      lineColor: '#76766F',
      secondaryColor: '#0B0B0C',
      tertiaryColor: '#141417',
    },
  })
  mermaidInitialized = true
}

export default function PreviewPane({
  code,
  streaming = false,
  className,
}: {
  code: string
  streaming?: boolean
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [renderError, setRenderError] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragState = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const idRef = useRef(`mmd-${Math.random().toString(36).slice(2, 9)}`)

  useEffect(() => {
    ensureMermaidInitialized()
  }, [])

  useEffect(() => {
    if (!code || !containerRef.current) return
    let cancelled = false
    const host = containerRef.current

    ;(async () => {
      try {
        const ok = await mermaid
          .parse(code, { suppressErrors: true })
          .catch(() => false)
        if (!ok) {
          if (!cancelled) setRenderError(true)
          return
        }
        const { svg } = await mermaid.render(idRef.current, code)
        if (cancelled) return
        host.innerHTML = svg
        setRenderError(false)
      } catch {
        if (!cancelled) setRenderError(true)
      } finally {
        document.getElementById(`d${idRef.current}`)?.remove()
      }
    })()

    return () => {
      cancelled = true
    }
  }, [code])

  const onMouseDown = (e: React.MouseEvent) => {
    dragState.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragState.current) return
    setOffset({
      x: dragState.current.ox + (e.clientX - dragState.current.x),
      y: dragState.current.oy + (e.clientY - dragState.current.y),
    })
  }
  const onMouseUp = () => {
    dragState.current = null
  }

  return (
    <div
      className={clsx(
        'relative flex h-full flex-col overflow-hidden bg-ink',
        className,
      )}
    >
      {/* Dot grid atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 bg-dot-grid bg-dot-24 opacity-60"
        aria-hidden
      />

      {/* Header rail */}
      <div className="relative z-10 flex items-center justify-between border-b border-rule/60 bg-ink/80 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-fog">
          <span className="inline-flex h-1.5 w-1.5 items-center">
            <span
              className={clsx(
                'h-1.5 w-1.5 rounded-full',
                streaming ? 'bg-signal animate-tick' : 'bg-signal/40',
              )}
            />
          </span>
          <span className="text-paper/80">Preview</span>
          {renderError && (
            <span className="text-red-300/90">· invalid syntax</span>
          )}
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] text-fog">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.3, +(z - 0.15).toFixed(2)))}
            className="rounded-sm px-2 py-1 hover:bg-graphite"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="w-10 text-center tabular-nums text-paper/80">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, +(z + 0.15).toFixed(2)))}
            className="rounded-sm px-2 py-1 hover:bg-graphite"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(1)
              setOffset({ x: 0, y: 0 })
            }}
            className="ml-1 rounded-sm border border-rule/60 px-2 py-1 uppercase tracking-[0.18em] hover:bg-graphite"
          >
            Fit
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative z-0 flex-1 cursor-grab overflow-hidden active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {!code && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-xs text-center">
              <p className="font-serif text-2xl italic text-paper/70">
                Awaiting the first draft.
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-fog">
                Your diagram will appear here
              </p>
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className="absolute left-1/2 top-1/2 origin-center"
          style={{
            transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
            transition: dragState.current ? 'none' : 'transform 160ms ease-out',
          }}
        />
      </div>

      {/* Scan line during streaming */}
      {streaming && (
        <div className="pointer-events-none absolute inset-x-0 top-12 z-10 h-px overflow-hidden">
          <div className="h-full w-1/3 animate-scan bg-gradient-to-r from-transparent via-signal/70 to-transparent" />
        </div>
      )}
    </div>
  )
}
