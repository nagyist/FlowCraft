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

  const admin = adminClient()

  // Look the row up first so we can return precise errors and avoid the
  // silent zero-row update path. The previous combined `.eq('id').eq('user_id')`
  // update masked ownership mismatches as 404s.
  const { data: existing, error: lookupError } = await admin
    .from('diagrams')
    .select('id, user_id')
    .eq('id', diagramId)
    .maybeSingle()

  if (lookupError) {
    return new Response(JSON.stringify({ error: lookupError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!existing) {
    return new Response(
      JSON.stringify({ error: 'Diagram not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    )
  }

  if (existing.user_id !== authResult.userId) {
    console.warn(
      `[update-diagram] ownership mismatch: diagram ${diagramId} owned by ${existing.user_id}, requester ${authResult.userId}`,
    )
    return new Response(
      JSON.stringify({ error: 'Diagram not owned by user' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const { error } = await admin
    .from('diagrams')
    .update(patch)
    .eq('id', diagramId)

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
