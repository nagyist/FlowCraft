import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  TEMPLATE_TOPICS,
  TEMPLATE_TOPIC_BY_SLUG,
} from '@/lib/templates/topics'
import { TEMPLATE_TYPES } from '@/lib/templates/types'
import { listTemplates } from '@/lib/templates/data'

export const revalidate = 86400

export async function generateStaticParams() {
  return TEMPLATE_TOPICS.map((t) => ({ topic: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>
}): Promise<Metadata> {
  const { topic } = await params
  const tp = TEMPLATE_TOPIC_BY_SLUG[topic]
  if (!tp) return { title: 'Topic templates' }
  const url = `https://flowcraft.app/templates/topic/${tp.slug}`
  return {
    title: `${tp.title} — Diagram Templates Across All Types`,
    description: `See ${tp.title} as a flowchart, sequence diagram, mind map, and more. ${tp.blurb}`,
    alternates: { canonical: url },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ topic: string }>
}) {
  const { topic } = await params
  const tp = TEMPLATE_TOPIC_BY_SLUG[topic]
  if (!tp) notFound()

  const rows = await listTemplates({ topic: tp.slug })
  const byType = new Map(rows.map((r) => [r.type, r] as const))

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-10">
        <Link
          href="/templates"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← All templates
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          {tp.title} — every diagram type
        </h1>
        <p className="mt-3 max-w-3xl text-base text-slate-600">{tp.blurb}</p>
      </header>

      <ul className="space-y-4">
        {TEMPLATE_TYPES.map((t) => {
          const r = byType.get(t.id)
          if (!r) return null
          return (
            <li key={t.id}>
              <Link
                href={`/templates/${t.slug}/${tp.slug}`}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 sm:flex-row sm:items-center"
              >
                <img
                  src={`/api/templates/${r.id}/thumbnail`}
                  alt={`${r.title} thumbnail`}
                  loading="lazy"
                  decoding="async"
                  className="h-32 w-full shrink-0 rounded-lg bg-slate-50 object-contain sm:w-56"
                />
                <div className="flex-1">
                  <div className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                    {t.title}
                  </div>
                  <div className="mt-1 text-base font-medium text-slate-900">
                    {r.title}
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {r.description}
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
