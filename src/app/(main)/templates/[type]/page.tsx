import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TEMPLATE_TYPES, TEMPLATE_TYPE_BY_SLUG } from '@/lib/templates/types'
import { listTemplates } from '@/lib/templates/data'

export const revalidate = 86400

export async function generateStaticParams() {
  return TEMPLATE_TYPES.map((t) => ({ type: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>
}): Promise<Metadata> {
  const { type } = await params
  const t = TEMPLATE_TYPE_BY_SLUG[type]
  if (!t) return { title: 'Templates' }
  const url = `https://flowcraft.app/templates/${t.slug}`
  return {
    title: `${t.title} Templates — Free, Editable`,
    description: `${t.blurb} Browse ready-to-use ${t.title.toLowerCase()} templates from FlowCraft.`,
    alternates: { canonical: url },
    openGraph: { title: `${t.title} Templates`, description: t.blurb, url },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params
  const t = TEMPLATE_TYPE_BY_SLUG[type]
  if (!t) notFound()

  const rows = await listTemplates({ type: t.id })

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-10">
        <Link
          href="/templates"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← All templates
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          {t.title} Templates
        </h1>
        <p className="mt-3 max-w-3xl text-base text-slate-600">{t.whenToUse}</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <li key={r.id}>
            <Link
              href={`/templates/${t.slug}/${r.topic_slug}`}
              className="block overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <img
                src={`/api/templates/${r.id}/thumbnail`}
                alt={`${r.topic_title} thumbnail`}
                loading="lazy"
                decoding="async"
                className="h-40 w-full bg-slate-50 object-contain"
              />
              <div className="p-4">
                <div className="text-sm font-medium text-slate-900">
                  {r.topic_title}
                </div>
                <div className="mt-1 line-clamp-2 text-xs text-slate-500">
                  {r.description}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
          No templates yet for this type.
        </div>
      )}

      <div className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
        <Link href="/templates" className="hover:text-slate-900">
          Browse by topic instead →
        </Link>
      </div>
    </main>
  )
}
