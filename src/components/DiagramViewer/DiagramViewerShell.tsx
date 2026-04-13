'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeftIcon,
  ShareIcon,
  InformationCircleIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline'
import { Node, Edge } from 'reactflow'
import Image from 'next/image'
import FlowCraftLogo from '@/images/FlowCraftLogo_New.png'
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
}: DiagramViewerShellProps) {
  // UI state
  const [headerVisible, setHeaderVisible] = useState(true)
  const [infoPanelOpen, setInfoPanelOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Zoom/pan state
  const [zoomLevel, setZoomLevel] = useState(100)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  // Refs
  const shellRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<DiagramCanvasHandle>(null)
  const headerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-hide header
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
      // Show header when mouse is near top
      if (e.clientY < 80) {
        setHeaderVisible(true)
        if (headerTimerRef.current) clearTimeout(headerTimerRef.current)
      } else if (headerVisible) {
        resetHeaderTimer()
      }
    },
    [headerVisible, resetHeaderTimer],
  )

  // Keyboard accessibility - show header on Tab/Escape
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

  // Fullscreen
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

  // Zoom
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setZoomLevel((prev) => {
      const step = 25
      const next = direction === 'in' ? prev + step : prev - step
      return Math.min(Math.max(next, 25), 300)
    })
  }, [])

  // Fit to screen
  const handleFitToScreen = useCallback(() => {
    setZoomLevel(100)
    setPosition({ x: 0, y: 0 })
  }, [])

  const isFlowDiagram = type.toLowerCase() === 'flow diagram'

  return (
    <div
      ref={shellRef}
      className="relative flex h-screen w-full flex-col overflow-hidden bg-[#FAFAFA]"
      onMouseMove={handleMouseMoveOnShell}
    >
      {/* Auto-hiding header */}
      <AnimatePresence>
        {headerVisible && (
          <motion.header
            initial={{ y: -48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -48, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-0 z-30 flex h-12 items-center justify-between border-b border-gray-200/40 bg-white/80 px-4 backdrop-blur-xl"
            onMouseEnter={() => {
              if (headerTimerRef.current)
                clearTimeout(headerTimerRef.current)
              setHeaderVisible(true)
            }}
            onMouseLeave={resetHeaderTimer}
          >
            {/* Left side */}
            <div className="flex items-center gap-3">
              {mode === 'owner' && onBack && (
                <>
                  <button
                    onClick={onBack}
                    className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    aria-label="Back"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <div className="h-4 w-px bg-gray-200" />
                </>
              )}

              <div className="flex items-center gap-2.5">
                <h1 className="max-w-[300px] truncate text-sm font-medium text-gray-900">
                  {title || 'Untitled'}
                </h1>
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  {type.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Right side */}
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
                contentRef={{ current: canvasRef.current?.contentElement ?? null }}
                title={title}
                type={type}
              />

              <div className="ml-1 h-4 w-px bg-gray-200" />
              <Image
                src={FlowCraftLogo}
                alt="FlowCraft"
                className="ml-1 h-6 w-6 opacity-60"
              />
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main canvas */}
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
        />
      </main>

      {/* Floating toolbar (hide for flow diagrams since ReactFlow has its own controls) */}
      {!isFlowDiagram && (
        <FloatingToolbar
          zoomLevel={zoomLevel}
          onZoom={handleZoom}
          onFitToScreen={handleFitToScreen}
          onFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
      )}

      {/* Info panel */}
      <InfoPanel
        open={infoPanelOpen}
        onClose={() => setInfoPanelOpen(false)}
        title={title}
        type={type}
        description={description}
        createdAt={createdAt}
      />

      {/* Share dialog */}
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
      className="rounded-full p-2 text-gray-500 transition-all duration-150 hover:bg-gray-100 hover:text-gray-900"
      title={label}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
