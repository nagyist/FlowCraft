import { createClient } from '@/lib/supabase-auth/server'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'
import Stripe from 'stripe'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const checkoutSessionId = searchParams.get('session_id')

  if (!checkoutSessionId || !process.env.STRIPE_SECRET_KEY) {
    return redirect('/dashboard')
  }

  const _stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    return redirect('/login')
  }

  const session = await _stripe.checkout.sessions.retrieve(checkoutSessionId)

  if (
    !session ||
    session.payment_status !== 'paid' ||
    session.mode !== 'subscription'
  ) {
    return redirect('/dashboard')
  }

  const userId = data.user.id
  const userEmail = data.user.email

  // Check if user exists in DB
  const { data: existingUser, error: checkUserError } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (checkUserError) {
    console.error('Error checking user', checkUserError)
    return redirect(
      '/error?message=Error checking user! Please contact support.',
    )
  }

  if (!existingUser) {
    // Create user with user_id
    const { error: createUserError } = await supabase.from('users').insert([
      {
        user_id: userId,
        email: userEmail,
        subscribed: true,
        plan: session.subscription,
        date_subscribed: new Date().toISOString(),
      },
    ])

    if (createUserError) {
      console.error('Error creating user', createUserError)
      return redirect(
        '/error?message=Error creating user! Please contact support.',
      )
    }
  } else {
    // Update existing user subscription status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        subscribed: true,
        plan: session.subscription,
        date_subscribed: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating user subscription status', updateError)
      return redirect(
        '/error?message=Error updating user subscription status! Please contact support.',
      )
    }
  }

  return redirect('/dashboard')
}
