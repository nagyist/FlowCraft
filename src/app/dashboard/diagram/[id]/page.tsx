'use client'

import { useContext, useEffect, useState, use } from 'react'
import { DiagramContext } from '@/lib/Contexts/DiagramContext'
import { useRouter } from 'next/navigation'
import { sanitizeMermaid, sanitizeSVG } from '@/lib/utils'
import Link from 'next/link'
import { DiagramViewerShell } from '@/components/DiagramViewer'

const CanvasLoader = () => (
  <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-ink text-paper">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-dot-grid bg-dot-24 opacity-50"
    />
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal/[0.06] blur-[120px]"
    />
    <div className="relative flex flex-col items-center">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-signal">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-signal/60" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-signal" />
        </span>
        Sheet · Loading
      </div>
      <p className="mt-5 font-serif text-4xl italic text-paper/80">
        Drafting canvas<span className="animate-pulse text-signal">.</span>
      </p>
      <div className="mt-6 h-px w-40 overflow-hidden bg-rule">
        <div className="h-full w-1/3 animate-scan bg-signal" />
      </div>
    </div>
  </div>
)

export default function DiagramPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const diagramContext = useContext(DiagramContext)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retrying, setRetrying] = useState(false)

  // Diagram data
  const [imageUrl, setImageUrl] = useState('')
  const [svgCode, setSvgCode] = useState('')
  const [mermaidCode, setMermaidCode] = useState<string | null>(null)
  const [chartJsData, setChartJsData] = useState<any>(null)
  const [flowData, setFlowData] = useState<{
    nodes: any[]
    edges: any[]
  } | null>(null)
  const [diagramMeta, setDiagramMeta] = useState<{
    title: string
    type: string
    description?: string
    createdAt?: string
  } | null>(null)

  useEffect(() => {
    const fetchDiagram = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/get-diagrams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })

        const { diagram } = await response.json()

        if (!diagram || diagram.length === 0) {
          setError(true)
          return
        }

        const data = diagram[0]
        setDiagramMeta({
          title: data.title,
          type: data.type,
          description: data.description,
          createdAt: data.created_at,
        })

        // Context sync
        diagramContext.setTitle(data.title)
        diagramContext.setDiagramId(id)
        diagramContext.setType(data.type)

        // Type-specific handling
        if (['illustration', 'generated_image'].includes(data.type)) {
          setImageUrl(
            data.type === 'illustration' ? data.image_url : data.data,
          )
        } else if (data.type === 'infographic') {
          setSvgCode(sanitizeSVG(data.data).svgContent)
        } else if (data.type.toLowerCase() === 'flow diagram') {
          const parsedData = JSON.parse(JSON.parse(data.data))
          setFlowData({ nodes: parsedData.nodes, edges: parsedData.edges })
          diagramContext.setEdges(parsedData.edges)
          diagramContext.setNodes(parsedData.nodes)
        } else if (data.type === 'Chart') {
          setChartJsData(JSON.parse(data.data))
        } else {
          setMermaidCode(sanitizeMermaid(data.data))
        }
      } catch (err) {
        console.error(err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchDiagram()
  }, [id])

  const handleRetry = async () => {
    if (retrying) return
    setRetrying(true)
    try {
      const res = await fetch('/api/regenerate-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagramId: id }),
      })
      if (!res.ok) {
        console.error('Retry failed', await res.json().catch(() => null))
        return
      }
      const { result } = await res.json()
      if (result) {
        setMermaidCode(sanitizeMermaid(result))
      }
    } catch (err) {
      console.error('Retry error', err)
    } finally {
      setRetrying(false)
    }
  }

  if (loading) return <CanvasLoader />

  if (error) {
    return (
      <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center text-paper">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-dot-grid bg-dot-24 opacity-50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal/[0.04] blur-[120px]"
        />
        <div className="relative flex max-w-md flex-col items-center">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-signal">
            <span className="h-px w-10 bg-signal/50" />
            Draft · 404
          </div>
          <h2 className="mt-6 font-serif text-5xl leading-[0.95] tracking-[-0.01em] text-paper">
            <span className="text-paper/70">This sheet has</span>{' '}
            <span className="italic text-signal">gone missing</span>
            <span className="text-paper/70">.</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-paper/60">
            The draft you're looking for has been moved, deleted, or never
            existed in this workspace.
          </p>
          <Link
            href="/dashboard"
            className="group mt-8 inline-flex items-center gap-3 rounded-sm bg-signal px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-paper"
          >
            ← Back to dashboard
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <DiagramViewerShell
      mode="owner"
      onBack={() => router.push('/dashboard')}
      title={diagramMeta?.title || 'Untitled'}
      type={diagramMeta?.type || ''}
      description={diagramMeta?.description}
      createdAt={diagramMeta?.createdAt}
      mermaidCode={mermaidCode}
      svgCode={svgCode || undefined}
      imageUrl={imageUrl || undefined}
      flowDiagramData={flowData}
      chartJsData={chartJsData}
      diagramId={id}
      onRetry={handleRetry}
      retrying={retrying}
    />
  )
}
