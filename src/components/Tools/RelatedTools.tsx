import Link from 'next/link'
import { ArrowUpRightIcon } from '@heroicons/react/20/solid'
import type { ToolPage } from '@/lib/tools/types'

export default function RelatedTools({ tools }: { tools: ToolPage[] }) {
  if (tools.length === 0) return null

  return (
    <section className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
          Related AI diagram tools
        </h2>
        <p className="mt-2 text-base text-gray-600">
          Try another free generator from FlowCraft.
        </p>
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/tools/${t.slug}`}
                className="group flex h-full flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-900 hover:shadow-md"
              >
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {t.h1 ?? t.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">
                    {t.meta_description}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-gray-900">
                  Open tool
                  <ArrowUpRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
