/**
 * Bridge route for the VS Code extension OAuth flow.
 *
 * Sets a short-lived cookie marking this OAuth attempt as VS Code-initiated,
 * then kicks off the existing Supabase OAuth flow for the chosen provider.
 * /auth/confirm reads the cookie after the callback and redirects to the
 * vscode:// URI handler with the session tokens.
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { createClient } from '@/lib/supabase-auth/server'

export const dynamic = 'force-dynamic'

const ALLOWED_PROVIDERS = new Set(['google', 'github'])

const getConfirmURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ??
    process?.env?.NEXT_PUBLIC_VERCEL_URL ??
    'http://localhost:3000'
  url = url.includes('http') ? url : `https://${url}`
  url = url.endsWith('/') ? url : `${url}/`
  return `${url}auth/confirm`
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const provider = searchParams.get('provider')
  const state = searchParams.get('state')

  if (!provider || !ALLOWED_PROVIDERS.has(provider)) {
    return NextResponse.json(
      { error: 'Invalid or missing provider (must be google or github)' },
      { status: 400 }
    )
  }
  if (!state || state.length < 16) {
    return NextResponse.json(
      { error: 'Invalid or missing state' },
      { status: 400 }
    )
  }

  // Mark this OAuth flow as VS Code-initiated. /auth/confirm checks this
  // cookie and redirects to the vscode:// URI handler instead of /dashboard.
  const cookieStore = await cookies()
  cookieStore.set({
    name: 'flowcraft_vscode_oauth',
    value: JSON.stringify({ state, provider }),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  })

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as 'google' | 'github',
    options: {
      redirectTo: getConfirmURL(),
      ...(provider === 'google'
        ? { queryParams: { access_type: 'offline', prompt: 'consent' } }
        : {}),
    },
  })

  if (error || !data?.url) {
    cookieStore.delete('flowcraft_vscode_oauth')
    return NextResponse.json(
      { error: error?.message ?? 'OAuth init failed' },
      { status: 500 }
    )
  }

  return NextResponse.redirect(data.url)
}
