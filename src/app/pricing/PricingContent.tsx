'use client'

import PricingTemplate from '@/components/Pricing/Pricing'
import type { PricingTier } from '@/lib/pricing'
import { useSearchParams } from 'next/navigation'

export default function PricingContent({ tiers }: { tiers: PricingTier[] }) {
  const searchParams = useSearchParams()
  const sourcePage = searchParams.get('sourcePage') as
    | 'landing'
    | 'dashboard'
    | 'mermaid'
    | 'chart'
  return (
    <PricingTemplate
      tiers={tiers}
      sourcePage={sourcePage || 'landing'}
      shouldGoToCheckout={sourcePage !== 'landing'}
    />
  )
}
