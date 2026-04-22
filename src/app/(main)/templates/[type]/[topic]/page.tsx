import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getTemplate,
  listTemplates,
  allTemplatePairs,
} from '@/lib/templates/data'
import { TEMPLATE_TYPE_BY_SLUG, TEMPLATE_TYPES } from '@/lib/templates/types'
import { TEMPLATE_TOPIC_BY_SLUG } from '@/lib/templates/topics'
import { isExcluded } from '@/lib/templates/exclusions'
import { TemplateRenderer } from '@/components/Templates/TemplateRenderer'
import { useTemplate } from './actions'

export const revalidate = 86400

export async function generateStaticParams() {
  return allTemplatePairs().map(({ typeId, topicSlug }) => {
    const t = TEMPLATE_TYPES.find((x) => x.id === typeId)!
    return { type: t.slug, topic: topicSlug }
  })
}

async function loadByUrl(typeSlug: string, topicSlug: string) {
  const t = TEMPLATE_TYPE_BY_SLUG[typeSlug]
  const topic = TEMPLATE_TOPIC_BY_SLUG[topicSlug]
  if (!t || !topic) return null
  if (isExcluded(t.id, topic.slug)) return null
  const row = await getTemplate(t.id, topic.slug)
  return row ? { row, t, topic } : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; topic: string }>
}): Promise<Metadata> {
  const { type, topic } = await params
  const ctx = await loadByUrl(type, topic)
  if (!ctx) return { title: 'Template not found' }
  const url = `https://flowcraft.app/templates/${type}/${topic}`
  return {
    title: ctx.row.title,
    description: ctx.row.description,
    keywords: ctx.row.seo_keywords,
    alternates: { canonical: url },
    openGraph: {
      title: ctx.row.title,
      description: ctx.row.description,
      url,
      type: 'article',
      images: [{ url: `/api/og/template?type=${ctx.t.id}&topic=${topic}` }],
    },
    twitter: { card: 'summary_large_image' },
  }
}

function CornerTicks() {
  return (
    <>
      <span className="pointer-events-none absolute -left-px -top-px h-3 w-3 border-l border-t border-signal" />
      <span className="pointer-events-none absolute -right-px -top-px h-3 w-3 border-r border-t border-signal" />
      <span className="pointer-events-none absolute -bottom-px -left-px h-3 w-3 border-b border-l border-signal" />
      <span className="pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b border-r border-signal" />
    </>
  )
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-signal">
      <span className="h-px w-12 bg-signal/50" />
      <span className="text-fog">{children}</span>
    </div>
  )
}

