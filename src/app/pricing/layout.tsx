import { buildMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = buildMetadata({
  title: 'Pricing | FlowCraft',
  description:
    'Simple, transparent pricing for FlowCraft. Generate flowcharts, sequence diagrams, mind maps, and more with AI. Free tier available.',
  path: '/pricing',
  keywords: ['flowcraft pricing', 'diagram tool pricing', 'ai diagram subscription'],
})

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
