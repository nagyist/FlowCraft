'use client'

import React, { useContext, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import mermaid from 'mermaid'

import { DiagramContext } from '@/lib/Contexts/DiagramContext'
import { OptionType, sanitizeMermaid, sanitizeSVG } from '@/lib/utils'
import { useLoading } from '@/lib/LoadingProvider'
import DiagramSelectionGrid from './DiagramSelectionGrid'
import FormStep from './FormStep'
import UpgradePrompt from '@/components/UpgradePrompt'
import PasteAnythingInput from './PasteAnythingInput'
import { useClassifyInput } from './useClassifyInput'
import { useStreamingGenerate } from './useStreamingGenerate'

function SectionLabel({
  code,
  kicker,
  children,
}: {
  code: string
  kicker: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
      <span>{code}</span>
      <span className="h-px w-12 bg-signal/50" />
      <span className="text-fog">{kicker}</span>
      {children && <span className="ml-auto">{children}</span>}
    </div>
  )
}

function UsageBadge({ usage }: { usage: any }) {
  if (!usage || usage.subscribed) return null
  const tone = usage.remaining <= 1 ? 'text-red-300' : 'text-fog'
  return (
    <div className="inline-flex items-center gap-2 rounded-sm border border-rule bg-graphite px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-paper">
      <span className="text-signal/80">Free tier</span>
      <span className="text-fog">·</span>
      <span className={tone}>{usage.remaining} left</span>
      {usage.remaining <= 2 && (
        <a
          href="/pricing"
          className="ml-1 text-signal underline decoration-signal/40 underline-offset-2 hover:decoration-signal"
        >
          Upgrade
        </a>
      )}
    </div>
  )
}

export default function NewDiagramPage() {
  const { showLoading, hideLoading } = useLoading()
  const context = useContext(DiagramContext)
  const router = useRouter()

  const svgContainerRef = useRef<HTMLDivElement>(null)
  const mermaidContainerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [selectedOption, _setSelectedOption] =
    useState<OptionType>('Infographic')
  const [visionDescription, setVisionDescription] = useState('')
  const [colorPalette, setColorPalette] = useState('Brand colors (default)')
  const [complexityLevel, setComplexityLevel] = useState('Medium (default)')
  const [isPublic, setIsPublic] = useState(true)

  const [pasteText, setPasteText] = useState('')
  const [pasteFileName, setPasteFileName] = useState<string | null>(null)
  const [inputMode, setInputMode] = useState<'paste' | 'manual'>('paste')
  const userOverrodeRef = useRef(false)
  const {
    classify,
    isClassifying,
    result: classification,
    reset: resetClassification,
  } = useClassifyInput()
  const streaming = useStreamingGenerate()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isGenerated, setIsGenerated] = useState(false)

  const [generatedTitle, setGeneratedTitle] = useState('')
  const [svgCode, setSvgCode] = useState('')
  const [mermaidCode, setMermaidCode] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [diagramId, setDiagramId] = useState<string | null>(null)

  const [zoomLevel, setZoomLevel] = useState(1)
  const [usageData, setUsageData] = useState<any>(null)
  const [linkCopied, setLinkCopied] = useState(false)

  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    fetch('/api/usage')
      .then((r) => {
        if (r.ok) return r.json().then(setUsageData)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
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
  }, [])

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

  useEffect(() => {
    if (
      classification?.suggestedDiagram &&
      inputMode === 'paste' &&
      !userOverrodeRef.current
    ) {
      _setSelectedOption(classification.suggestedDiagram)
    }
  }, [classification, inputMode])

  useEffect(() => {
    if (!pasteText.trim()) userOverrodeRef.current = false
  }, [pasteText])

  useEffect(() => {
    userOverrodeRef.current = false
  }, [inputMode])

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

  useEffect(() => {
    if (streaming.error) {
      setError(streaming.error)
      setIsLoading(false)
      hideLoading()
    }
  }, [streaming.error, hideLoading])

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
          document.getElementById('dmermaid-stream-preview')?.remove()
        }
      }
      tryRender()
    }

    return () => {
      document.getElementById('dmermaid-stream-preview')?.remove()
    }
  }, [streaming.partialCode, streaming.isStreaming])

  useEffect(() => {
    if (diagramId)
      window.history.pushState({ diagramId }, '', `/diagram/${diagramId}`)
  }, [diagramId])

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
    userOverrodeRef.current = true
    _setSelectedOption(type)
  }

  const handleGridSelect = (type: OptionType) => {
    userOverrodeRef.current = true
    _setSelectedOption(type)
  }

  const handleSubmit = async () => {
    const description =
      inputMode === 'paste' && pasteText.trim()
        ? pasteText.trim()
        : visionDescription.trim()

    if (!description) {
      setError('Describe your vision or paste some content.')
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
      setError('Free limit reached. Upgrade to continue.')
      return
    }

    try {
      showLoading('Drafting…', 'blue')
      setIsLoading(true)
      setError('')

      context.setChartJsData(null)
      context.setMermaidData('')
      context.setNodes([])
      context.setEdges([])

      const useStreaming =
        inputMode === 'paste' &&
        selectedOption !== 'Illustration' &&
        selectedOption !== 'Infographic'

      if (useStreaming) {
        streaming.generate({
          type: selectedOption as string,
          description,
          isPublic,
          colorPalette,
          complexityLevel,
        })
        return
      }

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

  if (isGenerated) {
    return (
      <main className="relative min-h-screen bg-ink pb-14 pt-14 text-paper">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-dot-grid bg-dot-24 opacity-40"
        />

        <div className="relative mx-auto w-full max-w-[1400px] px-6 lg:px-8">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-fog">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-paper">
                <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                Sheet · Rendered draft
              </span>
              <span>/</span>
              <span>{selectedOption}</span>
            </div>
            <button
              onClick={resetState}
              className="inline-flex items-center gap-2 rounded-sm border border-rule px-3 py-1.5 text-paper transition-colors hover:border-signal/50 hover:text-signal"
            >
              ↺ New draft
            </button>
          </header>

          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl leading-tight text-paper md:text-5xl">
                {generatedTitle || `Your ${selectedOption}`}
              </h1>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-fog">
                Drafted by AI · {complexityLevel}
              </p>
            </div>
          </div>

          <section className="relative h-[72vh] w-full">
            <div className="relative h-full w-full overflow-hidden rounded-sm border border-rule bg-graphite">
              <CornerTicks />
              {/* Toolbar */}
              <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-1 rounded-sm border border-rule bg-ink/80 p-1.5 backdrop-blur-md">
                <ToolBtn
                  label="−"
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.5))}
                  title="Zoom out"
                />
                <span className="w-14 px-2 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-fog">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <ToolBtn
                  label="+"
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 3))}
                  title="Zoom in"
                />
                <div className="mx-1 h-4 w-px bg-rule" />
                <button
                  onClick={copyLink}
                  className="rounded-sm px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-paper transition-colors hover:bg-graphite hover:text-signal"
                  title="Copy link"
                >
                  {linkCopied ? '✓ Copied' : '⇢ Link'}
                </button>
              </div>

              <div
                ref={containerRef}
                className="relative h-full w-full cursor-grab overflow-hidden bg-ink/50 active:cursor-grabbing"
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
                      className="h-auto max-h-[80vh] w-auto max-w-[80vw]"
                    />
                  )}
                  {mermaidCode && (
                    <div
                      ref={mermaidContainerRef}
                      className="rounded-sm bg-graphite p-8"
                    />
                  )}
                  {imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt="Result"
                      className="max-h-[90%] max-w-[90%] rounded-sm object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-ink pb-20 pt-14 text-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-dot-grid bg-dot-24 opacity-40"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-6 lg:px-8">
        {/* Sheet header */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-fog">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-paper">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-signal/60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-signal" />
              </span>
              Sheet · New draft
            </span>
            <span>/</span>
            <span>Drafting table</span>
          </div>
          <UsageBadge usage={usageData} />
        </div>

        {/* Heading */}
        <div className="mb-12 grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-signal">
              <span className="h-px w-12 bg-signal/50" />
              <span className="text-fog">Compose</span>
            </div>
            <h1 className="mt-6 font-serif text-5xl leading-[0.95] tracking-[-0.01em] text-paper md:text-6xl">
              Draft a new
              <br />
              <span className="italic text-signal">visual plan</span>
              <span className="text-paper">.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-paper/60">
              Paste notes, code, SQL, or docs — we'll detect what it is and
              suggest the best diagram. Or pick a type yourself.
            </p>
          </div>
        </div>

        {/* Upgrade prompt */}
        {usageData && !usageData.subscribed && usageData.diagrams_created >= 3 && (
          <div className="mb-8">
            <UpgradePrompt
              currentUsage={usageData.diagrams_created}
              limit={usageData.free_limit}
            />
          </div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 flex items-start gap-3 rounded-sm border border-red-500/30 bg-red-500/5 p-4"
            >
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-red-400" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-red-400">
                  Drafting failed
                </p>
                <p className="mt-1 text-sm text-paper/80">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streaming preview */}
        <AnimatePresence>
          {streaming.isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative mb-8 rounded-sm border border-signal/30 bg-graphite p-6"
            >
              <CornerTicks />
              <div className="flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-signal/60" />
                  <span className="relative h-2 w-2 rounded-full bg-signal" />
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
                  Drafting in progress
                </span>
                <button
                  type="button"
                  onClick={() => {
                    streaming.cancel()
                    setIsLoading(false)
                    hideLoading()
                  }}
                  className="ml-auto font-mono text-[10px] uppercase tracking-[0.22em] text-fog transition-colors hover:text-paper"
                >
                  ✕ Cancel
                </button>
              </div>
              <div className="mt-4 min-h-[220px] rounded-sm border border-rule bg-ink p-4">
                <div
                  ref={streamingContainerRef}
                  className="flex items-center justify-center"
                />
                {!lastRenderedRef.current && streaming.partialCode && (
                  <pre className="max-h-[300px] overflow-auto font-mono text-xs text-paper/60">
                    {streaming.partialCode}
                  </pre>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form card */}
        <div className="relative rounded-sm border border-rule bg-graphite p-6 md:p-10">
          <CornerTicks />

          <div className="space-y-10">
            {/* Paste anything */}
            <section className="space-y-4" id="paste-anything-input">
              <div className="flex items-center justify-between">
                <SectionLabel code="INP" kicker="Paste anything" />
                <button
                  type="button"
                  onClick={() =>
                    setInputMode(inputMode === 'paste' ? 'manual' : 'paste')
                  }
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-fog transition-colors hover:text-signal"
                >
                  Switch to {inputMode === 'paste' ? 'manual' : 'paste'} mode →
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
                    selectedOption={selectedOption}
                  />
                </motion.div>
              )}
            </section>

            {/* Separator */}
            <div className="flex items-center gap-4">
              <span className="h-px flex-1 bg-rule" />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-fog">
                {inputMode === 'paste'
                  ? 'or pick a type manually'
                  : 'select a diagram type'}
              </span>
              <span className="h-px flex-1 bg-rule" />
            </div>

            {/* Type selection */}
            <section className="space-y-5">
              <SectionLabel code="SPEC" kicker="What are we drafting?" />
              <DiagramSelectionGrid
                selectedOption={selectedOption}
                setSelectedOption={handleGridSelect}
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

            <div className="h-px w-full bg-rule" />

            {/* Configuration */}
            <section className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              <div className="space-y-5">
                <SectionLabel code="CFG" kicker="Configuration" />
                <FormStep isPublic={isPublic} setIsPublic={setIsPublic} />
              </div>
            </section>

            {/* Submit */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6">
              <p className="max-w-md font-mono text-[10px] uppercase tracking-[0.22em] text-fog">
                <span className="text-signal">▸</span> Ready to render ·{' '}
                <span className="text-paper">{selectedOption}</span>
              </p>
              <button
                onClick={handleSubmit}
                disabled={isLoading || streaming.isStreaming}
                className={clsx(
                  'group relative inline-flex items-center gap-3 overflow-hidden rounded-sm px-8 py-4 font-mono text-[12px] uppercase tracking-[0.22em] transition-colors',
                  isLoading || streaming.isStreaming
                    ? 'cursor-wait bg-signal/60 text-ink'
                    : 'bg-signal text-ink hover:bg-paper',
                )}
              >
                {isLoading || streaming.isStreaming ? (
                  <>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-ink" />
                    Drafting…
                  </>
                ) : (
                  <>
                    <span>Generate visual</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                      →
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function CornerTicks() {
  return (
    <>
      <span className="pointer-events-none absolute -left-px -top-px h-3 w-3 border-l border-t border-signal" />
      <span className="pointer-events-none absolute -right-px -top-px h-3 w-3 border-r border-t border-signal" />
      <span className="pointer-events-none absolute -bottom-px -left-px h-3 w-3 border-b border-l border-signal" />
      <span className="pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b border-r border-signal" />
    </>
  )
}

function ToolBtn({
  label,
  onClick,
  title,
}: {
  label: string
  onClick: () => void
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="rounded-sm px-2.5 py-1 font-mono text-sm text-paper transition-colors hover:bg-graphite hover:text-signal"
    >
      {label}
    </button>
  )
}
