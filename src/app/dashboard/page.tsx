import Link from 'next/link'
import { GET as _getDiagrams } from '@/app/api/get-diagrams/route'
import { GET as _getShares } from '@/app/api/shares/route'
import { Metadata } from 'next'
import { SharedDiagramResult } from '@/lib/utils'
import { createClient } from '@/lib/supabase-auth/server'
import { redirect } from 'next/navigation'
import { cn } from '@/lib/utils'

const errorMessagePage =
  '/error?message=There was an error getting your user data. Please contact support.'

export const metadata: Metadata = {
  title: 'Dashboard - FlowCraft',
  description: 'Manage your diagrams, creations, and shared projects.',
}

async function getDiagrams() {
  const mockRequest = new Request('http://localhost:3000/api/get-diagrams', {
    method: 'GET',
  })
  const data = await _getDiagrams(mockRequest as any)
  if (data.status === 200) {
    const result = await data.json()
    return { diagrams: result.diagrams }
  }
  return { diagrams: [] }
}

async function getShares() {
  const data = await _getShares()
  if (data.status === 200) {
    const result = await data.json()
    return { shares: result.shares }
  }
  return { shares: [] }
}

async function getUserDataFromTable(userId: string, email: string) {
  const sbClient = await createClient()
  const { data: userData, error } = await sbClient
    .from('users')
    .select('*')
    .eq('user_id', userId)

  if (error || userData.length === 0) {
    const { data: insertedUserData, error: insertError } = await sbClient
      .from('users')
      .insert([
        {
          user_id: userId,
          email,
          plan: '',
          subscribed: false,
          date_subscribed: null,
          date_cancelled: null,
        },
      ])
      .select('*')

    if (insertError || insertedUserData.length === 0) return { user: null }
    return { user: insertedUserData[0] }
  }
  return { user: userData[0] }
}

