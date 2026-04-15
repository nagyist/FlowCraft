import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/dashboard/',
          '/app',
          '/app/',
          '/api',
          '/api/',
          '/login',
          '/sign-up',
          '/signup',
        ],
      },
    ],
    sitemap: 'https://flowcraft.app/sitemap.xml',
    host: 'https://flowcraft.app',
  }
}
