import FAQs from '@/components/FAQ'
import PageWithNavbar from '@/components/PageWithNavbar'
import { fetchPricingTiers } from '@/lib/pricing'
import { Suspense } from 'react'
import PricingContent from './PricingContent'

export const revalidate = 3600

export default async function Pricing() {
  const tiers = await fetchPricingTiers()

  return (
    <PageWithNavbar>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <PricingContent tiers={tiers} />
      </Suspense>
      <FAQs />
    </PageWithNavbar>
  )
}
