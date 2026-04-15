# Stripe-Sourced Pricing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded prices on `/pricing` and `/dashboard/pricing` with values fetched from the Stripe API, cached via Next.js ISR.

**Architecture:** A new server-only utility `src/lib/pricing.ts` retrieves four configured Stripe prices in parallel, formats them, and merges them into static tier metadata. Both pricing pages become server components with `revalidate = 3600`, passing the merged tiers as props into the existing client `PricingTemplate`. Teams remains fully hardcoded. On any Stripe failure, the utility falls back to static values so the page never breaks.

**Tech Stack:** Next.js 15 App Router (Server Components + ISR), TypeScript, existing `stripe` SDK (`src/lib/stripe.ts`), existing `@stripe/stripe-js` for client checkout.

**Spec:** `docs/superpowers/specs/2026-04-14-stripe-pricing-api-design.md`

**No test framework is configured in this project (no jest/vitest).** Verification for each task is lint + typecheck + manual validation in the browser. Automated tests are out of scope for this plan.

---

## File Structure

- **Create:** `FlowCraft/src/lib/pricing.ts` — exports `PricingTier` type, `staticTiers` fallback, `fetchPricingTiers()`.
- **Delete:** `FlowCraft/src/components/Pricing/Pricing.utils.ts` — `tiers` and `DiagramsAllowed` move into `pricing.ts`; `frequencies` is dead code (verified: no consumers). The file has no remaining purpose.
- **Modify:** `FlowCraft/src/components/Pricing/Pricing.tsx` — accept `tiers` as a prop instead of importing it.
- **Modify:** `FlowCraft/src/app/pricing/page.tsx` — convert to server component with ISR; split the `useSearchParams` logic into a new client wrapper.
- **Create:** `FlowCraft/src/app/pricing/PricingContent.tsx` — thin client component that reads `searchParams` and forwards `tiers` into `<PricingTemplate />`.
- **Modify:** `FlowCraft/src/app/dashboard/pricing/page.tsx` — fetch tiers and pass to `<PricingTemplate />`.

All paths below are relative to `FlowCraft/` (the Next.js project root). Run commands from `FlowCraft/` unless stated otherwise.

---

## Task 1: Create `src/lib/pricing.ts`

**Files:**
- Create: `FlowCraft/src/lib/pricing.ts`

- [ ] **Step 1: Write the file**

Create `FlowCraft/src/lib/pricing.ts` with the following content:

```ts
import 'server-only'
import stripe from '@/lib/stripe'

export type PricingTier = {
  name: string
  id: 'tier-hobby' | 'tier-pro' | 'tier-teams'
  href: string
  featured: boolean
  description: string
  price: { monthly: string; annually: string }
  mainFeatures: string[]
  cta: string
}

export const DiagramsAllowed = 20

export const staticTiers: PricingTier[] = [
  {
    name: 'Hobby',
    id: 'tier-hobby',
    href: '/login',
    featured: false,
    description: 'Perfect for individual users',
    price: { monthly: '$8', annually: '$70' },
    mainFeatures: [
      `${DiagramsAllowed} AI-generated Diagrams per month`,
      'Access to Complex Diagrams (UML, Sankey, Mindmaps)',
      'Export and Share',
      'Customer support',
    ],
    cta: 'Get started',
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '/login',
    featured: true,
    description: 'Perfect for professionals',
    price: { monthly: '$15', annually: '$150' },
    mainFeatures: [
      'All Hobby features',
      'Unlimited AI-generated Diagrams',
      'Unlimited Complex Diagrams',
      'Access to new features first',
      'Private diagrams',
      'Priority Support',
    ],
    cta: 'Get started',
  },
  {
    name: 'Teams',
    id: 'tier-teams',
    href: '/login',
    featured: false,
    description: 'For teams and organizations',
    price: { monthly: '$49', annually: '$490' },
    mainFeatures: [
      'All Pro features',
      'Team workspaces',
      'Collaboration tools',
      'Shared diagram library',
      'Admin controls',
      'Dedicated support',
    ],
    cta: 'Contact sales',
  },
]

function formatStripeAmount(
  unitAmount: number | null,
  currency: string,
): string | null {
  if (unitAmount == null) return null
  const dollars = unitAmount / 100
  const isWhole = Number.isInteger(dollars)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(dollars)
}

async function retrievePrice(
  priceId: string | undefined,
): Promise<string | null> {
  if (!priceId) return null
  try {
    const price = await stripe.prices.retrieve(priceId)
    return formatStripeAmount(price.unit_amount, price.currency)
  } catch (err) {
    console.error(`[pricing] Failed to retrieve Stripe price ${priceId}:`, err)
    return null
  }
}

export async function fetchPricingTiers(): Promise<PricingTier[]> {
  try {
    const [hobbyMonthly, hobbyYearly, proMonthly, proYearly] = await Promise.all(
      [
        retrievePrice(process.env.STRIPE_HOBBY_MONTHLY_PLAN_ID),
        retrievePrice(process.env.STRIPE_HOBBY_YEARLY_PLAN_ID),
        retrievePrice(process.env.STRIPE_PRO_MONTHLY_PLAN_ID),
        retrievePrice(process.env.STRIPE_PRO_YEARLY_PLAN_ID),
      ],
    )

    return staticTiers.map((tier) => {
      if (tier.id === 'tier-hobby') {
        return {
          ...tier,
          price: {
            monthly: hobbyMonthly ?? tier.price.monthly,
            annually: hobbyYearly ?? tier.price.annually,
          },
        }
      }
      if (tier.id === 'tier-pro') {
        return {
          ...tier,
          price: {
            monthly: proMonthly ?? tier.price.monthly,
            annually: proYearly ?? tier.price.annually,
          },
        }
      }
      return tier
    })
  } catch (err) {
    console.error('[pricing] fetchPricingTiers failed, using static fallback:', err)
    return staticTiers
  }
}
```

