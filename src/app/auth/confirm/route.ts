import { type EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase-auth/server'
import { handleSignupTemplate } from '@/lib/templates/handoff'

export async function GET(request: NextRequest) {
  console.log('GET /auth/confirm: ', request.url.toString())
  const { searchParams } = new URL(request.url)

  console.log('GET /auth/confirm SEARCH PARAMS: ', searchParams.toString())

  const isCode = searchParams.get('code')
  const templateId = searchParams.get('template')

  if (isCode) {
    const supabase = await createClient()

    const { data: exchangeData, error } =
      await supabase.auth.exchangeCodeForSession(isCode)

    console.log('GET /auth/confirm: ', error)

    if (!error) {
      // VS Code OAuth bridge: if the sign-in was initiated from the extension
      // (cookie set by /vscode/auth/start), redirect back to the extension's
      // URI handler with the freshly-minted session tokens.
      const cookieStore = await cookies()
      const vscodeCookie = cookieStore.get('flowcraft_vscode_oauth')
      if (vscodeCookie?.value && exchangeData?.session) {
        let parsed: { state?: string } = {}
        try {
          parsed = JSON.parse(vscodeCookie.value)
        } catch {
          // ignore malformed cookie
        }
        if (parsed.state) {
          cookieStore.delete('flowcraft_vscode_oauth')
          const session = exchangeData.session
          const params = new URLSearchParams({
            state: parsed.state,
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: String(session.expires_at ?? ''),
            email: session.user?.email ?? '',
          })
          return NextResponse.redirect(
            `vscode://FlowCraft.flowcraft/auth/callback?${params.toString()}`
          )
        }
      }

      // If the user came from a "Use this template" CTA before signup, clone
      // it into their fresh account and drop them straight into the editor.
      const newDiagramId = await handleSignupTemplate(templateId)
      const dest = newDiagramId
        ? `/dashboard/diagram/${newDiagramId}`
        : '/dashboard'
      return NextResponse.redirect(new URL(dest, request.nextUrl.origin))
    }

    if (error) {
      console.log('GET /auth/confirm: ', error)
      return NextResponse.redirect(new URL('/error', request.nextUrl.origin))
    }
  } else {
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next') ?? '/'

    const redirectTo = request.nextUrl.clone()
    redirectTo.pathname = next
    redirectTo.searchParams.delete('token_hash')
    redirectTo.searchParams.delete('type')

    console.log('GET /auth/confirm Routing to: ', redirectTo.toString())

    if (token_hash && type) {
      const supabase = await createClient()

      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      })
      console.log('GET /auth/confirm: ', error)
      if (!error) {
        // Same template hand-off as the OAuth-code branch above.
        const newDiagramId = await handleSignupTemplate(templateId)
        const dest = newDiagramId
          ? `/dashboard/diagram/${newDiagramId}`
          : '/dashboard'
        return NextResponse.redirect(new URL(dest, request.nextUrl.origin))
      }
    }

    // return the user to an error page with some instructions
    redirectTo.pathname = '/error'
    return NextResponse.redirect(redirectTo)
  }
}
