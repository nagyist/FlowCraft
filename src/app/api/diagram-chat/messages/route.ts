import { createClient } from '@/lib/supabase-auth/server'
import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/api-key-auth'

export async function GET(req: NextRequest) {
  const supabase = await createClient()

  const authResult = await authenticateRequest(req)
  if (!authResult.authenticated || !authResult.userId) {
    return new Response(
      JSON.stringify({ error: authResult.error || 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const diagramId = req.nextUrl.searchParams.get('diagramId')
  if (!diagramId) {
    return new Response(JSON.stringify({ error: 'diagramId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { data, error } = await supabase
    .from('diagram_chat_messages')
    .select('id, role, content, code_snapshot, created_at')
    .eq('diagram_id', diagramId)
    .eq('user_id', authResult.userId)
    .order('created_at', { ascending: true })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ messages: data ?? [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const authResult = await authenticateRequest(req)
  if (!authResult.authenticated || !authResult.userId) {
    return new Response(
      JSON.stringify({ error: authResult.error || 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const body = await req.json()
  const { diagramId, messages } = body as {
    diagramId: number | string
    messages: Array<{
      role: 'user' | 'assistant' | 'system'
      content: string
      code_snapshot?: string | null
    }>
  }

  if (!diagramId || !Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: 'diagramId and messages[] are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const rows = messages.map((m) => ({
    diagram_id: diagramId,
    user_id: authResult.userId,
    role: m.role,
    content: m.content,
    code_snapshot: m.code_snapshot ?? null,
  }))

  const { data, error } = await supabase
    .from('diagram_chat_messages')
    .insert(rows)
    .select('id, role, content, code_snapshot, created_at')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ messages: data ?? [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
