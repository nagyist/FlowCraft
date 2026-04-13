'use client'

import { useContext, useEffect, useState, use } from 'react'
import { DiagramContext } from '@/lib/Contexts/DiagramContext'
import { useRouter } from 'next/navigation'
import { sanitizeMermaid, sanitizeSVG } from '@/lib/utils'
import Link from 'next/link'
import { DiagramViewerShell } from '@/components/DiagramViewer'

const CanvasLoader = () => (
  <div className="flex h-screen w-full flex-col items-center justify-center bg-[#FAFAFA]">
    <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-gray-900" />
    <p className="mt-4 animate-pulse text-sm font-medium text-gray-400">
      Loading...
    </p>
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

  if (loading) return <CanvasLoader />

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#FAFAFA] text-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Diagram Not Found
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          The project you are looking for has been moved or deleted.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          Go to Dashboard
        </Link>
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
    />
  )
}
