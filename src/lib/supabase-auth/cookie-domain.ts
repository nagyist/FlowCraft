/**
 * Returns the cookie `domain` to use for Supabase auth cookies so the session
 * is shared across subdomains (e.g. flowcraft.app and app.flowcraft.app).
 *
 * Returns undefined on localhost or when NEXT_PUBLIC_ROOT_DOMAIN is unset —
 * in that case cookies fall back to the exact request host, which is the
 * correct behavior for local dev and preview deployments on *.vercel.app.
 */
export function getAuthCookieDomain(): string | undefined {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  if (!root) return undefined
  const host = root.replace(/^https?:\/\//, '').replace(/\/.*$/, '').split(':')[0]
  if (!host || host === 'localhost' || !host.includes('.')) return undefined
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return undefined
  return host.startsWith('.') ? host : `.${host}`
}
