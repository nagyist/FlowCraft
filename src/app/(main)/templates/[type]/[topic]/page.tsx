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
  // [type] is the URL slug, not the id — translate.
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

export default async function Page({
  params,
}: {
  params: Promise<{ type: string; topic: string }>
}) {
  const { type, topic } = await params
  const ctx = await loadByUrl(type, topic)
  if (!ctx) notFound()
  const { row, t, topic: tp } = ctx

  // Sibling templates: same topic, other types.
  const siblings = (await listTemplates({ topic: tp.slug }))
    .filter((s) => s.type !== t.id)
    .slice(0, 13)

  // Related: same category, other topics, this type.
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
    <main className="mx-auto max-w-6xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/templates" className="hover:text-slate-900">
          Templates
        </Link>
        <span className="mx-1">/</span>
        <Link
          href={`/templates/${t.slug}`}
          className="hover:text-slate-900"
        >
          {t.title}
        </Link>
        <span className="mx-1">/</span>
        <span className="text-slate-900">{tp.title}</span>
      </nav>

      <header className="mb-8 flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          {t.title} template
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          {tp.title} {t.title} Template
        </h1>
        <p className="max-w-3xl text-lg text-slate-600">{row.description}</p>
      </header>

      <section className="grid gap-6 md:grid-cols-[1fr_280px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <TemplateRenderer typeId={t.id} data={row.data} />
        </div>
        <aside className="flex flex-col gap-3">
          <form action={useTemplate}>
            <input type="hidden" name="type" value={t.id} />
            <input type="hidden" name="topic" value={tp.slug} />
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-500 hover:to-purple-500"
            >
              Use this template →
            </button>
          </form>
          <Link
            href={`/templates/topic/${tp.slug}`}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:border-slate-300"
          >
            See this topic as other types
          </Link>
        </aside>
      </section>

      <section className="prose prose-slate mt-12 max-w-3xl">
        {row.long_description.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      {siblings.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            View {tp.title} as another diagram type
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {siblings.map((s) => {
              const st = TEMPLATE_TYPES.find((x) => x.id === s.type)
              if (!st) return null
              return (
                <li key={s.id}>
                  <Link
                    href={`/templates/${st.slug}/${s.topic_slug}`}
                    className="block rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    {tp.title} as a {st.title} →
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Related {t.title} templates
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/templates/${t.slug}/${r.topic_slug}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
                >
                  <div className="text-sm font-medium text-slate-900">
                    {r.topic_title}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {r.description}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {row.faqs.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">FAQ</h2>
          <dl className="space-y-4">
            {row.faqs.map((f, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <dt className="font-medium text-slate-900">{f.q}</dt>
                <dd className="mt-2 text-sm text-slate-600">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </main>
  )
}
