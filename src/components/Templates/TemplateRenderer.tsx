'use client'

import dynamic from 'next/dynamic'
import { TEMPLATE_TYPE_BY_ID } from '@/lib/templates/types'

const MermaidViewer = dynamic(
  () => import('@/components/Templates/MermaidViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[480px] animate-pulse rounded-xl bg-slate-100" />
    ),
  },
)
const ReactFlowViewer = dynamic(
  () => import('@/components/Templates/ReactFlowViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[480px] animate-pulse rounded-xl bg-slate-100" />
    ),
  },
)
const ChartJsViewer = dynamic(
  () => import('@/components/Templates/ChartJsViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[480px] animate-pulse rounded-xl bg-slate-100" />
    ),
  },
)

export function TemplateRenderer({
  typeId,
  data,
}: {
  typeId: string
  data: any
}) {
  const t = TEMPLATE_TYPE_BY_ID[typeId]
  if (!t) return null

  if (t.renderer === 'mermaid') {
    const code = typeof data === 'string' ? data : data?.mermaid ?? ''
    return <MermaidViewer code={code} />
  }
  if (t.renderer === 'reactflow') {
    return (
      <ReactFlowViewer nodes={data?.nodes ?? []} edges={data?.edges ?? []} />
    )
  }
  if (t.renderer === 'chartjs') {
    return <ChartJsViewer config={data} />
  }
  return null
}
