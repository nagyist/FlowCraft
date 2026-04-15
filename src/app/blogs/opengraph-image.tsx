import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'edge'
export const alt = 'FlowCraft blog'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function OgImage() {
  return renderOgImage({
    title: 'The FlowCraft Blog',
    subtitle: 'Insights, tutorials, and product updates.',
    accent: '#F59E0B',
  })
}
