import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

type OgTemplateProps = {
  title: string
  subtitle?: string
  accent?: string
}

export function renderOgImage({
  title,
  subtitle,
  accent = '#6366F1',
}: OgTemplateProps) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background:
            'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            F
          </div>
          <div style={{ color: 'white', fontSize: 32, fontWeight: 600 }}>
            FlowCraft
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              color: 'white',
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                color: '#94A3B8',
                fontSize: 30,
                lineHeight: 1.3,
                maxWidth: 1000,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ color: '#64748B', fontSize: 24 }}>flowcraft.app</div>
          <div
            style={{
              color: 'white',
              fontSize: 22,
              padding: '12px 24px',
              borderRadius: 999,
              background: accent,
            }}
          >
            AI-powered diagrams
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  )
}
