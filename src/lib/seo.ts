import type { Metadata } from 'next'

export const SITE_URL = 'https://flowcraft.app'
export const SITE_NAME = 'FlowCraft'
export const TWITTER_HANDLE = '@flowcraftapp'

export const DEFAULT_OG = {
  siteName: SITE_NAME,
  image: `${SITE_URL}/opengraph-image`,
  twitterHandle: TWITTER_HANDLE,
}

export function buildCanonical(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalized === '/' ? '' : normalized}`
}

type BuildMetadataInput = {
  title: string
  description: string
  path: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  keywords?: string[]
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  type = 'website',
  publishedTime,
  keywords,
}: BuildMetadataInput): Metadata {
  const canonical = buildCanonical(path)
  const ogImage = image ?? DEFAULT_OG.image

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: DEFAULT_OG.siteName,
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: DEFAULT_OG.twitterHandle,
    },
  }
}
