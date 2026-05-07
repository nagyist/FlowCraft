import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-auth/server'
import { authenticateRequest } from '@/lib/api-key-auth'

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

  // SSR session client — carries the user's JWT so RLS applies as the owner.
  // The matching SELECT and UPDATE policies on `diagrams` enforce ownership;
  // the explicit `.eq('user_id', …)` is belt-and-suspenders.
  const supabase = await createClient()

  const { data: existing, error: lookupError } = await supabase
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
    return new Response(
      JSON.stringify({ error: 'Diagram not owned by user' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const { data: updated, error } = await supabase
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
    // Reached only if the UPDATE RLS policy is missing — surface that
    // explicitly instead of pretending the row vanished.
    return new Response(
      JSON.stringify({
        error:
          'Update blocked by RLS. Ensure an UPDATE policy exists on public.diagrams allowing auth.uid() = user_id.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
