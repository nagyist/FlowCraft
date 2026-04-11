import { createClient } from '@/lib/supabase-auth/server'

export async function POST(req: Request) {
  try {
    const supabaseClient = await createClient()

    const {
      data: { session },
      error: sessionError,
    } = await supabaseClient.auth.getSession()

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'content-type': 'application/json' } },
      )
    }

    const body = await req.json()
    const { content, filename } = body

    if (!content || content.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Content too short for classification' }),
        { status: 400, headers: { 'content-type': 'application/json' } },
      )
    }

    const API_URL = process.env.NEXT_PUBLIC_FLOWCRAFT_API

    const res = await fetch(`${API_URL}/v2/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        content: content.slice(0, 100_000),
        filename: filename || null,
      }),
    })

    if (!res.ok) {
      const errorData = await res.text()
      return new Response(errorData, {
        status: res.status,
        headers: { 'content-type': 'application/json' },
      })
    }

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: { 'content-type': 'application/json' },
    })
  } catch (error) {
    console.error('Error classifying input:', error)
    return new Response(
      JSON.stringify({
        input_type: 'plain_text',
        suggested_diagram: 'Flowchart',
        confidence: 0.3,
        reasoning: 'Classification failed; defaulting to flowchart',
      }),
      { headers: { 'content-type': 'application/json' } },
    )
  }
}
