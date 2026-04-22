'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeftIcon,
  ShareIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { Node, Edge } from 'reactflow'
import FloatingToolbar from './FloatingToolbar'
import InfoPanel from './InfoPanel'
import ShareDialog from './ShareDialog'
import DownloadMenu from './DownloadMenu'
import DiagramCanvas, { DiagramCanvasHandle } from './DiagramCanvas'

export interface DiagramViewerShellProps {
  title: string
  type: string
  description?: string
  createdAt?: string
  mermaidCode?: string | null
  svgCode?: string | null
  imageUrl?: string | null
  flowDiagramData?: { nodes: Node[]; edges: Edge[] } | null
  chartJsData?: any | null
  mode: 'owner' | 'viewer'
  onBack?: () => void
  diagramId?: string
  onRetry?: () => Promise<void> | void
  retrying?: boolean
}

export default function DiagramViewerShell({
  title,
  type,
  description,
  createdAt,
  mermaidCode,
  svgCode,
  imageUrl,
  flowDiagramData,
  chartJsData,
  mode,
  onBack,
  diagramId,
  onRetry,
  retrying,
}: DiagramViewerShellProps) {
  const [headerVisible, setHeaderVisible] = useState(true)
  const [infoPanelOpen, setInfoPanelOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const [zoomLevel, setZoomLevel] = useState(100)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const shellRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<DiagramCanvasHandle>(null)
  const headerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetHeaderTimer = useCallback(() => {
    setHeaderVisible(true)
    if (headerTimerRef.current) clearTimeout(headerTimerRef.current)
    headerTimerRef.current = setTimeout(() => {
      setHeaderVisible(false)
    }, 3000)
  }, [])

  useEffect(() => {
    resetHeaderTimer()
    return () => {
      if (headerTimerRef.current) clearTimeout(headerTimerRef.current)
    }
  }, [resetHeaderTimer])

  const handleMouseMoveOnShell = useCallback(
    (e: React.MouseEvent) => {
      if (e.clientY < 80) {
        setHeaderVisible(true)
        if (headerTimerRef.current) clearTimeout(headerTimerRef.current)
      } else if (headerVisible) {
        resetHeaderTimer()
      }
    },
    [headerVisible, resetHeaderTimer],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Escape') {
        setHeaderVisible(true)
        resetHeaderTimer()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [resetHeaderTimer])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!shellRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      shellRef.current.requestFullscreen()
    }
  }, [])

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setZoomLevel((prev) => {
      const step = 25
      const next = direction === 'in' ? prev + step : prev - step
      return Math.min(Math.max(next, 25), 300)
    })
  }, [])

  const handleFitToScreen = useCallback(() => {
    setZoomLevel(100)
    setPosition({ x: 0, y: 0 })
  }, [])

  const isFlowDiagram = type.toLowerCase() === 'flow diagram'

  return (
    <div
      ref={shellRef}
      className="relative flex h-screen w-full flex-col overflow-hidden bg-ink text-paper"
      onMouseMove={handleMouseMoveOnShell}
    >
      {/* Atmosphere — dot grid + signal bloom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-dot-grid bg-dot-24 opacity-50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/4 h-[480px] w-[480px] rounded-full bg-signal/5 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-signal/[0.04] blur-[120px]"
      />

      {/* Auto-hiding header */}
      <AnimatePresence>
        {headerVisible && (
          <motion.header
            initial={{ y: -56, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -56, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-rule bg-ink/85 px-6 backdrop-blur-xl"
            onMouseEnter={() => {
              if (headerTimerRef.current)
                clearTimeout(headerTimerRef.current)
              setHeaderVisible(true)
            }}
            onMouseLeave={resetHeaderTimer}
          >
            {/* Left */}
            <div className="flex items-center gap-4">
              {mode === 'owner' && onBack && (
                <>
                  <button
                    onClick={onBack}
                    className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-fog transition-colors hover:text-signal"
                    aria-label="Back to dashboard"
                  >
                    <ChevronLeftIcon className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                    Sheet
                  </button>
                  <span className="font-mono text-[10px] text-fog/60">/</span>
                </>
              )}

              <div className="flex items-center gap-3">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-signal/60" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-signal" />
                </span>
                <h1 className="max-w-[340px] truncate font-serif text-lg leading-none text-paper">
                  {title || 'Untitled'}
                </h1>
                <span className="border border-rule bg-graphite px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.24em] text-fog">
                  {type.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1">
              <HeaderButton
                icon={InformationCircleIcon}
                label="Details"
                onClick={() => setInfoPanelOpen(true)}
              />
              <HeaderButton
                icon={ShareIcon}
                label="Share"
                onClick={() => setShareDialogOpen(true)}
              />
              <DownloadMenu
                contentRef={{
                  current: canvasRef.current?.contentElement ?? null,
                }}
                title={title}
                type={type}
              />

            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Margin marks — editorial sheet corners */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-6 top-20 font-mono text-[9px] uppercase tracking-[0.24em] text-fog/50"
      >
        ▸ Draft · {new Date().getFullYear()}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-6 right-6 font-mono text-[9px] uppercase tracking-[0.24em] text-fog/50"
      >
        {zoomLevel}% · {type.replace('_', ' ')}
      </div>

      {/* Canvas */}
      <main className="relative flex-1">
        <DiagramCanvas
          ref={canvasRef}
          type={type}
          mermaidCode={mermaidCode}
          svgCode={svgCode}
          imageUrl={imageUrl}
          flowDiagramData={flowDiagramData}
          chartJsData={chartJsData}
          zoomLevel={zoomLevel}
          position={position}
          onPositionChange={setPosition}
          onZoomChange={setZoomLevel}
          editableFlow={mode === 'owner'}
          diagramId={diagramId}
          title={title}
          onRetry={mode === 'owner' ? onRetry : undefined}
          retrying={retrying}
        />
      </main>

      {!isFlowDiagram && (
        <FloatingToolbar
          zoomLevel={zoomLevel}
          onZoom={handleZoom}
          onFitToScreen={handleFitToScreen}
          onFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
      )}

      <InfoPanel
        open={infoPanelOpen}
        onClose={() => setInfoPanelOpen(false)}
        title={title}
        type={type}
        description={description}
        createdAt={createdAt}
      />

      <ShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        mode={mode}
        diagramId={diagramId}
      />
    </div>
  )
}

function HeaderButton({
  icon: Icon,
  onClick,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-sm p-2 text-fog transition-all duration-150 hover:bg-graphite hover:text-signal"
      title={label}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
