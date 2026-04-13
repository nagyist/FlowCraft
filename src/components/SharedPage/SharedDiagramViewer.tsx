'use client'

import { useMemo } from 'react'
import { sanitizeMermaid, sanitizeSVG } from '@/lib/utils'
import { DiagramViewerShell } from '@/components/DiagramViewer'

interface SharedDiagramViewerProps {
  type: string
  data: string
  title: string
  createdAt?: string
}

export default function SharedDiagramViewer({
  type,
  data,
  title,
  createdAt,
}: SharedDiagramViewerProps) {
  const diagramData = useMemo(() => {
    const result: {
      mermaidCode?: string | null
      svgCode?: string | null
      imageUrl?: string | null
      flowDiagramData?: { nodes: any[]; edges: any[] } | null
      chartJsData?: any | null
    } = {}

    try {
      if (['illustration', 'generated_image'].includes(type)) {
        result.imageUrl = data
      } else if (type === 'infographic') {
        result.svgCode = sanitizeSVG(data).svgContent
      } else if (type.toLowerCase() === 'flow diagram') {
        const parsed = JSON.parse(data)
        // Handle double-stringified data
        const flowData = typeof parsed === 'string' ? JSON.parse(parsed) : parsed
        result.flowDiagramData = {
          nodes: flowData.nodes,
          edges: flowData.edges,
        }
      } else if (type === 'Chart') {
        result.chartJsData = JSON.parse(data)
      } else {
        // Mermaid diagrams (all other types)
        result.mermaidCode = sanitizeMermaid(data)
      }
    } catch (err) {
      console.error('Error parsing diagram data:', err)
      // Fallback: try as mermaid
      try {
        result.mermaidCode = sanitizeMermaid(data)
      } catch {
        // Data couldn't be parsed at all
      }
    }

    return result
  }, [type, data])

  return (
    <DiagramViewerShell
      mode="viewer"
      title={title}
      type={type}
      createdAt={createdAt}
      mermaidCode={diagramData.mermaidCode}
      svgCode={diagramData.svgCode}
      imageUrl={diagramData.imageUrl}
      flowDiagramData={diagramData.flowDiagramData}
      chartJsData={diagramData.chartJsData}
    />
  )
}
