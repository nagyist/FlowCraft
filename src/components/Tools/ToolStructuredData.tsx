import { buildCanonical, SITE_NAME, SITE_URL } from '@/lib/seo'
import type { ToolPage } from '@/lib/tools/types'

export default function ToolStructuredData({ tool }: { tool: ToolPage }) {
  const canonical = buildCanonical(`/tools/${tool.slug}`)

  const softwareApp = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.h1 ?? tool.title,
    description: tool.meta_description,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    url: canonical,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  }

  const breadcrumb = {
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
        name: 'Tools',
        item: buildCanonical('/tools'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.h1 ?? tool.title,
        item: canonical,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  )
}
