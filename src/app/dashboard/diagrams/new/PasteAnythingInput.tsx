import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DocumentArrowUpIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { InputClassification, OptionType } from '@/lib/utils'
import DetectionChip from './DetectionChip'
import clsx from 'clsx'

const ACCEPTED_EXTENSIONS = [
  '.md',
  '.txt',
  '.json',
  '.yaml',
  '.yml',
  '.sql',
  '.py',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
]
const MAX_FILE_SIZE = 50 * 1024 // 50KB

export default function PasteAnythingInput({
  value,
  onChange,
  onClassify,
  classification,
  isClassifying,
  onOverride,
  fileName,
  onFileNameChange,
}: {
  value: string
  onChange: (text: string) => void
  onClassify: (text: string, filename?: string) => void
  classification: InputClassification | null
  isClassifying: boolean
  onOverride: (type: OptionType) => void
  fileName: string | null
  onFileNameChange: (name: string | null) => void
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTextChange = useCallback(
    (text: string) => {
      onChange(text)
      onClassify(text, fileName || undefined)
      setFileError(null)
    },
    [onChange, onClassify, fileName],
  )

  const handleFileRead = useCallback(
    (file: File) => {
      setFileError(null)

      // Validate extension
      const ext = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setFileError(
          `Unsupported file type. Accepted: ${ACCEPTED_EXTENSIONS.join(', ')}`,
        )
        return
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        setFileError('File too large (max 50KB)')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        onFileNameChange(file.name)
        onChange(text)
        onClassify(text, file.name)
      }
      reader.onerror = () => setFileError('Failed to read file')
      reader.readAsText(file)
    },
    [onChange, onClassify, onFileNameChange],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const file = e.dataTransfer.files[0]
      if (file) handleFileRead(file)
    },
    [handleFileRead],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const clearFile = useCallback(() => {
    onFileNameChange(null)
    onChange('')
    setFileError(null)
    if (textareaRef.current) textareaRef.current.focus()
  }, [onChange, onFileNameChange])

  return (
    <div className="space-y-3">
      {/* Main Input Area */}
      <div
        className={clsx(
          'relative rounded-2xl border-2 border-dashed transition-all duration-200',
          isDragOver
            ? 'border-blue-400 bg-blue-50/50'
            : value
              ? 'border-zinc-300 bg-white'
              : 'border-zinc-200 bg-zinc-50/50 hover:border-zinc-300',
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Drag Overlay */}
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-blue-50/90 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center gap-2 text-blue-600">
                <DocumentArrowUpIcon className="h-10 w-10" />
                <span className="text-sm font-medium">Drop file here</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          className={clsx(
            'min-h-[160px] w-full resize-none rounded-2xl border-0 bg-transparent px-5 pb-12 pt-5 text-[15px] leading-relaxed text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-0',
            fileName && 'font-mono text-sm',
          )}
          placeholder="Paste anything — meeting notes, code, SQL, JSON, markdown, or just describe what you need..."
          value={value}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={6}
        />

        {/* Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-zinc-100 bg-zinc-50/80 px-4 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-200/60 hover:text-zinc-700"
            >
              <DocumentArrowUpIcon className="h-4 w-4" />
              Upload file
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS.join(',')}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileRead(file)
                e.target.value = ''
              }}
            />

            {/* File Name Badge */}
            {fileName && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 rounded-md bg-zinc-200/60 px-2 py-1 text-xs font-medium text-zinc-600"
              >
                {fileName}
                <button
                  onClick={clearFile}
                  className="rounded p-0.5 hover:bg-zinc-300/60"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </motion.span>
            )}
          </div>

          {/* Classifying Indicator */}
          {isClassifying && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 text-xs text-zinc-400"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              Analyzing...
            </motion.span>
          )}

          {/* Character Count */}
          {value.length > 0 && !isClassifying && (
            <span className="text-xs text-zinc-400">
              {value.length.toLocaleString()} chars
            </span>
          )}
        </div>
      </div>

      {/* File Error */}
      <AnimatePresence>
        {fileError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-red-600"
          >
            {fileError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Detection Chip */}
      <AnimatePresence>
        {classification && !isClassifying && (
          <DetectionChip
            classification={classification}
            onOverride={onOverride}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
