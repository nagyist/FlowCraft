import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/20/solid'

export default function ToolCtaFooter({ title }: { title: string }) {
  return (
    <section className="bg-gray-900 text-white">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Create your own with {title} — free
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
          Sign up and get 3 AI generations on the house. Export to SVG, PNG, or
          share a public link.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
          >
            Start creating free
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3 text-sm font-semibold text-white transition-colors hover:border-white/60"
          >
            See pricing
          </Link>
        </div>
      </div>
    </section>
  )
}
