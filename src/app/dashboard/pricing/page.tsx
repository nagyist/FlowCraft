import FAQs from '@/components/FAQ'
import PricingTemplate from '@/components/Pricing/Pricing'
import { fetchPricingTiers } from '@/lib/pricing'
import { createClient } from '@/lib/supabase-auth/server'
import { redirect } from 'next/navigation'

export const revalidate = 3600

export default async function DashboardPricingSignUp() {
  const sbClient = await createClient()

  const { data: userData, error } = await sbClient.auth.getUser()

  if (error || userData?.user === null) {
    return redirect('/login')
  }

  const tiers = await fetchPricingTiers()

  return (
    <>
      <PricingTemplate
        sourcePage="dashboard"
        shouldGoToCheckout={true}
        tiers={tiers}
      />
      <FAQs />
    </>
  )
}
