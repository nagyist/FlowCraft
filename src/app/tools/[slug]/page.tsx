import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { buildMetadata } from '@/lib/seo'
import PageWithNavbar from '@/components/PageWithNavbar'
import ToolHero from '@/components/Tools/ToolHero'
import ToolExampleGallery from '@/components/Tools/ToolExampleGallery'
import ToolBody from '@/components/Tools/ToolBody'
import RelatedTools from '@/components/Tools/RelatedTools'
import ToolStructuredData from '@/components/Tools/ToolStructuredData'
import ToolCtaFooter from '@/components/Tools/ToolCtaFooter'
import {
  getAllToolSlugs,
  getRelatedTools,
  getToolBySlug,
} from '@/lib/tools/loader'

type Params = Promise<{ slug: string }>

export function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { slug } = await params
  const tool = getToolBySlug(slug)
  if (!tool) {
    return { title: 'Tool Not Found' }
  }
  return buildMetadata({
    title: tool.title,
    description: tool.meta_description,
    path: `/tools/${tool.slug}`,
    keywords: tool.keywords,
  })
}

export default async function ToolPage({ params }: { params: Params }) {
  const { slug } = await params
  const tool = getToolBySlug(slug)
  if (!tool) return notFound()

  const related = getRelatedTools(tool.slug, 4)

  return (
    <PageWithNavbar>
      <ToolStructuredData tool={tool} />
      <main className="min-h-screen bg-white pb-4">
        <nav className="mx-auto max-w-6xl px-6 pt-6 lg:px-8">
          <Link
            href="/tools"
            className="group inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            All tools
          </Link>
        </nav>
        <ToolHero tool={tool} />
        <ToolExampleGallery tool={tool} />
        <ToolBody source={tool.body} />
        <ToolCtaFooter title={tool.h1 ?? tool.title} />
        <RelatedTools tools={related} />
      </main>
    </PageWithNavbar>
  )
}
