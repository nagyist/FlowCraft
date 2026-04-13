'use client'

import React, { useContext, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import mermaid from 'mermaid'

// Icons
import {
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  LinkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

// Internal
import { DiagramContext } from '@/lib/Contexts/DiagramContext'
import {
  InputClassification,
  OptionType,
  sanitizeMermaid,
  sanitizeSVG,
} from '@/lib/utils'
import { useLoading } from '@/lib/LoadingProvider'
import DiagramSelectionGrid from './DiagramSelectionGrid'
import FormStep from './FormStep'
import UpgradePrompt from '@/components/UpgradePrompt'
import PasteAnythingInput from './PasteAnythingInput'
import { useClassifyInput } from './useClassifyInput'
import { useStreamingGenerate } from './useStreamingGenerate'

// --- UI Components (Apple Style) ---

const Card = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={clsx(
      'overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm',
      className,
    )}
  >
    {children}
  </div>
)

const Button = ({
  children,
  onClick,
  variant = 'primary',
  disabled,
  className,
  type = 'button',
}: any) => {
  const base =
    'inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary:
      'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 focus:ring-zinc-200',
    ghost: 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        base,
        variants[variant as keyof typeof variants],
        className,
      )}
    >
      {children}
    </button>
  )
}

const IconButton = ({ icon: Icon, onClick, title }: any) => (
  <button
    onClick={onClick}
    title={title}
    className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 active:scale-95"
  >
    <Icon className="h-5 w-5" />
  </button>
)

const UsageBadge = ({ usage }: { usage: any }) => {
  if (!usage || usage.subscribed) return null
  return (
    <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
      <span>Free Plan</span>
      <span className="h-1 w-1 rounded-full bg-zinc-300" />
      <span
        className={clsx(
          usage.remaining <= 1 ? 'text-amber-600' : 'text-zinc-600',
        )}
      >
        {usage.remaining} left this month
      </span>
      {usage.remaining <= 2 && (
        <a href="/pricing" className="ml-1 text-blue-600 hover:underline">
          Upgrade
        </a>
      )}
    </div>
  )
}

// --- Main Page Component ---

