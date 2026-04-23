import { createClient } from '@/lib/supabase-auth/server'
import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/api-key-auth'

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()

  const authResult = await authenticateRequest(req)
  if (!authResult.authenticated || !authResult.userId) {
    return new Response(
      JSON.stringify({ error: authResult.error || 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const { diagramId, data, is_public } = await req.json()

  if (!diagramId) {
    return new Response(
      JSON.stringify({ error: 'Missing required field: diagramId' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const patch: Record<string, unknown> = {}
  if (data !== undefined) patch.data = data
  if (typeof is_public === 'boolean') patch.private = !is_public

  if (Object.keys(patch).length === 0) {
    return new Response(
      JSON.stringify({ error: 'No fields to update' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const { error } = await supabase
    .from('diagrams')
    .update(patch)
    .eq('id', diagramId)
    .eq('user_id', authResult.userId)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
