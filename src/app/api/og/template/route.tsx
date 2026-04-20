import { ImageResponse } from 'next/og'
import { getTemplate } from '@/lib/templates/data'
import { TEMPLATE_TYPE_BY_ID } from '@/lib/templates/types'

// Use Node runtime so we can reach Supabase via @supabase/supabase-js.
export const runtime = 'nodejs'
export const revalidate = 86400

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const typeId = searchParams.get('type') ?? ''
  const topic = searchParams.get('topic') ?? ''
  const t = TEMPLATE_TYPE_BY_ID[typeId]

  let title = 'FlowCraft Template'
  let subtitle = t?.title ?? 'Diagram Template'
  try {
    const row = typeId && topic ? await getTemplate(typeId, topic) : null
    if (row) title = row.topic_title
  } catch {
    // ignore — render fallback OG card
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 60%)',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: '#0f172a',
              borderRadius: 6,
            }}
          />
          <div style={{ fontSize: 22, color: '#0f172a', fontWeight: 600 }}>
            FlowCraft
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 28, color: '#4f46e5', fontWeight: 600 }}>
            {subtitle}
          </div>
          <div
            style={{
              fontSize: 64,
              color: '#0f172a',
              fontWeight: 700,
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ fontSize: 22, color: '#64748b' }}>
          flowcraft.app/templates
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
