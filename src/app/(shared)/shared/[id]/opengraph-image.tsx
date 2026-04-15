import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'
import { createClient } from '@/lib/supabase-auth/server'

export const runtime = 'nodejs'
export const alt = 'Shared FlowCraft diagram'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OgImage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params

  let title = 'Shared diagram'
  let subtitle = 'Built with FlowCraft'

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('shareable_links')
      .select('title, type')
      .eq('id', id)
      .maybeSingle()

    if (data?.title) title = data.title
    if (data?.type) subtitle = `A ${data.type} built with FlowCraft`
  } catch {
    // fall through to defaults
  }

  return renderOgImage({ title, subtitle, accent: '#8B5CF6' })
}
