'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-auth/server'
import { getTemplate } from '@/lib/templates/data'

/**
 * Clone a template into the logged-in user's diagrams table, then redirect
 * into the editor. Anonymous users are sent to sign-up with a `template`
 * query param so the post-signup hand-off can finish the clone.
 */
export async function useTemplate(formData: FormData) {
  const typeId = String(formData.get('type'))
  const topicSlug = String(formData.get('topic'))

  const tpl = await getTemplate(typeId, topicSlug)
  if (!tpl) redirect('/templates')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/sign-up?template=${tpl.id}`)
  }

  // The existing diagrams table stores `data` as a string (JSON-stringified
  // for non-mermaid types, raw mermaid for the rest). Match that convention.
  const dataField =
    typeof tpl.data === 'string' ? tpl.data : JSON.stringify(tpl.data)

  const { data, error } = await supabase
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
  if (error) throw error

  redirect(`/dashboard/diagrams/${data.id}`)
}
