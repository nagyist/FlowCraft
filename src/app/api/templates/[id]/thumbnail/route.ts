import { NextResponse } from 'next/server'
import { getTemplateThumbnail } from '@/lib/templates/data'

const PLACEHOLDER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#eef2ff"/><stop offset="100%" stop-color="#f8fafc"/></linearGradient></defs><rect width="400" height="240" fill="url(#g)"/></svg>`

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  if (!id) return new NextResponse('Missing id', { status: 400 })

  try {
    const svg = (await getTemplateThumbnail(id)) ?? PLACEHOLDER
    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control':
          'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch {
    return new NextResponse(PLACEHOLDER, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
      },
    })
  }
}
