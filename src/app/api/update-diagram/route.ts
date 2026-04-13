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

  const { diagramId, data } = await req.json()

  if (!diagramId || !data) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: diagramId and data' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const { error } = await supabase
    .from('diagrams')
    .update({ data })
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
