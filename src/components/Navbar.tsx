'use client'

import { useEffect, useState } from 'react'
import NavbarClient, { type NavbarAuth } from './NavbarClient'
import { createClient } from '@/lib/supabase-auth/client'

const EMPTY_AUTH: NavbarAuth = {
  isAuthenticated: false,
  userName: '',
  userEmail: '',
  isSubscribed: false,
}

export default function Navbar() {
  const [auth, setAuth] = useState<NavbarAuth>(EMPTY_AUTH)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      if (cancelled || error || !data.user) return

      const email = data.user.email || ''
      const displayName = data.user.user_metadata?.display_name as
        | string
        | undefined

      let isSubscribed = false
      try {
        const { data: userRow } = await supabase
          .from('users')
          .select('subscribed')
          .eq('user_id', data.user.id)
          .maybeSingle()
        isSubscribed = Boolean(userRow?.subscribed)
      } catch {
        // leave false
      }

      if (!cancelled) {
        setAuth({
          isAuthenticated: true,
          userEmail: email,
          userName: displayName || email.split('@')[0] || 'User',
          isSubscribed,
        })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return <NavbarClient auth={auth} />
}