Notes:
- `import 'server-only'` prevents this module from being bundled into any client component.
- Each price is retrieved in its own try/catch so one bad env var doesn't nuke the others — the bad one falls back to static, the others use live values.
- `formatStripeAmount` uses the currency returned by Stripe, so if the Stripe dashboard uses USD we get `$10`; if ever changed to another currency the formatting still works.
- `staticTiers` lives here rather than in `Pricing.utils.ts` so the tier shape, fallback data, and fetch logic are all in one file.

- [ ] **Step 2: Typecheck and lint**

Run from `FlowCraft/`:
```bash
pnpm lint
```
Expected: no errors in `src/lib/pricing.ts`. If lint flags `console.error`, leave it — errors here must surface to server logs.

- [ ] **Step 3: Commit**

```bash
cd FlowCraft
git add src/lib/pricing.ts
git commit -m "feat(pricing): add server utility to fetch tiers from Stripe"
```

---

## Task 2: Delete `src/components/Pricing/Pricing.utils.ts`

`tiers` and `DiagramsAllowed` now live in `src/lib/pricing.ts`. `frequencies` has no consumers (verified with grep). The file can be deleted outright.

**Files:**
- Delete: `FlowCraft/src/components/Pricing/Pricing.utils.ts`

- [ ] **Step 1: Confirm no other files import from `Pricing.utils` besides `Pricing.tsx`**

Run from `FlowCraft/`:
```bash
grep -rn "Pricing.utils" src || true
```

Expected: only `src/components/Pricing/Pricing.tsx` references it. If any other file does, update the import to `@/lib/pricing` before continuing.

- [ ] **Step 2: Delete the file**

```bash
cd FlowCraft
rm src/components/Pricing/Pricing.utils.ts
```

- [ ] **Step 3: Lint (expected to fail in Pricing.tsx)**

```bash
pnpm lint
```
Expected: fails in `Pricing.tsx` because the import resolves to a nonexistent file. Task 3 fixes it. Do NOT commit yet.

---

## Task 3: Make `Pricing.tsx` accept `tiers` as a prop

**Files:**
- Modify: `FlowCraft/src/components/Pricing/Pricing.tsx`

- [ ] **Step 1: Update the imports block**

In `src/components/Pricing/Pricing.tsx`, replace:
```ts
import { tiers } from './Pricing.utils'
```
with:
```ts
import type { PricingTier } from '@/lib/pricing'
```

Note: `PricingTier` is a type-only import — it does NOT pull the server-only module into the client bundle because TypeScript erases type imports.

- [ ] **Step 2: Add `tiers` to the component props**

Find the component signature (around line 30):
```ts
export default function PricingTemplate({
  sourcePage,
  shouldGoToCheckout,
}: {
  sourcePage: PricingPageSource
  shouldGoToCheckout?: boolean
}) {
```

Replace it with:
```ts
export default function PricingTemplate({
  sourcePage,
  shouldGoToCheckout,
  tiers,
}: {
  sourcePage: PricingPageSource
  shouldGoToCheckout?: boolean
  tiers: PricingTier[]
}) {
```

- [ ] **Step 3: Verify `tiers` is still referenced the same way in the render**

The existing `tiers.map((tier) => ...)` around line 199 now reads the prop. No change needed there.

- [ ] **Step 4: Fix the `handleGoingToCheckout` type**

The current call site on line ~261 passes `tier.id as 'tier-hobby' | 'tier-pro'`. Since `PricingTier['id']` is now `'tier-hobby' | 'tier-pro' | 'tier-teams'` and the surrounding branch excludes `tier-teams`, the cast is still correct. No change needed.

- [ ] **Step 5: Lint**

```bash
pnpm lint
```
Expected: lint passes for `Pricing.tsx` and `Pricing.utils.ts`. Callers (`pricing/page.tsx`, `dashboard/pricing/page.tsx`) will now fail because they don't pass `tiers`. Next tasks fix them.

---

## Task 4: Convert `/pricing` to a Server Component with ISR

The current page is `'use client'` because it uses `useSearchParams`. We split it: a server page that fetches tiers + ISR, and a thin client component that reads search params.