export default async function Page({
  params,
}: {
  params: Promise<{ type: string; topic: string }>
}) {
  const { type, topic } = await params
  const ctx = await loadByUrl(type, topic)
  if (!ctx) notFound()
  const { row, t, topic: tp } = ctx

  const siblings = (await listTemplates({ topic: tp.slug }))
    .filter((s) => s.type !== t.id)
    .slice(0, 13)

  const related = (await listTemplates({ type: t.id, category: tp.category }))
    .filter((s) => s.topic_slug !== tp.slug)
    .slice(0, 6)

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Templates',
        item: 'https://flowcraft.app/templates',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t.title,
        item: `https://flowcraft.app/templates/${t.slug}`,
      },
      { '@type': 'ListItem', position: 3, name: tp.title },
    ],
  }
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: row.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <main className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      {/* ambient grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-dot-grid bg-dot-24 opacity-60"
      />

      <div className="relative mx-auto max-w-[1280px] px-6 py-16 lg:px-8 lg:py-20">
        {/* sheet header */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-fog">
          <nav className="flex items-center gap-2">
            <Link href="/templates" className="transition-colors hover:text-paper">
              Templates
            </Link>
            <span className="text-rule">/</span>
            <Link
              href={`/templates/${t.slug}`}
              className="transition-colors hover:text-paper"
            >
              {t.title}
            </Link>
            <span className="text-rule">/</span>
            <span className="text-paper">{tp.title}</span>
          </nav>
          <span className="hidden items-center gap-2 md:inline-flex">
            <span className="text-signal">◆</span>
            <span>Specimen · {t.title}</span>
          </span>
        </div>

        {/* headline */}
        <header className="mb-14 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Kicker>{t.title} template</Kicker>
            <h1 className="mt-6 font-serif text-[44px] leading-[0.95] tracking-[-0.01em] text-paper md:text-[72px]">
              {tp.title}
              <span className="text-fog">,</span>
              <br />
              <span className="italic text-signal">as a {t.title.toLowerCase()}</span>
              <span className="text-paper">.</span>
            </h1>
          </div>
          <div className="lg:col-span-4 lg:pt-12">
            <p className="max-w-md text-lg leading-relaxed text-paper/70">
              {row.description}
            </p>
          </div>
        </header>

        {/* specimen + actions */}
        <section className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="relative">
            <CornerTicks />
            <div className="relative overflow-hidden rounded-sm border border-rule bg-graphite">
              <div className="flex items-center justify-between border-b border-rule px-5 py-3 font-mono text-[9px] uppercase tracking-[0.25em] text-fog">
                <span>Title Block</span>
                <span className="text-signal">◆</span>
              </div>
              <div className="relative">
                <TemplateRenderer typeId={t.id} data={row.data} />
              </div>
              <div className="grid grid-cols-3 border-t border-rule font-mono text-[10px] uppercase tracking-[0.2em]">
                <div className="border-r border-rule p-4">
                  <div className="text-fog">Type</div>
                  <div className="mt-1 text-paper">{t.title}</div>
                </div>
                <div className="border-r border-rule p-4">
                  <div className="text-fog">Topic</div>
                  <div className="mt-1 truncate text-paper">{tp.title}</div>
                </div>
                <div className="p-4">
                  <div className="text-fog">Status</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
                    <span className="text-paper">Ready</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-fog">
              <span>Fig. 01</span>
              <span>Reference draft</span>
            </div>
          </div>

          <aside className="flex flex-col gap-3">
            <form action={useTemplate}>
              <input type="hidden" name="type" value={t.id} />
              <input type="hidden" name="topic" value={tp.slug} />
              <button
                type="submit"
                className="group relative inline-flex w-full items-center justify-between gap-3 overflow-hidden rounded-sm bg-signal px-5 py-4 font-mono text-[12px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-paper"
              >
                <span>Use this template</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                  →
                </span>
              </button>
            </form>

            <Link
              href={`/templates/topic/${tp.slug}`}
              className="group inline-flex items-center justify-between gap-3 rounded-sm border border-rule bg-graphite/40 px-5 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-paper/80 transition-colors hover:border-signal/40 hover:text-paper"
            >
              <span>See topic as other types</span>
              <span className="text-fog transition-transform duration-300 group-hover:translate-x-1 group-hover:text-signal">
                ↗
              </span>
            </Link>

            <div className="rounded-sm border border-rule bg-graphite/40 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-fog">
                ▸ Notes
              </div>
              <p className="mt-3 text-sm leading-relaxed text-paper/70">
                Open this specimen in Flowcraft to edit nodes, swap labels, or
                restyle.
              </p>
            </div>
          </aside>
        </section>

        {/* long-form */}
        <section className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Kicker>Overview</Kicker>
            <h2 className="mt-6 font-serif text-4xl leading-[0.95] text-paper md:text-5xl">
              About this
              <br />
              <span className="italic text-signal">specimen.</span>
            </h2>
          </div>
          <div className="space-y-4 text-base leading-relaxed text-paper/70 lg:col-span-7 lg:col-start-6 lg:pt-4">
            {row.long_description.split('\n\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        {/* siblings */}
        {siblings.length > 0 && (
          <section className="mt-24 border-t border-rule pt-16">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <Kicker>Cross-reference</Kicker>
                <h2 className="mt-6 font-serif text-3xl leading-[0.95] text-paper md:text-4xl">
                  {tp.title}
                  <span className="text-fog">,</span>{' '}
                  <span className="italic text-signal">as another form.</span>
                </h2>
              </div>
            </div>
            <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
              {siblings.map((s) => {
                const st = TEMPLATE_TYPES.find((x) => x.id === s.type)
                if (!st) return null
                return (
                  <li key={s.id}>
                    <Link
                      href={`/templates/${st.slug}/${s.topic_slug}`}
                      className="group flex h-full items-center justify-between gap-3 bg-ink p-5 transition-colors duration-300 hover:bg-graphite"
                    >
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-signal">
                          {st.title}
                        </div>
                        <div className="mt-2 text-sm text-paper/85">
                          {tp.title} as a {st.title}
                        </div>
                      </div>
                      <span className="font-mono text-fog transition-all duration-300 group-hover:translate-x-1 group-hover:text-signal">
                        →
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* related */}
        {related.length > 0 && (
          <section className="mt-24 border-t border-rule pt-16">
            <div className="mb-10">
              <Kicker>Related specimens</Kicker>
              <h2 className="mt-6 font-serif text-3xl leading-[0.95] text-paper md:text-4xl">
                More {t.title.toLowerCase()}
                <br />
                <span className="italic text-signal">templates.</span>
              </h2>
            </div>
            <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => (
                <li key={r.id}>
                  <Link
                    href={`/templates/${t.slug}/${r.topic_slug}`}
                    className="group flex h-full flex-col gap-3 bg-ink p-6 transition-colors duration-300 hover:bg-graphite"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-fog">
                      <span>Fig. {String(i + 2).padStart(2, '0')}</span>
                      <span className="transition-transform duration-300 group-hover:rotate-90">
                        ┼
                      </span>
                    </div>
                    <div className="mt-2 font-serif text-xl text-paper">
                      {r.topic_title}
                    </div>
                    <div className="text-xs leading-relaxed text-paper/60">
                      {r.description}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ */}
        {row.faqs.length > 0 && (
          <section className="mt-24 border-t border-rule pt-16">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <Kicker>FAQ</Kicker>
                <h2 className="mt-6 font-serif text-3xl leading-[0.95] text-paper md:text-4xl">
                  Common
                  <br />
                  <span className="italic text-signal">questions.</span>
                </h2>
              </div>
              <dl className="space-y-3 lg:col-span-7 lg:col-start-6">
                {row.faqs.map((f, i) => (
                  <div
                    key={i}
                    className="rounded-sm border border-rule bg-graphite/40 p-6"
                  >
                    <dt className="flex items-baseline gap-3 font-serif text-lg text-paper">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-signal">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{f.q}</span>
                    </dt>
                    <dd className="mt-3 pl-9 text-sm leading-relaxed text-paper/70">
                      {f.a}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