export default function NewDiagramPage() {
  const { showLoading, hideLoading } = useLoading()
  const context = useContext(DiagramContext)
  const router = useRouter()

  // Refs
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const mermaidContainerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // State
  const [selectedOption, _setSelectedOption] =
    useState<OptionType>('Infographic')
  const [visionDescription, setVisionDescription] = useState('')
  const [colorPalette, setColorPalette] = useState('Brand colors (default)')
  const [complexityLevel, setComplexityLevel] = useState('Medium (default)')
  const [isPublic, setIsPublic] = useState(true)

  // Paste Anything state
  const [pasteText, setPasteText] = useState('')
  const [pasteFileName, setPasteFileName] = useState<string | null>(null)
  const [inputMode, setInputMode] = useState<'paste' | 'manual'>('paste')
  const {
    classify,
    isClassifying,
    result: classification,
    reset: resetClassification,
  } = useClassifyInput()
  const streaming = useStreamingGenerate()

  // Generation State
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isGenerated, setIsGenerated] = useState(false)

  // Output State
  const [generatedTitle, setGeneratedTitle] = useState('')
  const [svgCode, setSvgCode] = useState('')
  const [mermaidCode, setMermaidCode] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [diagramId, setDiagramId] = useState<string | null>(null)

  // Viewport State
  const [zoomLevel, setZoomLevel] = useState(1)
  const [usageData, setUsageData] = useState<any>(null)
  const [linkCopied, setLinkCopied] = useState(false)

  // Dragging State
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // --- Effects ---

  // Usage Data
  useEffect(() => {
    fetch('/api/usage')
      .then((r) => {
        if (r.ok) {
          return r.json().then(setUsageData)
        }
      })
      .catch(console.error)
  }, [])

  // Mermaid Init
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      securityLevel: 'loose',
    })
  }, [])

  // Mermaid Rendering
  useEffect(() => {
    if (mermaidCode && mermaidContainerRef.current) {
      mermaidContainerRef.current.innerHTML = ''
      mermaid
        .render('mermaid-diagram', mermaidCode)
        .then(({ svg }) => {
          if (mermaidContainerRef.current)
            mermaidContainerRef.current.innerHTML = svg
          document.getElementById('dmermaid-diagram')?.remove()
        })
        .catch(() => {
          document.getElementById('dmermaid-diagram')?.remove()
          setError('Failed to render chart.')
        })
    }
  }, [mermaidCode, zoomLevel])

  // Auto-select diagram type when classification comes in
  useEffect(() => {
    if (classification?.suggestedDiagram && inputMode === 'paste') {
      _setSelectedOption(classification.suggestedDiagram)
    }
  }, [classification, inputMode])

  // Handle streaming completion
  useEffect(() => {
    if (streaming.finalResult) {
      const { code, title, diagramId: streamDiagramId } = streaming.finalResult
      const sanitized = sanitizeMermaid(code)
      setMermaidCode(sanitized)
      if (title) setGeneratedTitle(title)
      setDiagramId(streamDiagramId)
      setIsGenerated(true)
      setIsLoading(false)
      hideLoading()
    }
  }, [streaming.finalResult, hideLoading])

  // Handle streaming errors
  useEffect(() => {
    if (streaming.error) {
      setError(streaming.error)
      setIsLoading(false)
      hideLoading()
    }
  }, [streaming.error, hideLoading])

  // Incremental mermaid rendering during streaming
  const lastRenderedRef = useRef('')
  const streamingContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (
      streaming.isStreaming &&
      streaming.partialCode &&
      streaming.partialCode !== lastRenderedRef.current &&
      streamingContainerRef.current
    ) {
      const tryRender = async () => {
        try {
          const { svg } = await mermaid.render(
            'mermaid-stream-preview',
            streaming.partialCode,
          )
          if (streamingContainerRef.current) {
            streamingContainerRef.current.innerHTML = svg
            lastRenderedRef.current = streaming.partialCode
          }
          document.getElementById('dmermaid-stream-preview')?.remove()
        } catch {
          // Partial code not yet valid — ignore
          document.getElementById('dmermaid-stream-preview')?.remove()
        }
      }
      tryRender()
    }

    return () => {
      document.getElementById('dmermaid-stream-preview')?.remove()
    }
  }, [streaming.partialCode, streaming.isStreaming])

  // URL Sync
  useEffect(() => {
    if (diagramId)
      window.history.pushState({ diagramId }, '', `/diagram/${diagramId}`)
  }, [diagramId])

  // Drag Logic
  useEffect(() => {
    if (!containerRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }

    const handleMouseUp = () => setIsDragging(false)

    const container = containerRef.current
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('mouseleave', handleMouseUp)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('mouseleave', handleMouseUp)
    }
  }, [isDragging, dragStart])

  useEffect(() => {
    setPosition({ x: 0, y: 0 })
  }, [zoomLevel])

  // --- Handlers ---

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const resetState = () => {
    setIsGenerated(false)
    setVisionDescription('')
    setSvgCode('')
    setMermaidCode('')
    setDiagramId(null)
    setImageUrl('')
    setZoomLevel(1)
    setPosition({ x: 0, y: 0 })
    setPasteText('')
    setPasteFileName(null)
    setInputMode('paste')
    resetClassification()
    streaming.reset()
    lastRenderedRef.current = ''
    window.history.pushState({}, '', '/dashboard/diagrams/new')
  }

  const handleClassificationOverride = (type: OptionType) => {
    _setSelectedOption(type)
  }

  const handleSubmit = async () => {
    // Determine which description to use
    const description =
      inputMode === 'paste' && pasteText.trim()
        ? pasteText.trim()
        : visionDescription.trim()

    if (!description) {
      setError('Please describe your vision or paste some content.')
      if (inputMode === 'paste') {
        document
          .getElementById('paste-anything-input')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        document
          .getElementById('vision-description')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    if (usageData && !usageData.can_create) {
      setError(`Free limit reached. Upgrade to continue.`)
      return
    }

    try {
      showLoading('Designing...', 'blue')
      setIsLoading(true)
      setError('')

      // Clear context
      context.setChartJsData(null)
      context.setMermaidData('')
      context.setNodes([])
      context.setEdges([])

      // Use streaming for paste mode with standard diagram types (not Illustration/Infographic)
      const useStreaming =
        inputMode === 'paste' &&
        selectedOption !== 'Illustration' &&
        selectedOption !== 'Infographic'

      if (useStreaming) {
        // Streaming path — the useStreamingGenerate hook handles everything
        // Completion is handled by the useEffect watching streaming.finalResult
        streaming.generate({
          type: selectedOption as string,
          description,
          isPublic,
          colorPalette,
          complexityLevel,
        })
        return
      }

      // Non-streaming path (original behavior)
      const response = await fetch('/api/generate-visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedOption,
          description,
          isPublic,
          colorPalette,
          complexityLevel,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) return router.push('/login')
        const err = await response.json()
        throw new Error(err.detail || 'Generation failed')
      }

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      // Handle Data Types
      if (selectedOption === 'Illustration') {
        setImageUrl(data.image_url)
      } else if (selectedOption === 'Infographic') {
        setSvgCode(sanitizeSVG(data.code).svgContent)
      } else {
        setMermaidCode(sanitizeMermaid(data.code))
      }

      if (data.title) setGeneratedTitle(data.title)
      setDiagramId(data.diagram_id)
      setIsGenerated(true)
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
      hideLoading()
    }
  }

  // --- Views ---

  if (isGenerated) {
    return (
      <main className="min-h-screen w-full bg-zinc-50 px-6 pb-10 pt-20">
        {/* Expanded width for Generated View as well */}
        <header className="mx-auto mb-6 flex w-full max-w-7xl flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {generatedTitle || `Your ${selectedOption}`}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Generated by AI • {complexityLevel}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={resetState}
              className="!px-4 !py-2"
            >
              <ArrowPathIcon className="mr-2 h-4 w-4" />
              New
            </Button>
          </div>
        </header>

        <section className="relative mx-auto h-[75vh] w-full max-w-7xl">
          <Card className="relative flex h-full w-full flex-col">
            {/* Toolbar */}
            <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-zinc-200 bg-white/80 p-1.5 shadow-sm backdrop-blur-md">
              <IconButton
                icon={MagnifyingGlassMinusIcon}
                onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.5))}
                title="Zoom Out"
              />
              <span className="w-12 px-2 text-center text-xs font-medium text-zinc-500">
                {Math.round(zoomLevel * 100)}%
              </span>
              <IconButton
                icon={MagnifyingGlassPlusIcon}
                onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 3))}
                title="Zoom In"
              />
              <div className="mx-1 h-4 w-px bg-zinc-200" />
              <IconButton
                icon={linkCopied ? CheckCircleIcon : LinkIcon}
                onClick={copyLink}
                title="Copy Link"
              />
            </div>

            {/* Canvas */}
            <div
              ref={containerRef}
              className="relative flex-1 cursor-grab overflow-hidden bg-zinc-50/50 active:cursor-grabbing"
            >
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                  transition: isDragging
                    ? 'none'
                    : 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)',
                  willChange: 'transform',
                  transformOrigin: 'center',
                  pointerEvents: 'auto',
                }}
                onMouseDown={handleMouseDown}
              >
                {svgCode && (
                  <div
                    ref={svgContainerRef}
                    dangerouslySetInnerHTML={{ __html: svgCode }}
                    className="h-auto max-h-[80vh] w-auto max-w-[80vw] shadow-sm"
                  />
                )}
                {mermaidCode && (
                  <div
                    ref={mermaidContainerRef}
                    className="rounded-lg bg-white p-8 shadow-sm"
                  />
                )}
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Result"
                    className="max-h-[90%] max-w-[90%] rounded-lg object-contain shadow-sm"
                  />
                )}
              </div>
            </div>
          </Card>
        </section>
      </main>
    )
  }

  // --- Creation Mode ---
  return (
    <main className="min-h-screen w-full bg-zinc-50 px-6 pb-20 pt-24 lg:px-12">
      {/* Changed max-w-3xl to max-w-7xl to fill the page */}
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Create a Visual Plan
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-500">
              Paste meeting notes, code, SQL, or any content — we&apos;ll detect
              what it is and suggest the best diagram for it.
            </p>
          </div>
          <UsageBadge usage={usageData} />
        </header>

        {/* Upgrade Prompt */}
        {usageData && !usageData.subscribed && usageData.diagrams_created >= 3 && (
          <div className="mb-6">
            <UpgradePrompt
              currentUsage={usageData.diagrams_created}
              limit={usageData.free_limit}
            />
          </div>
        )}

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4"
            >
              <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 text-red-600" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Creation Failed</p>
                <p>{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streaming Preview */}
        <AnimatePresence>
          {streaming.isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="mb-6 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  <span className="text-sm font-medium text-zinc-700">
                    Building your diagram...
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      streaming.cancel()
                      setIsLoading(false)
                      hideLoading()
                    }}
                    className="ml-auto !px-3 !py-1 !text-xs"
                  >
                    Cancel
                  </Button>
                </div>

                {/* Incremental Mermaid Preview */}
                <div className="min-h-[200px] rounded-xl bg-zinc-50 p-4">
                  <div
                    ref={streamingContainerRef}
                    className="flex items-center justify-center"
                  />
                  {!lastRenderedRef.current && streaming.partialCode && (
                    <pre className="max-h-[300px] overflow-auto font-mono text-xs text-zinc-500">
                      {streaming.partialCode}
                    </pre>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Container - Full Width Card */}
        <Card className="min-h-[60vh] p-6 md:p-10">
          <div className="space-y-8">
            {/* 0. Paste Anything Input */}
            <section className="space-y-4" id="paste-anything-input">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-zinc-900">
                  Paste anything to get started
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setInputMode(inputMode === 'paste' ? 'manual' : 'paste')
                  }
                  className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700"
                >
                  {inputMode === 'paste'
                    ? 'Switch to manual mode'
                    : 'Switch to paste mode'}
                </button>
              </div>

              {inputMode === 'paste' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <PasteAnythingInput
                    value={pasteText}
                    onChange={setPasteText}
                    onClassify={classify}
                    classification={classification}
                    isClassifying={isClassifying}
                    onOverride={handleClassificationOverride}
                    fileName={pasteFileName}
                    onFileNameChange={setPasteFileName}
                  />
                </motion.div>
              )}
            </section>

            {/* Separator */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-100" />
              <span className="text-xs font-medium text-zinc-400">
                {inputMode === 'paste'
                  ? 'or choose a type manually'
                  : 'select a diagram type'}
              </span>
              <div className="h-px flex-1 bg-zinc-100" />
            </div>

            {/* 1. Type Selection */}
            <section className="space-y-4">
              <label className="block text-sm font-semibold text-zinc-900">
                What are we building?
              </label>
              <DiagramSelectionGrid
                setSelectedOption={_setSelectedOption}
                setVisionDescription={setVisionDescription}
                setColorPalette={setColorPalette}
                setComplexityLevel={setComplexityLevel}
                highlightedType={
                  inputMode === 'paste' && classification
                    ? classification.suggestedDiagram
                    : undefined
                }
                hideTextarea={inputMode === 'paste'}
              />
            </section>

            <div className="h-px w-full bg-zinc-100" />

            {/* 2. Details & Privacy */}
            <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-zinc-900">
                  Configuration
                </label>
                <FormStep isPublic={isPublic} setIsPublic={setIsPublic} />
              </div>
            </section>

            {/* 3. Action */}
            <div className="flex justify-end border-t border-zinc-100 pt-6">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || streaming.isStreaming}
                className="w-full min-w-[200px] !py-3 !text-base md:w-auto"
              >
                {isLoading || streaming.isStreaming ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5" />
                    Generate Visualization
                  </span>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