**Files:**
- Create: `FlowCraft/src/app/pricing/PricingContent.tsx`
- Modify: `FlowCraft/src/app/pricing/page.tsx`

- [ ] **Step 1: Create the client wrapper**

Create `FlowCraft/src/app/pricing/PricingContent.tsx`:

```tsx
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
```

- [ ] **Step 2: Rewrite `src/app/pricing/page.tsx` as a Server Component**

Replace the entire contents of `FlowCraft/src/app/pricing/page.tsx` with:

```tsx
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
```

Notes:
- `export const revalidate = 3600` gives us ISR with a 1-hour window.
- The Suspense boundary is required because `PricingContent` uses `useSearchParams()`.
- `PageWithNavbar` and `FAQs` must be compatible with being rendered from a Server Component (they already are, since they're used elsewhere from server components).

- [ ] **Step 3: Lint**

```bash
pnpm lint
```
Expected: passes for all three files touched so far in this task. `dashboard/pricing/page.tsx` still fails — next task fixes it.

- [ ] **Step 4: Commit work in progress**

```bash
cd FlowCraft
git add -u src/components/Pricing/Pricing.utils.ts
git add src/components/Pricing/Pricing.tsx src/app/pricing/page.tsx src/app/pricing/PricingContent.tsx
git commit -m "feat(pricing): wire /pricing to Stripe-fetched tiers with ISR"
```

---

## Task 5: Wire `/dashboard/pricing` to fetched tiers

**Files:**
- Modify: `FlowCraft/src/app/dashboard/pricing/page.tsx`

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `FlowCraft/src/app/dashboard/pricing/page.tsx` with:

```tsx
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
```

- [ ] **Step 2: Lint**

```bash
pnpm lint
```
Expected: passes for all files.

- [ ] **Step 3: Build check**

```bash
pnpm build
```
Expected: build succeeds. ISR-enabled pages should be reported as "ISR" / revalidate 3600 in the Next.js build output.

If the build fails because `STRIPE_SECRET_KEY` isn't set in the build environment, you have two options:
  a) Set a placeholder `STRIPE_SECRET_KEY` for the build so `src/lib/stripe.ts` doesn't throw at import time; `fetchPricingTiers()` will then fail at runtime and fall back to `staticTiers`.
  b) Rely on ISR to regenerate on the first real request in production where the real env var is present. Vercel deployments already have these env vars set, so this is a dev-only concern.

- [ ] **Step 4: Commit**

```bash
cd FlowCraft
git add src/app/dashboard/pricing/page.tsx
git commit -m "feat(pricing): wire /dashboard/pricing to Stripe-fetched tiers with ISR"
```

---

## Task 6: Manual verification

**Files:** none (verification only)

- [ ] **Step 1: Start dev server**

```bash
cd FlowCraft
pnpm dev
```

Ensure `.env` has real values for:
- `STRIPE_SECRET_KEY`
- `STRIPE_HOBBY_MONTHLY_PLAN_ID`
- `STRIPE_HOBBY_YEARLY_PLAN_ID`
- `STRIPE_PRO_MONTHLY_PLAN_ID`
- `STRIPE_PRO_YEARLY_PLAN_ID`

- [ ] **Step 2: Confirm `/pricing` shows live Stripe values**

Open `http://localhost:3000/pricing`. Cross-check Hobby and Pro monthly + annual prices against the Stripe dashboard (Products → Prices). Teams should still show `$49 / $490` with "Contact sales" CTA.

Toggle the monthly/annual switch — annual values should match the yearly prices configured in Stripe.

- [ ] **Step 3: Confirm `/dashboard/pricing` shows the same live values**

Log in, go to `/dashboard/pricing`, confirm Hobby + Pro prices match Stripe. Click "Get started" on one tier — should redirect to Stripe Checkout with the correct price.

- [ ] **Step 4: Confirm fallback behavior**

Temporarily set one env var to an invalid price ID, e.g.:
```bash
STRIPE_HOBBY_MONTHLY_PLAN_ID=price_doesnotexist pnpm dev
```

Reload `/pricing`. The Hobby monthly should fall back to `$8` (the static default) while other prices remain live. Server logs should contain `[pricing] Failed to retrieve Stripe price price_doesnotexist:` with the Stripe error.

Restore the real env var.

- [ ] **Step 5: Confirm ISR**

Stop the dev server and run:
```bash
pnpm build && pnpm start
```

Open `/pricing`. Change a Hobby price in Stripe dashboard. Reload within the hour — the page should show the old cached value. Wait past the hour (or restart `pnpm start` to clear the cache) — new value appears.

This step is optional for local dev but should be verified once before shipping.

- [ ] **Step 6: Final commit if any small tweaks were needed during verification**

If verification surfaced small issues (a typo, a prop mismatch), fix and commit. Otherwise, no commit needed for this task.

---

## Done

- `/pricing` and `/dashboard/pricing` render with live Stripe prices, cached 1h.
- Teams tier unchanged.
- Stripe API failures fall back to static values; the page never hard-fails.
