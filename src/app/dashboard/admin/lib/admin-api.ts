import { createClient } from '@/lib/supabase-auth/server'

const API_URL = process.env.NEXT_PUBLIC_FLOWCRAFT_API

export async function adminFetch<T>(path: string): Promise<T> {
  const sb = await createClient()
  const { data } = await sb.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('No session')

  const res = await fetch(`${API_URL}/v2/admin${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-FlowCraft-Client': 'web',
      Accept: 'application/json',
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`admin api ${path} -> ${res.status}: ${body}`)
  }
  return (await res.json()) as T
}

export async function isAdmin(): Promise<boolean> {
  try {
    await adminFetch<{ is_admin: boolean }>('/me')
    return true
  } catch {
    return false
  }
}
