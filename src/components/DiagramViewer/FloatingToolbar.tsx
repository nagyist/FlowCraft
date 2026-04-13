'use client'

import {
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline'
import { Maximize2, Minimize2 } from 'lucide-react'

interface FloatingToolbarProps {
  zoomLevel: number
  onZoom: (direction: 'in' | 'out') => void
  onFitToScreen: () => void
  onFullscreen: () => void
  isFullscreen: boolean
}

export default function FloatingToolbar({
  zoomLevel,
  onZoom,
  onFitToScreen,
  onFullscreen,
  isFullscreen,
}: FloatingToolbarProps) {
  return (
    <div className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full border border-gray-200/80 bg-white/90 px-2 py-1.5 shadow-lg shadow-black/5 backdrop-blur-xl">
      <ToolButton
        onClick={() => onZoom('out')}
        icon={MagnifyingGlassMinusIcon}
        label="Zoom Out"
        disabled={zoomLevel <= 25}
      />
      <span className="w-14 select-none text-center font-mono text-xs font-medium text-gray-500">
        {zoomLevel}%
      </span>
      <ToolButton
        onClick={() => onZoom('in')}
        icon={MagnifyingGlassPlusIcon}
        label="Zoom In"
        disabled={zoomLevel >= 300}
      />

      <Divider />

      <ToolButton
        onClick={onFitToScreen}
        icon={ArrowsPointingOutIcon}
        label="Fit to Screen"
      />

      <Divider />

      <ToolButton
        onClick={onFullscreen}
        icon={isFullscreen ? Minimize2 : Maximize2}
        label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      />
    </div>
  )
}

function Divider() {
  return <div className="mx-0.5 h-4 w-px bg-gray-200" />
}

function ToolButton({
  icon: Icon,
  onClick,
  label,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-all duration-150 hover:bg-gray-900 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-30"
      title={label}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