export default async function Dashboard() {
  const sbClient = await createClient()
  const { data: authData, error } = await sbClient.auth.getUser()

  if (error || authData?.user === null) return redirect('/login')

  if (!authData?.user?.id || !authData?.user?.email) {
    return redirect(errorMessagePage)
  }

  const [diagramsData, sharesData, userDataResult] = await Promise.all([
    getDiagrams(),
    getShares(),
    getUserDataFromTable(authData.user.id, authData.user.email),
  ])

  const { diagrams } = diagramsData
  const { shares } = sharesData
  const { user } = userDataResult

  if (!user) return redirect(errorMessagePage)

  const remaining = user.subscribed
    ? '∞'
    : Math.max((user.free_limit || 5) - (user.diagrams_created || 0), 0)

  const stats = [
    { name: 'Total drafts', value: diagrams.length.toString() },
    { name: 'Active shares', value: shares.length.toString() },
    {
      name: 'Flow diagrams',
      value: diagrams
        .filter((d: any) => d.type === 'Flow Diagram')
        .length.toString(),
    },
    {
      name: user.subscribed ? 'Pro access' : 'Drafts left',
      value: remaining.toString(),
    },
  ]

  const sortedDiagrams = [...diagrams].sort(
    (a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  const displayName =
    (authData.user.user_metadata?.display_name as string | undefined) ||
    authData.user.email?.split('@')[0] ||
    'Drafter'

  const greetingDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="min-h-screen bg-ink pb-24 pt-12 text-paper">
      <div className="pointer-events-none fixed inset-x-0 bottom-0 top-[76px] bg-dot-grid bg-dot-24 opacity-60" />

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-8">
        {/* Sheet header */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-fog">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-paper">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-signal/60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-signal" />
              </span>
              Sheet · Workspace
            </span>
            <span>/</span>
            <span>{greetingDate}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-signal">◆</span>
            <span>
              {user.subscribed ? 'Pro tier' : 'Free tier'} ·{' '}
              <span className="text-paper">{remaining} left</span>
            </span>
          </div>
        </div>

        {/* Welcome block */}
        <section className="mb-12 grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-signal">
              <span className="h-px w-12 bg-signal/50" />
              <span className="text-fog">Welcome back, drafter</span>
            </div>
            <h1 className="mt-6 font-serif text-6xl leading-[0.95] tracking-[-0.01em] text-paper md:text-7xl">
              <span className="text-paper/70">Hello,</span>{' '}
              <span className="italic text-signal">{displayName}</span>
              <span className="text-paper/70">.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/60">
              Your drafting table is ready. Pick up where you left off or start a
              new visual from a sentence.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end">
            {!user.subscribed && (
              <Link
                href="/pricing?sourcePage=dashboard"
                className="group inline-flex items-center gap-2 rounded-sm border border-signal/40 bg-signal/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-signal transition-colors hover:bg-signal/20"
              >
                ★ Upgrade to Pro
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            )}
            <Link
              href="/dashboard/diagrams/new"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-sm bg-signal px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-paper"
            >
              <span className="relative z-10">+ New draft</span>
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1.5">
                →
              </span>
            </Link>
          </div>
        </section>

        {/* Stats strip */}
        <section
          aria-label="Statistics"
          className="mb-16 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-rule bg-rule lg:grid-cols-4"
        >
          {stats.map((s) => (
            <div
              key={s.name}
              className="group relative flex flex-col justify-between gap-8 bg-graphite p-6 transition-colors duration-300 hover:bg-ink"
            >
              <div className="flex items-center justify-end font-mono text-[10px] uppercase tracking-[0.22em]">
                <span className="text-fog">▸</span>
              </div>
              <div>
                <div className="font-serif text-5xl leading-none text-paper md:text-6xl">
                  {s.value}
                </div>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.24em] text-fog">
                  {s.name}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Quick actions */}
        <section className="mb-20">
          <DashSectionHeader title="Quick draft" />
          <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-rule bg-rule md:grid-cols-2">
            <QuickActionCard
              href="/dashboard/diagrams/new"
              title="New diagram"
              desc="Start from a sentence. Flow, sequence, mind map, or knowledge graph."
              primary
            />
            <QuickActionCard
              href="/image-studio"
              title="Image studio"
              desc="Generate editorial illustrations and infographic assets with AI."
            />
          </div>
        </section>

        {/* Two-column: recent + shared */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <DashSectionHeader
              title="Recent drafts"
              link="/dashboard/diagrams"
              linkText="All drafts"
            />

            {sortedDiagrams.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-rule bg-rule sm:grid-cols-2">
                {sortedDiagrams.slice(0, 4).map((diagram: any) => (
                  <DiagramCard key={diagram.id} diagram={diagram} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No drafts yet"
                desc="Your first diagram is one sentence away."
                cta={{ href: '/dashboard/diagrams/new', label: 'Start drafting' }}
              />
            )}
          </div>

          <div className="lg:col-span-4">
            <DashSectionHeader
              title="Shared with you"
              link="/dashboard/all-shared"
              linkText="All shares"
            />

            <div className="mt-8 space-y-3">
              {shares.length > 0 ? (
                shares
                  .slice(0, 3)
                  .map((share: SharedDiagramResult) => (
                    <SharedDiagramCard
                      key={share.id}
                      share={share}
                      baseUrl={process.env.NEXT_PUBLIC_BASE_URL || ''}
                    />
                  ))
              ) : (
                <div className="rounded-sm border border-dashed border-rule bg-graphite/40 p-6 text-center">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-fog">
                    No shared drafts yet
                  </p>
                </div>
              )}

              <Link
                href="/dashboard/showcase"
                className="group relative block overflow-hidden rounded-sm border border-rule bg-graphite p-6 transition-colors hover:border-signal/40"
              >
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-signal/10 blur-3xl transition-opacity group-hover:opacity-80" />
                <div className="relative">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-signal">
                    Addendum · Showcase
                  </div>
                  <h3 className="mt-3 font-serif text-2xl text-paper">
                    See what others
                    <br />
                    are <span className="italic text-signal">drafting</span>.
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-paper/60">
                    Browse the community gallery for inspiration.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-paper transition-colors group-hover:text-signal">
                    <span className="h-px w-6 bg-current" />
                    Browse
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function DashSectionHeader({
  title,
  link,
  linkText = 'View all',
}: {
  title: string
  link?: string
  linkText?: string
}) {
  return (
    <div className="flex items-end justify-between border-b border-rule pb-4">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-signal">
          {title}
        </div>
        <h2 className="mt-2 font-serif text-3xl text-paper md:text-4xl">
          {title}
        </h2>
      </div>
      {link && (
        <Link
          href={link}
          className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-fog transition-colors hover:text-signal"
        >
          {linkText}
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      )}
    </div>
  )
}

function QuickActionCard({
  href,
  title,
  desc,
  primary,
}: {
  href: string
  title: string
  desc: string
  primary?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col justify-between gap-16 overflow-hidden p-8 transition-colors duration-300',
        primary
          ? 'bg-signal text-ink hover:bg-paper'
          : 'bg-graphite text-paper hover:bg-ink',
      )}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 opacity-40',
          primary ? '' : 'bg-dot-grid bg-dot-24',
        )}
      />
      <div className="relative flex items-center justify-end font-mono text-[10px] uppercase tracking-[0.22em]">
        <span
          className={cn(
            'transition-transform duration-300 group-hover:translate-x-1',
            primary ? 'text-ink' : 'text-fog group-hover:text-signal',
          )}
        >
          →
        </span>
      </div>
      <div className="relative">
        <h3
          className={cn(
            'font-serif text-4xl leading-none md:text-5xl',
            primary ? 'text-ink' : 'text-paper',
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            'mt-4 max-w-sm text-sm leading-relaxed',
            primary ? 'text-ink/70' : 'text-paper/60',
          )}
        >
          {desc}
        </p>
      </div>
    </Link>
  )
}

function DiagramCard({ diagram }: { diagram: any }) {
  const created = new Date(diagram.created_at)
  return (
    <Link
      href={`/dashboard/diagram/${diagram.id}`}
      className="group relative flex flex-col justify-between gap-6 bg-graphite p-6 transition-colors duration-300 hover:bg-ink"
    >
      <div className="flex items-center justify-end font-mono text-[10px] uppercase tracking-[0.22em]">
        <time className="text-fog" dateTime={diagram.created_at}>
          {created.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </time>
      </div>

      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-fog">
          {diagram.type}
        </div>
        <h3 className="mt-2 line-clamp-2 min-h-[3rem] font-serif text-2xl leading-tight text-paper transition-colors group-hover:text-signal">
          {diagram.title}
        </h3>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-fog transition-colors group-hover:text-signal">
          Open draft
        </span>
        <span className="font-mono text-xs text-fog transition-transform duration-300 group-hover:translate-x-1 group-hover:text-signal">
          →
        </span>
      </div>
    </Link>
  )
}

function SharedDiagramCard({
  share,
  baseUrl,
}: {
  share: SharedDiagramResult
  baseUrl: string
}) {
  return (
    <Link
      href={`${baseUrl}/share/${share.id}`}
      className="group relative block rounded-sm border border-rule bg-graphite p-5 transition-colors hover:border-signal/40"
    >
      <div className="flex items-center justify-end font-mono text-[10px] uppercase tracking-[0.22em]">
        <span className="text-fog">
          {new Date(share.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
      <h3 className="mt-3 font-serif text-xl leading-tight text-paper transition-colors group-hover:text-signal">
        {share.title}
      </h3>
      <div className="mt-4 flex items-center justify-between border-t border-rule pt-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-fog">
          Invite
        </span>
        <code className="rounded-sm border border-rule bg-ink px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-paper/80">
          {share.invite_code}
        </code>
      </div>
    </Link>
  )
}

function EmptyState({
  title,
  desc,
  cta,
}: {
  title: string
  desc: string
  cta: { href: string; label: string }
}) {
  return (
    <div className="relative mt-8 overflow-hidden rounded-sm border border-dashed border-rule bg-graphite/40 p-12 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(rgba(196,255,61,0.10) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      />
      <div className="relative">
        <h3 className="font-serif text-3xl text-paper">{title}</h3>
        <p className="mt-3 text-sm text-paper/60">{desc}</p>
        <Link
          href={cta.href}
          className="mt-6 inline-flex items-center gap-2 rounded-sm bg-signal px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-paper"
        >
          {cta.label} →
        </Link>
      </div>
    </div>
  )
}
