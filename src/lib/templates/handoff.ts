import { createClient } from '@/lib/supabase-auth/server'

/**
 * After signup, if `?template=<id>` was present, clone that template into
 * the new user's diagrams table and return the new diagram id.
 *
 * Returns null if there's no template id, no authenticated user, the
 * template can't be loaded, or the insert fails — callers should fall back
 * to a generic dashboard redirect in that case.
 */
export async function handleSignupTemplate(
  templateId: string | null,
): Promise<string | null> {
  if (!templateId) return null
  try {
    const sb = await createClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return null

    const { data: tpl } = await sb
      .from('diagram_templates')
      .select('type,topic_title,description,data')
      .eq('id', templateId)
      .eq('hidden', false)
      .maybeSingle()
    if (!tpl) return null

    const dataField =
      typeof tpl.data === 'string' ? tpl.data : JSON.stringify(tpl.data)

    const { data: inserted } = await sb
      .from('diagrams')
      .insert([
        {
          user_id: user.id,
          type: tpl.type,
          title: tpl.topic_title,
          description: tpl.description,
          data: dataField,
          private: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select('id')
      .single()
    return inserted?.id ?? null
  } catch {
    return null
  }
}
