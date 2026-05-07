import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/api-key-auth'

// Service-role client. RLS on `diagrams` exposes SELECT to owners but no
// UPDATE policy exists, so a user-session client silently updates 0 rows.
// `authenticateRequest` + `eq('user_id', ...)` below preserve ownership.
function adminClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_PRIVATE_KEY
  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_PRIVATE_KEY env for update-diagram',
    )
  }
  return createAdminClient(url, key, { auth: { persistSession: false } })
}

export async function PATCH(req: NextRequest) {
  const authResult = await authenticateRequest(req)
  if (!authResult.authenticated || !authResult.userId) {
    return new Response(
      JSON.stringify({ error: authResult.error || 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const { diagramId, data, is_public, finalized } = await req.json()

  if (!diagramId) {
    return new Response(
      JSON.stringify({ error: 'Missing required field: diagramId' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const patch: Record<string, unknown> = {}
  if (data !== undefined) patch.data = data
  if (typeof is_public === 'boolean') patch.private = !is_public
  if (typeof finalized === 'boolean') patch.finalized = finalized

  if (Object.keys(patch).length === 0) {
    return new Response(
      JSON.stringify({ error: 'No fields to update' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const { data: updated, error } = await adminClient()
    .from('diagrams')
    .update(patch)
    .eq('id', diagramId)
    .eq('user_id', authResult.userId)
    .select('id')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!updated || updated.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Diagram not found or not owned by user' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    )
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
