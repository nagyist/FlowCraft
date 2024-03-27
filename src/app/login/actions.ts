'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase-auth/server'
import { AuthUser } from '@supabase/supabase-js'

const getURL = () => {
  const baseRoute = 'auth/confirm'
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000'
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`

  url = `${url}${baseRoute}`

  return url
}

export async function login(formData: FormData) {
  const supabase = createClient()

  console.log('login', formData.get('email'), formData.get('password'))

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: userData, error } = await supabase.auth.signInWithPassword(data)

  console.log('---> Error during Login', error)

  if (error) {
    return { error: 'Invalid login credentials' }
  }

  // create a user in supabase DB if it doesn't exist
  await createOrUpdateUserInDB(supabase, userData.user)

  revalidatePath('/dashboard')
  return redirect('/dashboard')
}

async function createOrUpdateUserInDB(supabaseClient: any, userData: AuthUser) {
  const { error: dbError } = await supabaseClient.from('users').upsert({
    user_id: userData.id,
    email: userData.email,
  })

  if (dbError) {
    console.error('Error during user creation:', dbError)
  }
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  console.log('Email', data.email)
  console.log('Password', data.password)

  const { data: userData, error } = await supabase.auth.signUp(data)

  console.log('---> Error', error)

  if (error) {
    return { error: error.message }
  }

  if (userData.user) {
    await createOrUpdateUserInDB(supabase, userData.user)
  }

  return {
    success:
      'Signup successful! Please check your email to verify your account.',
  }
}

export async function loginWithGithub() {
  const supabase = createClient()
  const redirectURL = getURL()

  console.log('Redirect URL:', redirectURL)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: redirectURL,
    },
  })

  if (error) {
    console.error('Error during login:', error)
    return { error: 'Error during login' }
  }

  console.log('Data:', data)
  return { success: 'Github Login successful!', data }
}

export async function loginWithGoogle() {
  const supabase = createClient()
  const redirectURL = getURL()

  console.log('Redirect URL:', redirectURL)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectURL,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error('Error during login:', error)
    return { error: 'Error during login' }
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) {
    console.error('Error during user creation:', userError)
  }

  if (userData && userData.user) {
    await createOrUpdateUserInDB(supabase, userData.user)
  }

  return { success: 'Google Login successful!', data }
}
