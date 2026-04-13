'use client'

import { useState, useRef, useEffect } from 'react'
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  PlusIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error'

interface EditorToolbarProps {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onAddNode: () => void
  onAutoLayout: () => void
  gridEnabled: boolean
  onToggleGrid: () => void
  onExportPng: () => void
  onExportSvg: () => void
  onExportPdf: () => void
  saveStatus: SaveStatus
}

const ToolButton = ({
  onClick,
  disabled,
  icon: Icon,
  label,
  active,
}: {
  onClick: () => void
  disabled?: boolean
  icon: React.ElementType
  label: string
  active?: boolean
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors active:scale-95 ${
      disabled
        ? 'cursor-not-allowed text-gray-300'
        : active
          ? 'bg-gray-900 text-white'
          : 'text-gray-500 hover:bg-black hover:text-white'
    }`}
    title={label}
    aria-label={label}
  >
    <Icon className="h-4 w-4" />
  </button>
)

const Divider = () => <div className="mx-1 h-4 w-px bg-gray-200" />

const SaveIndicator = ({ status }: { status: SaveStatus }) => {
  const colors: Record<SaveStatus, string> = {
    saved: 'bg-green-400',
    unsaved: 'bg-yellow-400',
    saving: 'bg-yellow-400 animate-pulse',
    error: 'bg-red-400',
  }
  const labels: Record<SaveStatus, string> = {
    saved: 'Saved',
    unsaved: 'Unsaved changes',
    saving: 'Saving...',
    error: 'Save failed',
  }

  return (
    <div className="flex items-center gap-1.5 px-2" title={labels[status]}>
      <div className={`h-2 w-2 rounded-full ${colors[status]}`} />
      <span className="text-[10px] font-medium text-gray-400">
        {labels[status]}
      </span>
    </div>
  )
}

export default function EditorToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onAddNode,
  onAutoLayout,
  gridEnabled,
  onToggleGrid,
  onExportPng,
  onExportSvg,
  onExportPdf,
  saveStatus,
}: EditorToolbarProps) {
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  // Close export dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as HTMLElement)) {
        setExportOpen(false)
      }
    }
    if (exportOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [exportOpen])

  return (
    <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-gray-200 bg-white/90 p-1.5 shadow-xl shadow-gray-200/50 backdrop-blur-md">
      {/* Undo / Redo */}
      <ToolButton
        onClick={onUndo}
        disabled={!canUndo}
        icon={ArrowUturnLeftIcon}
        label="Undo (Ctrl+Z)"
      />
      <ToolButton
        onClick={onRedo}
        disabled={!canRedo}
        icon={ArrowUturnRightIcon}
        label="Redo (Ctrl+Shift+Z)"
      />

      <Divider />

      {/* Add Node */}
      <ToolButton onClick={onAddNode} icon={PlusIcon} label="Add Node" />

      <Divider />

      {/* Auto-Layout */}
      <ToolButton
        onClick={onAutoLayout}
        icon={Squares2X2Icon}
        label="Auto Layout"
      />

      <Divider />

      {/* Grid Toggle */}
      <ToolButton
        onClick={onToggleGrid}
        icon={TableCellsIcon}
        label={gridEnabled ? 'Hide Grid' : 'Show Grid'}
        active={gridEnabled}
      />

      <Divider />

      {/* Export Dropdown */}
      <div ref={exportRef} className="relative">
        <ToolButton
          onClick={() => setExportOpen(!exportOpen)}
          icon={ArrowDownTrayIcon}
          label="Export"
        />
        {exportOpen && (
          <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            <button
              onClick={() => {
                onExportPng()
                setExportOpen(false)
              }}
              className="flex w-full items-center whitespace-nowrap px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              PNG (High-Res)
            </button>
            <button
              onClick={() => {
                onExportSvg()
                setExportOpen(false)
              }}
              className="flex w-full items-center whitespace-nowrap px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              SVG
            </button>
            <button
              onClick={() => {
                onExportPdf()
                setExportOpen(false)
              }}
              className="flex w-full items-center whitespace-nowrap px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              PDF
            </button>
          </div>
        )}
      </div>

      <Divider />

      {/* Save Indicator */}
      <SaveIndicator status={saveStatus} />
    </div>
  )
}
