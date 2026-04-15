import { createClient } from '@/lib/supabase-auth/server'
import stripe from '@/lib/stripe'
import { NextRequest } from 'next/server'
import type Stripe from 'stripe'

/**
 * GET endpoint to fetch current subscription details
 */
export async function GET() {
  try {
    const supabaseClient = await createClient()
    const { data: userData, error: authError } =
      await supabaseClient.auth.getUser()

    if (authError || !userData?.user) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized - User not authenticated',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    // Fetch user information from the database
    const { data: userInfo, error: dbError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('user_id', userData.user.id)
      .single()

    if (dbError || !userInfo) {
      return new Response(
        JSON.stringify({
          error: 'User not found',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    let planId: string | null = userInfo.plan || null

    // Self-heal: DB says subscribed but plan ID is missing (e.g. webhook missed
    // due to email mismatch, or the post-checkout redirect didn't complete).
    // Look the customer up in Stripe by email and backfill the subscription ID.
    if (!planId && userInfo.subscribed) {
      const email = userData.user.email || userInfo.email
      if (email) {
        try {
          const escapedEmail = email.replace(/'/g, "\\'")
          const customers = await stripe.customers.search({
            query: `email:'${escapedEmail}'`,
            limit: 10,
          })

          for (const customer of customers.data) {
            const subs = await stripe.subscriptions.list({
              customer: customer.id,
              status: 'all',
              limit: 10,
            })
            const recovered = subs.data.find(
              (s) =>
                s.status === 'active' ||
                s.status === 'trialing' ||
                (s.cancel_at_period_end &&
                  s.current_period_end * 1000 > Date.now()),
            )
            if (recovered) {
              planId = recovered.id
              const updateData: Record<string, any> = { plan: recovered.id }
              if (!userInfo.date_subscribed) {
                updateData.date_subscribed = new Date(
                  recovered.created * 1000,
                ).toISOString()
              }
              await supabaseClient
                .from('users')
                .update(updateData)
                .eq('user_id', userData.user.id)
              break
            }
          }
        } catch (searchError) {
          console.error(
            'Error during self-heal subscription lookup:',
            searchError,
          )
        }
      }
    }

    if (!planId) {
      return new Response(
        JSON.stringify({
          subscription: null,
          message: 'No active subscription',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    try {
      const subscription = await stripe.subscriptions.retrieve(planId, {
        expand: ['items.data.price.product'],
      })

      const item = subscription.items.data[0]
      const price = item?.price
      const product = price?.product as Stripe.Product | undefined

      const productName =
        (product && !('deleted' in product && product.deleted) && product.name) ||
        price?.nickname ||
        null

      const interval = price?.recurring?.interval
      const intervalLabel =
        interval === 'month'
          ? 'Monthly'
          : interval === 'year'
            ? 'Annually'
            : interval
              ? `${interval}ly`
              : null

      const planName = productName
        ? intervalLabel
          ? `${productName} (${intervalLabel})`
          : productName
        : null

      return new Response(
        JSON.stringify({
          subscription: {
            id: subscription.id,
            status: subscription.status,
            current_period_end: subscription.current_period_end,
            cancel_at_period_end: subscription.cancel_at_period_end,
            plan: price?.id,
            planName,
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    } catch (stripeError: any) {
      console.error('Error fetching subscription from Stripe:', stripeError)
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch subscription details',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }
  } catch (error: any) {
    console.error('Error in GET /api/subscription:', error)
    return new Response(
      JSON.stringify({
        error: `Internal server error: ${error.message}`,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}

/**
 * POST endpoint to manage subscriptions
 * Supports: cancel, portal
 */
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    const supabaseClient = await createClient()
    const { data: userData, error: authError } =
      await supabaseClient.auth.getUser()

    if (authError || !userData?.user) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized - User not authenticated',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    // Fetch user information from the database
    const { data: userInfo, error: dbError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('user_id', userData.user.id)
      .single()

    if (dbError || !userInfo) {
      return new Response(
        JSON.stringify({
          error: 'User not found',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    // Check if there's a plan ID to work with
    if (!userInfo.plan) {
      return new Response(
        JSON.stringify({
          error: 'No active subscription found',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    // Handle different actions
    if (action === 'cancel') {
      try {
        // Cancel the subscription at period end
        const subscription = await stripe.subscriptions.update(userInfo.plan, {
          cancel_at_period_end: true,
        })

        // Update database
        await supabaseClient
          .from('users')
          .update({
            date_cancelled: new Date(
              subscription.current_period_end * 1000,
            ).toISOString(),
          })
          .eq('user_id', userData.user.id)

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Subscription will be cancelled at period end',
            cancel_at: new Date(subscription.current_period_end * 1000),
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      } catch (stripeError: any) {
        console.error('Error cancelling subscription:', stripeError)
        return new Response(
          JSON.stringify({
            error: `Failed to cancel subscription: ${stripeError.message}`,
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      }
    } else if (action === 'reactivate') {
      try {
        // Reactivate the subscription
        const subscription = await stripe.subscriptions.update(userInfo.plan, {
          cancel_at_period_end: false,
        })

        // Update database
        await supabaseClient
          .from('users')
          .update({
            date_cancelled: null,
          })
          .eq('user_id', userData.user.id)

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Subscription reactivated successfully',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      } catch (stripeError: any) {
        console.error('Error reactivating subscription:', stripeError)
        return new Response(
          JSON.stringify({
            error: `Failed to reactivate subscription: ${stripeError.message}`,
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      }
    } else if (action === 'portal') {
      try {
        // Get the subscription to find the customer ID
        const subscription = await stripe.subscriptions.retrieve(userInfo.plan)

        if (!subscription.customer) {
          return new Response(
            JSON.stringify({
              error: 'No customer found for this subscription',
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }

        const isLocal = process.env.NODE_ENV === 'development'
        const returnUrl = isLocal
          ? 'http://localhost:3000/dashboard/settings'
          : 'https://flowcraft.app/dashboard/settings'

        // Create a portal session
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: subscription.customer as string,
          return_url: returnUrl,
        })

        return new Response(
          JSON.stringify({
            url: portalSession.url,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      } catch (stripeError: any) {
        console.error('Error creating portal session:', stripeError)
        return new Response(
          JSON.stringify({
            error: `Failed to create portal session: ${stripeError.message}`,
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      }
    } else {
      return new Response(
        JSON.stringify({
          error: 'Invalid action',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }
  } catch (error: any) {
    console.error('Error in POST /api/subscription:', error)
    return new Response(
      JSON.stringify({
        error: `Internal server error: ${error.message}`,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
