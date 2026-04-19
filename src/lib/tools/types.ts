import type { DiagramOrChartType } from '@/lib/utils'
import type { TempMermaidDiagramType } from '@/components/Mermaid/OverviewDialog.mermaid'

export type ToolDiagramType = DiagramOrChartType | TempMermaidDiagramType

export interface ToolPageFrontmatter {
  slug: string
  title: string
  h1?: string
  meta_description: string
  diagram_type: ToolDiagramType
  example_prompt: string
  example_svgs?: string[]
  keywords?: string[]
  related?: string[]
}

export interface ToolPage extends ToolPageFrontmatter {
  body: string
}
