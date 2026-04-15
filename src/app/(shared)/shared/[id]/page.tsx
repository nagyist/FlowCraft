import SharedDiagramViewer from '@/components/SharedPage/SharedDiagramViewer'
import { createClient } from '@/lib/supabase-auth/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { buildMetadata, buildCanonical } from '@/lib/seo'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('shareable_links')
      .select('title, type')
      .eq('id', id)
      .maybeSingle()

    if (!data) {
      return buildMetadata({
        title: 'Shared Diagram | FlowCraft',
        description: 'A diagram shared on FlowCraft.',
        path: `/shared/${id}`,
      })
    }

    const title = data.title
      ? `${data.title} | FlowCraft`
      : `Shared ${data.type ?? 'Diagram'} | FlowCraft`

    return buildMetadata({
      title,
      description:
        data.title
          ? `View "${data.title}" — a ${data.type ?? 'diagram'} shared on FlowCraft.`
          : 'A diagram shared on FlowCraft.',
      path: `/shared/${id}`,
    })
  } catch {
    return buildMetadata({
      title: 'Shared Diagram | FlowCraft',
      description: 'A diagram shared on FlowCraft.',
      path: `/shared/${id}`,
    })
  }
}

export default async function SharedDiagramPage({ params }: Props) {
  const { id } = await params
  const supabaseClient = await createClient()

  const { data, error } = await supabaseClient
    .from('shareable_links')
    .select('id, type, data, title, created_at')
    .eq('id', id)

  if (error || !data || data.length === 0) {
    return notFound()
  }

  const link = data[0]

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: buildCanonical('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shared',
        item: buildCanonical('/shared'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: link.title || 'Diagram',
        item: buildCanonical(`/shared/${link.id}`),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SharedDiagramViewer
        type={link.type}
        data={link.data}
        title={link.title}
        createdAt={link.created_at}
      />
    </>
  )
}
