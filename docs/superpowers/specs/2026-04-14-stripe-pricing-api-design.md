# Stripe-Sourced Pricing on `/pricing`

Date: 2026-04-14

## Problem

The prices shown on `/pricing` (and `/dashboard/pricing`) are hardcoded in `src/components/Pricing/Pricing.utils.ts` and have drifted from the actual prices configured in Stripe. When Stripe prices change, users see stale values until a developer pushes a code change.

## Goal

Pull Hobby and Pro prices (monthly + annual) from the Stripe API at request time, cached via ISR, so the pricing page reflects the source of truth in Stripe without a redeploy.

## Non-goals

- Not changing the Teams tier. It continues to show hardcoded `$49 / $490` with a "Contact sales" CTA.
- Not changing the checkout flow. `/api/checkout-session` already resolves the correct Stripe price ID server-side from env vars; that stays as-is.
- Not building an admin UI to edit prices. Stripe is the editor.
- Not fetching feature lists, descriptions, or CTA copy from Stripe — those remain in code.

## Approach

Server-render `/pricing` with Incremental Static Regeneration. A new server utility fetches the four Stripe prices in parallel on the server, merges the amounts into static tier metadata, and passes the result as props into the existing client pricing component.

Cache window: `revalidate = 3600` (1 hour). Stripe price changes surface within an hour without a deploy, and we don't hammer the Stripe API.

## Design

### New file: `src/lib/pricing.ts` (server-only)

Exports:

- `type PricingTier` — `{ name, id, href, featured, description, price: { monthly: string, annually: string }, mainFeatures: string[], cta: string }`
- `async function fetchPricingTiers(): Promise<PricingTier[]>`

`fetchPricingTiers()`:

1. Calls `stripe.prices.retrieve()` in parallel for the four env-configured IDs:
   - `STRIPE_HOBBY_MONTHLY_PLAN_ID`
   - `STRIPE_HOBBY_YEARLY_PLAN_ID`
   - `STRIPE_PRO_MONTHLY_PLAN_ID`
   - `STRIPE_PRO_YEARLY_PLAN_ID`
2. Formats each `unit_amount` + `currency` into a display string. For USD: no cents when the amount is a whole-dollar value (`$10`), otherwise two decimals (`$10.50`). Uses `Intl.NumberFormat` with the currency from the Stripe price so it works for non-USD if ever needed.
3. Merges amounts into static tier metadata (see next section) and returns the final `PricingTier[]`.
4. On any thrown error or missing env var, logs the error and returns the static fallback tiers so the page never breaks.

### Refactor `src/components/Pricing/Pricing.utils.ts`

Split into:

- `staticTiers: PricingTier[]` — current hardcoded values, used as the fallback and as the merge base (Teams stays fully hardcoded here).
- `DiagramsAllowed` constant stays where it is.
- The `PricingTier` type is re-exported from `src/lib/pricing.ts` (or defined here and imported from there — whichever keeps the cycle clean; likely define in `pricing.ts` and import here).

### Refactor `src/components/Pricing/Pricing.tsx`

- Accept `tiers: PricingTier[]` as a required prop instead of importing `tiers` from `Pricing.utils`.
- No other behavior changes. Keep `'use client'`, keep the billing toggle, keep the checkout handler.

### Refactor `src/app/pricing/page.tsx` → Server Component

- Remove `'use client'`.
- `export const revalidate = 3600`.
- `export default async function Pricing()` — calls `fetchPricingTiers()`, passes tiers into a thin client wrapper that reads `searchParams` and renders `<PricingTemplate tiers={...} sourcePage={...} shouldGoToCheckout={...} />`.
- The `useSearchParams` + `Suspense` pattern moves into the thin client wrapper (e.g., `PricingContent` stays a client component and receives `tiers` via props).

### Refactor `src/app/dashboard/pricing/page.tsx`

- Already a server component. Add `await fetchPricingTiers()` and pass the result into `<PricingTemplate tiers={...} />`.
- Keep the auth check.

## Error handling

- Stripe errors, missing env vars, or unexpected response shapes → log + fall back to `staticTiers`. The page renders with stale-but-sane values. No error state shown to the user.
- This is consistent with the current behavior (static values are shown today) and avoids a hard failure on the marketing page if Stripe is down.

## Data flow

```
Server page
  └─ fetchPricingTiers()              [cached 1h by Next ISR]
       ├─ stripe.prices.retrieve × 4  [parallel]
       └─ merge with staticTiers
  └─ <PricingContent tiers={...} />   [client, reads searchParams]
       └─ <PricingTemplate tiers={...} />  [existing client UI]
```

## Files changed

- **New**: `src/lib/pricing.ts`
- **Modified**: `src/components/Pricing/Pricing.utils.ts` (split, add type export/import)
- **Modified**: `src/components/Pricing/Pricing.tsx` (accept `tiers` prop)
- **Modified**: `src/app/pricing/page.tsx` (server component with ISR)
- **Modified**: `src/app/dashboard/pricing/page.tsx` (fetch and pass tiers)

## Testing

- Manual: run `pnpm dev`, load `/pricing`, verify prices match Stripe dashboard.
- Manual: temporarily change a price in Stripe, wait up to 1h (or trigger revalidation by redeploying/restarting dev), confirm new price appears.
- Manual: set one of the price ID env vars to an invalid value, confirm page still renders using fallback values and error is logged.
- Manual: verify `/dashboard/pricing` shows the same fetched values and checkout flow still works end-to-end on one plan.
