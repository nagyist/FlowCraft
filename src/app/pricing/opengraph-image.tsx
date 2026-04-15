import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'edge'
export const alt = 'FlowCraft pricing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function OgImage() {
  return renderOgImage({
    title: 'Simple, transparent pricing',
    subtitle: 'Start free. Upgrade when you need more diagrams.',
    accent: '#10B981',
  })
}
